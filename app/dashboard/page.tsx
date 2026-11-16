"use client";
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_SHOPS = [
  {
    shop_id: "SHOP-A",
    shop_name: "WashNora - Shop A (Main Branch)",
    branch_location: "Andheri West, Mumbai",
  },
  {
    shop_id: "SHOP-B",
    shop_name: "WashNora - Shop B (Branch 2)",
    branch_location: "Kamothe, Navi Mumbai",
  },
  {
    shop_id: "SHOP-C",
    shop_name: "WashNora - Shop C (Branch 3)",
    branch_location: "Thane West",
  },
];

export default function LaundryERPApp() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  // UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Multi-Store / Shop States
  const [shopsList, setShopsList] = useState<any[]>(DEFAULT_SHOPS);
  const [currentShopId, setCurrentShopId] = useState<string>("SHOP-A");

  // Search & Filter (Orders)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Invoice States (Search, Filter & Active Preview)
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState<string>("");
  const [invoicePaymentFilter, setInvoicePaymentFilter] =
    useState<string>("All");
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<any>(null);

  // Customer Delivery Preference States (Checkout & Rescheduling)
  const [deliveryOption, setDeliveryOption] = useState<
    "Standard" | "Fast" | "Custom"
  >("Standard");
  const [customDeliveryDate, setCustomDeliveryDate] = useState<string>("");
  const [customDeliveryTime, setCustomDeliveryTime] = useState<string>(
    "10:00 AM - 01:00 PM",
  );
  const [rescheduleOrderTarget, setRescheduleOrderTarget] = useState<any>(null);
  const [rescheduleType, setRescheduleType] = useState<
    "Standard" | "Fast" | "Custom"
  >("Custom");
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>(
    "10:00 AM - 01:00 PM",
  );

  // Popups & Modals
  const [selectedCustomerProfile, setSelectedCustomerProfile] =
    useState<any>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSalaryVisible, setIsSalaryVisible] = useState<boolean>(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] =
    useState<boolean>(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] =
    useState<boolean>(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] =
    useState<boolean>(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);

  const [editingServiceId, setEditingServiceId] = useState<any>(null);
  const [editingStockId, setEditingStockId] = useState<any>(null);

  // Forms
  const [onboardingData, setOnboardingData] = useState<any>({
    name: "",
    phone: "",
    address: "",
    shop_id: "",
  });
  const [newStaff, setNewStaff] = useState<any>({
    name: "",
    designation: "",
    salary: "",
  });
  const [newExpense, setNewExpense] = useState<any>({
    category: "",
    description: "",
    amount: "",
  });
  const [newStock, setNewStock] = useState<any>({
    id: "",
    name: "",
    quantity: "",
    unit: "pcs",
    pricePerUnit: "",
  });
  const [serviceForm, setServiceForm] = useState<any>({ name: "", price: "" });

  // Data
  const [clothCatalog, setClothCatalog] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cod");
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalOrders: 0,
    revenue: 0,
    pendingPickups: 0,
    delivery: 0,
    totalExpenses: 0,
    todayRev: 0,
    todayOrders: 0,
    monthRev: 0,
    monthOrders: 0,
    yearRev: 0,
    yearOrders: 0,
  });
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [stocksList, setStocksList] = useState<any[]>([]);

  // ARYA AI States
  const [aryaState, setAryaState] = useState<
    "dormant" | "listening" | "processing"
  >("dormant");
  const aryaStateRef = useRef(aryaState);
  const recognitionRef = useRef<any>(null);
  const stocksRef = useRef<any[]>(stocksList);
  const ordersRef = useRef<any[]>(ordersList);
  const reportsRef = useRef<any[]>(reportsList);

  const COLORS = [
    "#0d6efd",
    "#198754",
    "#fd7e14",
    "#dc3545",
    "#6f42c1",
    "#20c997",
  ];

  const FAST_DELIVERY_FEE = 50;

  // ================= FIXED MULTI-SHOP & LOCK HELPERS =================
  const isValidShopId = (
    shopId: string | null | undefined,
    list: any[] = shopsList,
  ): boolean => {
    if (!shopId) return false;
    return list.some((s: any) => s.shop_id === shopId);
  };

  const getUserSavedShop = (
    userId: string,
    profileObj?: any,
    list: any[] = shopsList,
  ): string => {
    if (profileObj?.shop_id && isValidShopId(profileObj.shop_id, list)) {
      return profileObj.shop_id;
    }
    if (typeof window !== "undefined" && userId) {
      const saved = localStorage.getItem(`washnora_shop_v2_${userId}`);
      if (saved && isValidShopId(saved, list)) return saved;
    }
    return "";
  };

  const isCustomerShopLocked = (
    userId: string,
    profileObj?: any,
    list: any[] = shopsList,
  ): boolean => {
    const validSavedShop = getUserSavedShop(userId, profileObj, list);
    if (!validSavedShop) return false;

    if (profileObj?.shop_locked === true) return true;
    if (typeof window !== "undefined" && userId) {
      return (
        localStorage.getItem(`washnora_shop_locked_v2_${userId}`) === "true"
      );
    }
    return false;
  };

  const saveUserShopSelection = (
    userId: string,
    shopId: string,
    lockPermanent: boolean,
  ) => {
    if (typeof window !== "undefined" && userId && shopId) {
      localStorage.setItem(`washnora_shop_v2_${userId}`, shopId);
      if (lockPermanent) {
        localStorage.setItem(`washnora_shop_locked_v2_${userId}`, "true");
      }
    }
  };

  const getOrderShopId = (order: any): string => {
    if (!order) return "SHOP-A";
    if (order.shop_id && isValidShopId(order.shop_id)) return order.shop_id;
    const st = order.service_type || "";
    const match = st.match(/\[SHOP:\s*([^\]]+)\]/i);
    if (match) return match[1].trim();
    return order.shop_id || "SHOP-A";
  };

  const getShopNameById = (shopId: string) => {
    if (!shopId) return "Not Selected Yet";
    const found = shopsList.find((s) => s.shop_id === shopId);
    return found ? found.shop_name : shopId;
  };

  const getLocalPaymentOverrides = (): Record<string, any> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("washnora_payment_overrides");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveLocalPaymentOverride = (
    orderId: any,
    status: string,
    paidAmount: number,
    dateStr: string,
    deliveryFee?: number,
    deliveryPref?: string,
  ) => {
    if (typeof window === "undefined") return;
    try {
      const current = getLocalPaymentOverrides();
      const existing = current[String(orderId)] || {};
      current[String(orderId)] = {
        ...existing,
        payment_status: status,
        paid_amount: paidAmount,
        paid_date: dateStr,
        ...(deliveryFee !== undefined ? { delivery_charge: deliveryFee } : {}),
        ...(deliveryPref !== undefined
          ? { delivery_schedule: deliveryPref }
          : {}),
        updated_at_ms: Date.now(),
      };
      localStorage.setItem(
        "washnora_payment_overrides",
        JSON.stringify(current),
      );
    } catch {}
  };

  // ================= DATE, DELIVERY, SCHEDULE & PAYMENT HELPERS =================
  const getLocalYYYYMMDD = (dateInput?: any) => {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getOrderDeliveryCharge = (order: any): number => {
    if (!order) return 0;
    const st = order.service_type || "";
    const matches = [...st.matchAll(/\[DELIVERY:\s*(\d+(\.\d+)?)\]/gi)];
    if (matches.length > 0) {
      return parseFloat(matches[matches.length - 1][1]) || 0;
    }
    if (order.delivery_charge !== undefined && order.delivery_charge !== null) {
      const parsed = parseFloat(order.delivery_charge);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    const overrides = getLocalPaymentOverrides();
    if (overrides[String(order.order_id)]?.delivery_charge !== undefined) {
      return parseFloat(overrides[String(order.order_id)].delivery_charge) || 0;
    }
    return 0;
  };

  const getOrderDeliverySchedule = (order: any): string => {
    if (!order) return "Standard Delivery (48-72 Hrs)";

    const st = order.service_type || "";
    const matches = [...st.matchAll(/\[SCHEDULE:\s*([^\]]+)\]/gi)];
    if (matches.length > 0) {
      return matches[matches.length - 1][1].trim();
    }

    if (
      order.delivery_schedule &&
      order.delivery_schedule !== "Standard Delivery (48-72 Hrs)"
    ) {
      return order.delivery_schedule;
    }

    const overrides = getLocalPaymentOverrides();
    if (overrides[String(order.order_id)]?.delivery_schedule) {
      return overrides[String(order.order_id)].delivery_schedule;
    }

    return order.delivery_schedule || "Standard Delivery (48-72 Hrs)";
  };

  const getOrderPaymentStatus = (order: any): string => {
    if (!order) return "Unpaid";
    const st = order.service_type || "";
    const payMatches = [
      ...st.matchAll(/\[PAYMENT:\s*(Fully Paid|Partially Paid|Unpaid)/gi),
    ];
    if (payMatches.length > 0) {
      return payMatches[payMatches.length - 1][1];
    }

    if (
      order.payment_status &&
      ["Fully Paid", "Partially Paid", "Unpaid"].includes(order.payment_status)
    ) {
      return order.payment_status;
    }
    const overrides = getLocalPaymentOverrides();
    if (overrides[String(order.order_id)]?.payment_status) {
      return overrides[String(order.order_id)].payment_status;
    }

    if (st.includes("[Razorpay:")) return "Fully Paid";
    return "Unpaid";
  };

  const getOrderPaidAmount = (order: any): number => {
    if (!order) return 0;
    const status = getOrderPaymentStatus(order);
    const total = parseFloat(order.total_amount) || 0;

    if (status === "Unpaid") return 0;
    if (status === "Fully Paid") return total;

    const st = order.service_type || "";
    const paidMatches = [...st.matchAll(/PAID:\s*(\d+(\.\d+)?)/gi)];
    if (paidMatches.length > 0) {
      return parseFloat(paidMatches[paidMatches.length - 1][1]) || 0;
    }

    if (order.paid_amount !== undefined && order.paid_amount !== null) {
      const parsed = parseFloat(order.paid_amount);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    const overrides = getLocalPaymentOverrides();
    if (overrides[String(order.order_id)]?.paid_amount !== undefined) {
      return parseFloat(overrides[String(order.order_id)].paid_amount) || 0;
    }

    return 0;
  };

  const getOrderPaymentDateStr = (order: any): string => {
    if (!order) return "";
    const st = order.service_type || "";
    const dateMatches = [...st.matchAll(/DATE:\s*(\d{4}-\d{2}-\d{2})/gi)];
    if (dateMatches.length > 0) {
      return dateMatches[dateMatches.length - 1][1];
    }
    if (order.paid_at) return getLocalYYYYMMDD(order.paid_at);
    const overrides = getLocalPaymentOverrides();
    if (overrides[String(order.order_id)]?.paid_date) {
      return overrides[String(order.order_id)].paid_date;
    }

    if (order.created_at) return getLocalYYYYMMDD(order.created_at);
    return getLocalYYYYMMDD();
  };

  const getCleanServiceDisplay = (serviceTypeStr: string) => {
    if (!serviceTypeStr) return "";
    return serviceTypeStr
      .replace(/\s*\[PAYMENT:[^\]]*\]/gi, "")
      .replace(/\s*\[DELIVERY:[^\]]*\]/gi, "")
      .replace(/\s*\[SCHEDULE:[^\]]*\]/gi, "")
      .replace(/\s*\[SHOP:[^\]]*\]/gi, "")
      .trim();
  };

  // ================= FIXED INVOICE ITEM PARSER =================
  const parseOrderItemsForInvoice = (orderObj: any) => {
    if (!orderObj || !orderObj.service_type) return [];
    const cleaned = orderObj.service_type
      .replace(/\[Razorpay:[^\]]*\]/gi, "")
      .replace(/\[COD\]/gi, "")
      .replace(/\[PAYMENT:[^\]]*\]/gi, "")
      .replace(/\[DELIVERY:[^\]]*\]/gi, "")
      .replace(/\[SCHEDULE:[^\]]*\]/gi, "")
      .replace(/\[SHOP:[^\]]*\]/gi, "")
      .trim();

    if (!cleaned) return [];

    const totalAmt = parseFloat(orderObj.total_amount) || 0;
    const deliveryCharge = getOrderDeliveryCharge(orderObj);
    const orderSubtotal = Math.max(0, totalAmt - deliveryCharge);

    const rawItems = cleaned
      .split(",")
      .map((part: string) => {
        const itemStr = part.trim();
        if (!itemStr) return null;

        const matchWithPrice = itemStr.match(
          /^(.*?)\s*\(x(\d+)\s*@₹?(\d+(\.\d+)?)\)$/i,
        );
        if (matchWithPrice) {
          const name = matchWithPrice[1].trim();
          const qty = parseInt(matchWithPrice[2], 10) || 1;
          const unitPrice = parseFloat(matchWithPrice[3]) || 0;
          return {
            name,
            qty,
            unitPrice,
            total: unitPrice * qty,
          };
        }

        const match = itemStr.match(/^(.*?)\s*\(x(\d+)\)/i);
        const name = match ? match[1].trim() : itemStr;
        const qty = match ? parseInt(match[2], 10) || 1 : 1;

        const catalogMatch = clothCatalog.find(
          (c: any) =>
            c.name?.trim().toLowerCase() === name.toLowerCase() ||
            name.toLowerCase().includes(c.name?.trim().toLowerCase()) ||
            c.name?.trim().toLowerCase().includes(name.toLowerCase()),
        );

        const unitPrice = catalogMatch ? parseFloat(catalogMatch.price) : null;
        return {
          name,
          qty,
          unitPrice,
          total: unitPrice !== null ? unitPrice * qty : null,
        };
      })
      .filter(Boolean);

    const knownSum = rawItems.reduce(
      (acc: number, it: any) => acc + (it.total !== null ? it.total : 0),
      0,
    );
    const unknownItems = rawItems.filter((it: any) => it.unitPrice === null);
    const unknownTotalQty = unknownItems.reduce(
      (acc: number, it: any) => acc + (it.qty || 1),
      0,
    );
    const remainingPool = Math.max(0, orderSubtotal - knownSum);

    return rawItems.map((it: any) => {
      if (it.unitPrice === null) {
        const derivedUnit =
          unknownTotalQty > 0
            ? Math.round((remainingPool / unknownTotalQty) * 100) / 100
            : orderSubtotal;
        return {
          ...it,
          unitPrice: derivedUnit,
          total: Math.round(derivedUnit * it.qty * 100) / 100,
        };
      }
      return it;
    });
  };

  // ================= FIXED CUSTOMER & ADMIN RESCHEDULE HANDLERS =================
  const openRescheduleModal = (order: any) => {
    const currentSched = getOrderDeliverySchedule(order);
    setRescheduleOrderTarget(order);

    const defaultFuture = new Date();
    defaultFuture.setDate(defaultFuture.getDate() + 2);
    setRescheduleDate(getLocalYYYYMMDD(defaultFuture));
    setRescheduleTime("09:00 AM - 12:00 PM");

    if (currentSched.toLowerCase().includes("fast")) {
      setRescheduleType("Fast");
    } else if (currentSched.toLowerCase().includes("custom")) {
      setRescheduleType("Custom");
      const slotMatch = currentSched.match(/\(([^)]+)\)/);
      if (slotMatch && slotMatch[1]) {
        setRescheduleTime(slotMatch[1]);
      }
    } else {
      setRescheduleType("Standard");
    }
  };

  const handleSaveCustomerReschedule = async (e: any) => {
    e.preventDefault();
    if (!rescheduleOrderTarget) return;

    if (rescheduleType === "Custom" && !rescheduleDate) {
      Swal.fire(
        "Select Date",
        "Please choose your preferred delivery date.",
        "warning",
      );
      return;
    }

    const order = rescheduleOrderTarget;
    const currentDeliveryFee = getOrderDeliveryCharge(order);
    const currentTotal = parseFloat(order.total_amount) || 0;
    const baseSubtotal = Math.max(0, currentTotal - currentDeliveryFee);
    const orderShop = getOrderShopId(order);

    let newScheduleLabel = "Standard Delivery (48-72 Hrs)";
    let newDeliveryFee = currentDeliveryFee;

    if (rescheduleType === "Fast") {
      newScheduleLabel = "Fast Express Delivery (Within 24 Hrs)";
      newDeliveryFee = FAST_DELIVERY_FEE;
    } else if (rescheduleType === "Custom") {
      const formattedDate = new Date(
        `${rescheduleDate}T00:00:00`,
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      newScheduleLabel = `Custom Delivery: ${formattedDate} (${rescheduleTime})`;
      if (currentDeliveryFee === FAST_DELIVERY_FEE) {
        newDeliveryFee = 0;
      }
    } else {
      newScheduleLabel = "Standard Delivery (48-72 Hrs)";
      if (currentDeliveryFee === FAST_DELIVERY_FEE) {
        newDeliveryFee = 0;
      }
    }

    const newGrandTotal = baseSubtotal + newDeliveryFee;
    const currentPayStatus = getOrderPaymentStatus(order);
    const currentPaidAmt = getOrderPaidAmount(order);
    const payDateStr = getOrderPaymentDateStr(order) || getLocalYYYYMMDD();

    const cleanBaseService = getCleanServiceDisplay(order.service_type || "");
    const shopTag = `[SHOP: ${orderShop}]`;
    const scheduleTag = `[SCHEDULE: ${newScheduleLabel}]`;
    const deliveryTag = `[DELIVERY: ${newDeliveryFee}]`;
    const paymentTag =
      currentPayStatus === "Unpaid"
        ? `[PAYMENT: Unpaid | PAID: 0 | DATE: ${payDateStr}]`
        : `[PAYMENT: ${currentPayStatus} | PAID: ${currentPaidAmt} | DATE: ${payDateStr}]`;

    const updatedServiceType = `${cleanBaseService} ${shopTag} ${scheduleTag} ${deliveryTag} ${paymentTag}`;

    saveLocalPaymentOverride(
      order.order_id,
      currentPayStatus,
      currentPaidAmt,
      payDateStr,
      newDeliveryFee,
      newScheduleLabel,
    );

    const updatedOrderObj = {
      ...order,
      total_amount: newGrandTotal,
      delivery_charge: newDeliveryFee,
      delivery_schedule: newScheduleLabel,
      service_type: updatedServiceType,
    };

    setOrdersList((prev: any[]) => {
      const nextList = prev.map((o) =>
        String(o.order_id) === String(order.order_id) ? updatedOrderObj : o,
      );
      updateDashboardStats(nextList);
      return nextList;
    });

    if (
      activeInvoiceOrder &&
      String(activeInvoiceOrder.order_id) === String(order.order_id)
    ) {
      setActiveInvoiceOrder(updatedOrderObj);
    }

    setRescheduleOrderTarget(null);

    const { error } = await supabase
      .from("laundry_orders")
      .update({
        total_amount: newGrandTotal,
        delivery_schedule: newScheduleLabel,
        delivery_charge: newDeliveryFee,
        service_type: updatedServiceType,
      })
      .eq("order_id", order.order_id);

    if (error) {
      await supabase
        .from("laundry_orders")
        .update({
          total_amount: newGrandTotal,
          service_type: updatedServiceType,
        })
        .eq("order_id", order.order_id);
    }

    Swal.fire({
      icon: "success",
      title: "Delivery Schedule Updated!",
      text: `New Schedule: ${newScheduleLabel}`,
      timer: 2200,
      showConfirmButton: false,
    });
  };

  // ================= EDIT DELIVERY CHARGES ON INVOICE (STAFF/ADMIN) =================
  const handleUpdateDeliveryCharge = async (order: any) => {
    if (!order) return;
    const currentDelivery = getOrderDeliveryCharge(order);
    const currentGrandTotal = parseFloat(order.total_amount) || 0;
    const baseSubtotal = Math.max(0, currentGrandTotal - currentDelivery);

    const { value: enteredDelivery, isDismissed } = await Swal.fire({
      title: "Edit Pickup & Delivery Charges",
      html: `<p class="text-secondary small mb-2">Items Subtotal: <strong>₹${baseSubtotal}</strong></p>`,
      input: "number",
      inputLabel: "Delivery Charge (₹)  Enter 0 for FREE Delivery",
      inputValue: currentDelivery,
      showCancelButton: true,
      confirmButtonText: "Update Invoice",
      confirmButtonColor: "#0d6efd",
      inputValidator: (value) => {
        const num = parseFloat(value);
        if (value === "" || isNaN(num) || num < 0) {
          return "Please enter 0 or a valid positive delivery amount";
        }
        return null;
      },
    });

    if (isDismissed) return;

    const newDeliveryFee = parseFloat(enteredDelivery) || 0;
    const newGrandTotal = baseSubtotal + newDeliveryFee;
    const currentPayStatus = getOrderPaymentStatus(order);
    const currentPaidAmt = getOrderPaidAmount(order);
    const updatedPaidAmt =
      currentPayStatus === "Fully Paid" ? newGrandTotal : currentPaidAmt;
    const payDateStr = getOrderPaymentDateStr(order) || getLocalYYYYMMDD();
    const currentSchedule = getOrderDeliverySchedule(order);
    const orderShop = getOrderShopId(order);

    const cleanBaseService = getCleanServiceDisplay(order.service_type || "");
    const shopTag = `[SHOP: ${orderShop}]`;
    const scheduleTag = `[SCHEDULE: ${currentSchedule}]`;
    const paymentTag =
      currentPayStatus === "Unpaid"
        ? `[PAYMENT: Unpaid | PAID: 0 | DATE: ${payDateStr}]`
        : `[PAYMENT: ${currentPayStatus} | PAID: ${updatedPaidAmt} | DATE: ${payDateStr}]`;
    const deliveryTag = `[DELIVERY: ${newDeliveryFee}]`;
    const updatedServiceType = `${cleanBaseService} ${shopTag} ${scheduleTag} ${deliveryTag} ${paymentTag}`;

    saveLocalPaymentOverride(
      order.order_id,
      currentPayStatus,
      updatedPaidAmt,
      payDateStr,
      newDeliveryFee,
      currentSchedule,
    );

    const updatedOrderObj = {
      ...order,
      total_amount: newGrandTotal,
      paid_amount: updatedPaidAmt,
      delivery_charge: newDeliveryFee,
      delivery_schedule: currentSchedule,
      service_type: updatedServiceType,
    };

    setOrdersList((prev: any[]) => {
      const nextList = prev.map((o) =>
        String(o.order_id) === String(order.order_id) ? updatedOrderObj : o,
      );
      updateDashboardStats(nextList);
      return nextList;
    });

    if (
      activeInvoiceOrder &&
      String(activeInvoiceOrder.order_id) === String(order.order_id)
    ) {
      setActiveInvoiceOrder(updatedOrderObj);
    }

    const { error } = await supabase
      .from("laundry_orders")
      .update({
        total_amount: newGrandTotal,
        paid_amount: updatedPaidAmt,
        delivery_charge: newDeliveryFee,
        service_type: updatedServiceType,
      })
      .eq("order_id", order.order_id);

    if (error) {
      await supabase
        .from("laundry_orders")
        .update({
          total_amount: newGrandTotal,
          service_type: updatedServiceType,
        })
        .eq("order_id", order.order_id);
    }

    Swal.fire({
      icon: "success",
      title:
        newDeliveryFee === 0
          ? "Delivery set to FREE!"
          : `Delivery Charge ₹${newDeliveryFee} Updated!`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // ================= DASHBOARD & REPORTS REVENUE STATS CALCULATOR =================
  const updateDashboardStats = (orders: any[]) => {
    const todayStr = getLocalYYYYMMDD();
    const monthStr = todayStr.slice(0, 7);
    const yearStr = todayStr.slice(0, 4);

    let revToday = 0,
      revMonth = 0,
      revYear = 0,
      totalRev = 0;
    let ordToday = 0,
      ordMonth = 0,
      ordYear = 0;

    orders.forEach((o: any) => {
      if (o.status !== "Rejected") {
        const createdDateStr = o.created_at
          ? getLocalYYYYMMDD(o.created_at)
          : todayStr;
        if (createdDateStr === todayStr) ordToday++;
        if (createdDateStr.slice(0, 7) === monthStr) ordMonth++;
        if (createdDateStr.slice(0, 4) === yearStr) ordYear++;

        const paidAmt = getOrderPaidAmount(o);
        if (paidAmt > 0) {
          totalRev += paidAmt;
          const payDateStr = getOrderPaymentDateStr(o) || createdDateStr;

          if (payDateStr === todayStr) {
            revToday += paidAmt;
          }
          if (payDateStr.slice(0, 7) === monthStr) {
            revMonth += paidAmt;
          }
          if (payDateStr.slice(0, 4) === yearStr) {
            revYear += paidAmt;
          }
        }
      }
    });

    setDashboardStats((prev: any) => ({
      ...prev,
      totalOrders: orders.length,
      revenue: totalRev,
      pendingPickups: orders.filter(
        (o: any) => o.status === "Pickup" || o.status === "Received",
      ).length,
      delivery: orders.filter((o: any) => o.status === "Out for Delivery")
        .length,
      todayRev: revToday,
      todayOrders: ordToday,
      monthRev: revMonth,
      monthOrders: ordMonth,
      yearRev: revYear,
      yearOrders: ordYear,
    }));
  };

  useEffect(() => {
    aryaStateRef.current = aryaState;
  }, [aryaState]);
  useEffect(() => {
    stocksRef.current = stocksList;
  }, [stocksList]);
  useEffect(() => {
    ordersRef.current = ordersList;
    updateDashboardStats(ordersList);
  }, [ordersList]);
  useEffect(() => {
    reportsRef.current = reportsList;
  }, [reportsList]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) setIsSidebarCollapsed(true);
      else setIsSidebarCollapsed(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userProfile || !currentShopId || shopsList.length === 0) return;

    const activeStoreObj = shopsList.find(
      (s: any) => s.shop_id === currentShopId,
    );
    if (!activeStoreObj) return;

    const checkSubscriptionAndReminders = async () => {
      const now = new Date();
      const subEnd = activeStoreObj.subscription_end
        ? new Date(activeStoreObj.subscription_end)
        : null;
      const isExpired = subEnd ? now.getTime() >= subEnd.getTime() : false;
      const isSuspended = activeStoreObj.status === "Suspended" || isExpired;

      // 1. If Store is Suspended or Time Limit Reached -> Force Logout Admin/Manager & Redirect to /login
      if (
        isSuspended &&
        (userProfile.role === "admin" || userProfile.role === "manager")
      ) {
        const msg =
          activeStoreObj.suspension_reason ||
          "Your subscription has been ended. Please renew to continue the service.";

        await supabase.auth.signOut();
        await Swal.fire({
          icon: "error",
          title: "Subscription Ended / Store Suspended",
          text: msg,
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#dc3545",
          allowOutsideClick: false,
        });
        window.location.href = `/login?suspended=1&msg=${encodeURIComponent(msg)}`;
        return;
      }

      // 2. 7-Day Expiration Warning + Daily 8:00 AM Notification for Admin
      if (
        subEnd &&
        !isSuspended &&
        (userProfile.role === "admin" || userProfile.role === "manager")
      ) {
        const diffDays = Math.ceil(
          (subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays > 0 && diffDays <= 7) {
          const todayKey = `zentech_8am_reminder_${currentShopId}_${getLocalYYYYMMDD(now)}`;
          const isAfter8AM = now.getHours() >= 8;

          if (isAfter8AM && !localStorage.getItem(todayKey)) {
            localStorage.setItem(todayKey, "shown");
            const reminderText = `⚠️ Subscription Reminder: Your store (${activeStoreObj.shop_name}) license expires in ${diffDays} day(s) on ${subEnd.toLocaleString("en-IN")}. Please renew your payment with Zen-Tech to avoid service suspension.`;

            playNotificationSound();
            addNotification(reminderText);
            Swal.fire({
              icon: "warning",
              title: "8:00 AM Subscription Payment Reminder",
              text: reminderText,
              confirmButtonColor: "#0d6efd",
            });
          }
        }
      }
    };

    checkSubscriptionAndReminders();
    const interval = setInterval(checkSubscriptionAndReminders, 15000);

    // Realtime listener: Instantly kicks Admin out if Super Admin clicks "Suspend"
    const shopChannel = supabase
      .channel(`realtime:shops:${currentShopId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shops",
          filter: `shop_id=eq.${currentShopId}`,
        },
        (payload: any) => {
          setShopsList((prev) =>
            prev.map((s) =>
              s.shop_id === payload.new.shop_id ? payload.new : s,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(shopChannel);
    };
  }, [userProfile, currentShopId, shopsList]);

  // Load Store-Specific Data
  const loadShopData = async (profile: any, activeShop: string) => {
    const { data: fetchedServices } = await supabase
      .from("laundry_services")
      .select("*")
      .order("created_at", { ascending: true });
    if (fetchedServices) {
      const shopServices = fetchedServices.filter(
        (s: any) => !s.shop_id || s.shop_id === activeShop,
      );
      setClothCatalog(shopServices.length > 0 ? shopServices : fetchedServices);
    }

    let ordersQuery = supabase
      .from("laundry_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (profile?.role === "user") {
      ordersQuery = ordersQuery.eq("customer_name", profile.full_name);
    }

    const { data: orders } = await ordersQuery;
    if (orders) {
      const filteredByShop =
        profile?.role === "user"
          ? orders
          : orders.filter((o: any) => getOrderShopId(o) === activeShop);
      setOrdersList(filteredByShop);
      setActiveInvoiceOrder(
        filteredByShop.length > 0 ? filteredByShop[0] : null,
      );
      updateDashboardStats(filteredByShop);
    }

    if (profile?.role === "admin" || profile?.role === "manager") {
      if (profile?.role === "admin") {
        const { data: payroll } = await supabase
          .from("staff_payroll")
          .select("*")
          .order("created_at", { ascending: false });
        if (payroll) {
          setPayrollList(
            payroll.filter((p: any) => !p.shop_id || p.shop_id === activeShop),
          );
        }
      }
      const { data: expenses } = await supabase
        .from("business_expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (expenses) {
        const shopExp = expenses.filter(
          (e: any) => !e.shop_id || e.shop_id === activeShop,
        );
        setReportsList(shopExp);
        setDashboardStats((prev: any) => ({
          ...prev,
          totalExpenses: shopExp.reduce(
            (sum: any, exp: any) => sum + parseFloat(exp.amount),
            0,
          ),
        }));
      }
      const { data: stocks } = await supabase
        .from("inventory_stocks")
        .select("*")
        .order("created_at", { ascending: false });
      if (stocks) {
        setStocksList(
          stocks.filter((st: any) => !st.shop_id || st.shop_id === activeShop),
        );
      }
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        window.location.href = "/login";
        return;
      }
      setCurrentUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      let activeShopsList = DEFAULT_SHOPS;
      const { data: dbShops } = await supabase
        .from("shops")
        .select("*")
        .order("created_at", { ascending: true });

      if (dbShops && dbShops.length > 0) {
        // If logged-in user is a Store Admin or Manager, ONLY show stores they own!
        if (profile?.role === "admin" || profile?.role === "manager") {
          const adminEmail = (session.user.email || "").toLowerCase().trim();
          const adminName = (profile?.full_name || "").toLowerCase().trim();
          const assignedShopId = profile?.shop_id || "";

          // 1. Find the primary shop assigned to this Admin
          const primaryShop = dbShops.find(
            (s: any) =>
              s.shop_id === assignedShopId ||
              (s.owner_email &&
                s.owner_email.toLowerCase().trim() === adminEmail) ||
              (adminName &&
                s.owner_name &&
                s.owner_name.toLowerCase().includes(adminName)),
          );

          // 2. Filter dropdown so Admin ONLY sees stores belonging to the same Owner
          const ownedStores = dbShops.filter((s: any) => {
            if (
              s.owner_email &&
              s.owner_email.toLowerCase().trim() === adminEmail
            ) {
              return true;
            }
            if (
              primaryShop?.owner_name &&
              s.owner_name &&
              s.owner_name.toLowerCase().trim() ===
                primaryShop.owner_name.toLowerCase().trim()
            ) {
              return true;
            }
            if (s.shop_id === assignedShopId) {
              return true;
            }
            return false;
          });

          activeShopsList = ownedStores.length > 0 ? ownedStores : [dbShops[0]];
          setShopsList(activeShopsList);
        } else {
          // Regular customers ("user") and Super Admins see all stores
          activeShopsList = dbShops;
          setShopsList(dbShops);
        }
      }

      const savedShop = getUserSavedShop(
        session.user.id,
        profile,
        activeShopsList,
      );
      const locked = isCustomerShopLocked(
        session.user.id,
        profile,
        activeShopsList,
      );
      const activeShopForData = savedShop || activeShopsList[0].shop_id;
      setCurrentShopId(activeShopForData);

      if (profile) {
        setUserProfile({
          ...profile,
          shop_id: locked ? savedShop : "",
          shop_locked: locked,
        });

        if (
          profile.role === "user" &&
          (!profile.full_name || !profile.phone || !profile.address || !locked)
        ) {
          setOnboardingData({
            name: profile.full_name || "",
            phone: profile.phone || "",
            address: profile.address || "",
            shop_id: locked ? savedShop : "",
          });
          setIsOnboardingOpen(true);
        }
      } else {
        await supabase
          .from("profiles")
          .insert([
            { id: session.user.id, role: "user", is_first_login: true },
          ]);
        setUserProfile({
          id: session.user.id,
          role: "user",
          shop_id: "",
          shop_locked: false,
        });
        setOnboardingData({
          name: "",
          phone: "",
          address: "",
          shop_id: "",
        });
        setIsOnboardingOpen(true);
      }

      await loadShopData(profile || { role: "user" }, activeShopForData);

      setTimeout(() => {
        setIsAppLoading(false);
      }, 1200);
    };
    initApp();
  }, []);

  const handleAdminSwitchShop = async (newShopId: string) => {
    setCurrentShopId(newShopId);
    if (currentUser) {
      saveUserShopSelection(currentUser.id, newShopId, false);
      await supabase
        .from("profiles")
        .update({ shop_id: newShopId })
        .eq("id", currentUser.id);
    }
    await loadShopData(userProfile, newShopId);
    Swal.fire({
      icon: "info",
      title: `Switched to ${getShopNameById(newShopId)}`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
    });
  };

  const playNotificationSound = () => {
    const audioEl = document.getElementById(
      "notificationSound",
    ) as HTMLAudioElement;
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    }
  };

  const addNotification = (message: string) => {
    setNotifications((prev: any[]) => [
      {
        id: Date.now() + Math.random(),
        message,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      },
      ...prev,
    ]);
  };

  const getPaymentStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Fully Paid":
        return "bg-success bg-opacity-10 text-success border border-success border-opacity-25";
      case "Partially Paid":
        return "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
      case "Unpaid":
      default:
        return "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
    }
  };

  // ================= CLEAN PREVIEW / DOWNLOAD INVOICE PDF =================
  const handlePreviewInvoice = () => {
    const prevTitle = document.title;
    document.title = "\u200B";
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 600);
  };

  // ================= SEND WHATSAPP INVOICE TO CUSTOMER =================
  const handleSendInvoiceWhatsApp = (order: any) => {
    if (!order) return;

    const rawPhone = (order.customer_phone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      Swal.fire(
        "Invalid Phone Number",
        "Customer phone number is missing or invalid for WhatsApp.",
        "warning",
      );
      return;
    }

    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const items = parseOrderItemsForInvoice(order);
    const itemsText =
      items.length > 0
        ? items
            .map(
              (item: any, idx: number) =>
                `${idx + 1}. ${item.name} (x${item.qty} @₹${item.unitPrice}) - ₹${item.total}`,
            )
            .join("\n")
        : getCleanServiceDisplay(order.service_type);

    const totalAmt = parseFloat(order.total_amount) || 0;
    const deliveryFee = getOrderDeliveryCharge(order);
    const subtotalAmt = Math.max(0, totalAmt - deliveryFee);
    const paidAmt = getOrderPaidAmount(order);
    const balanceAmt = Math.max(0, totalAmt - paidAmt);
    const payStatus = getOrderPaymentStatus(order);
    const deliverySched = getOrderDeliverySchedule(order);
    const shopLabel = getShopNameById(getOrderShopId(order));
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "N/A";

    const message = `*WASHNORA LAUNDRY SERVICES* 🧺
*Store:* ${shopLabel}
*Official Order Invoice: #INV-${order.order_id}*
-----------------------------------------
*Customer:* ${order.customer_name}
*Phone:* ${order.customer_phone}
*Address:* ${order.location}
*Date:* ${orderDate}
*Order Status:* ${order.status}
*Delivery Schedule:* ${deliverySched}
-----------------------------------------
*Ordered Services:*
${itemsText}
-----------------------------------------
*Subtotal:* ₹${subtotalAmt}
*Pickup & Delivery:* ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
*Grand Total:* ₹${totalAmt}
*Amount Paid:* ₹${paidAmt}
*Balance Due:* ₹${balanceAmt}
*Payment Status:* *${payStatus.toUpperCase()}*
-----------------------------------------
Thank you for choosing *WashNora Laundry Services*! ✨
_This invoice is generated by Zen-Tech Systems._`;

    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  // ================= UPDATE PAYMENT STATUS & SYNC REVENUE =================
  const handlePaymentStatusUpdate = async (
    order: any,
    newPayStatus: string,
  ) => {
    const totalAmt = parseFloat(order.total_amount) || 0;
    const deliveryFee = getOrderDeliveryCharge(order);
    const currentSchedule = getOrderDeliverySchedule(order);
    const orderShop = getOrderShopId(order);
    let paidAmt = 0;

    if (newPayStatus === "Fully Paid") {
      paidAmt = totalAmt;
    } else if (newPayStatus === "Partially Paid") {
      const currentPaid = getOrderPaidAmount(order);
      const { value: enteredAmount, isDismissed } = await Swal.fire({
        title: "Partial Payment Received",
        html: `<p class="text-secondary small mb-2">Total Invoice Amount: <strong>₹${totalAmt}</strong></p>`,
        input: "number",
        inputLabel: "Enter Amount Paid So Far (₹)",
        inputValue:
          currentPaid > 0 && currentPaid < totalAmt ? currentPaid : "",
        showCancelButton: true,
        confirmButtonText: "Update Payment",
        confirmButtonColor: "#0d6efd",
        inputValidator: (value) => {
          const num = parseFloat(value);
          if (!value || isNaN(num) || num <= 0) {
            return "Please enter a valid paid amount greater than ₹0";
          }
          if (num >= totalAmt) {
            return "Amount equals or exceeds total. Select 'Fully Paid' instead.";
          }
          return null;
        },
      });

      if (isDismissed) {
        setOrdersList([...ordersList]);
        return;
      }
      paidAmt = parseFloat(enteredAmount);
    } else {
      paidAmt = 0;
    }

    const todayStr = getLocalYYYYMMDD();
    const cleanBaseService = getCleanServiceDisplay(order.service_type || "");
    const shopTag = `[SHOP: ${orderShop}]`;
    const scheduleTag = `[SCHEDULE: ${currentSchedule}]`;
    const deliveryTag = `[DELIVERY: ${deliveryFee}]`;

    const updatedServiceType =
      newPayStatus === "Unpaid"
        ? `${cleanBaseService} ${shopTag} ${scheduleTag} ${deliveryTag} [PAYMENT: Unpaid | PAID: 0 | DATE: ${todayStr}]`
        : `${cleanBaseService} ${shopTag} ${scheduleTag} ${deliveryTag} [PAYMENT: ${newPayStatus} | PAID: ${paidAmt} | DATE: ${todayStr}]`;

    saveLocalPaymentOverride(
      order.order_id,
      newPayStatus,
      paidAmt,
      todayStr,
      deliveryFee,
      currentSchedule,
    );

    const updatedOrderObj = {
      ...order,
      payment_status: newPayStatus,
      paid_amount: paidAmt,
      delivery_charge: deliveryFee,
      delivery_schedule: currentSchedule,
      paid_at: new Date().toISOString(),
      service_type: updatedServiceType,
    };

    setOrdersList((prev: any[]) => {
      const nextList = prev.map((o) =>
        String(o.order_id) === String(order.order_id) ? updatedOrderObj : o,
      );
      updateDashboardStats(nextList);
      return nextList;
    });

    if (
      activeInvoiceOrder &&
      String(activeInvoiceOrder.order_id) === String(order.order_id)
    ) {
      setActiveInvoiceOrder(updatedOrderObj);
    }

    const { error } = await supabase
      .from("laundry_orders")
      .update({
        payment_status: newPayStatus,
        paid_amount: paidAmt,
        service_type: updatedServiceType,
      })
      .eq("order_id", order.order_id);

    if (error) {
      await supabase
        .from("laundry_orders")
        .update({
          service_type: updatedServiceType,
        })
        .eq("order_id", order.order_id);
    }

    Swal.fire({
      icon: "success",
      title:
        newPayStatus === "Unpaid"
          ? "Marked as Unpaid (Revenue Updated)"
          : `₹${paidAmt} Synced to Dashboard & Reports!`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
    });
  };

  // ================= PAYROLL STATUS UPDATE =================
  const handlePayrollStatusUpdate = async (staffId: any, newStatus: string) => {
    const { error } = await supabase
      .from("staff_payroll")
      .update({ status: newStatus })
      .eq("staff_id", staffId);
    if (!error) {
      setPayrollList((prev: any[]) =>
        prev.map((s) =>
          s.staff_id === staffId ? { ...s, status: newStatus } : s,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire("Error", error.message, "error");
    }
  };

  // ================= INVENTORY LOGIC =================
  const openAddStockModal = () => {
    setEditingStockId(null);
    setNewStock({
      id: "",
      name: "",
      quantity: "",
      unit: "pcs",
      pricePerUnit: "",
    });
    setIsAddStockModalOpen(true);
  };

  const openEditStockModal = (stock: any) => {
    setEditingStockId(stock.stock_id);
    setNewStock({
      id: stock.stock_id,
      name: stock.item_name,
      quantity: stock.quantity,
      unit: "pcs",
      pricePerUnit: stock.price_per_unit || "",
    });
    setIsAddStockModalOpen(true);
  };

  const handleStockAdjust = async (stock: any, change: number) => {
    const currentQty = parseFloat(stock.quantity) || 0;
    const newQty = currentQty + change;

    if (newQty < 0) return;

    setStocksList((prev: any[]) =>
      prev.map((s) =>
        s.stock_id === stock.stock_id ? { ...s, quantity: newQty } : s,
      ),
    );

    const { error } = await supabase
      .from("inventory_stocks")
      .update({ quantity: newQty })
      .eq("stock_id", stock.stock_id);

    if (!error) {
      if (change > 0 && stock.price_per_unit > 0) {
        const cost = change * parseFloat(stock.price_per_unit);
        if (cost > 0) {
          const { data: exp } = await supabase
            .from("business_expenses")
            .insert([
              {
                category: "Detergent/Chemicals",
                description: `Auto-restock (+${change}): ${stock.item_name}`,
                amount: cost,
              },
            ])
            .select();

          if (exp) {
            setReportsList((prev: any[]) => [exp[0], ...prev]);
            setDashboardStats((prev: any) => ({
              ...prev,
              totalExpenses: prev.totalExpenses + cost,
            }));
            Swal.fire({
              icon: "info",
              title: `₹${cost} Expense Auto-Logged`,
              toast: true,
              position: "bottom-end",
              showConfirmButton: false,
              timer: 3000,
            });
          }
        }
      }
    }
  };

  const handleStockSet = async (stock: any, newQtyStr: string) => {
    const newQty = parseFloat(newQtyStr);
    const currentQty = parseFloat(stock.quantity) || 0;

    if (isNaN(newQty) || newQty < 0 || newQty === currentQty) return;

    const diff = newQty - currentQty;

    setStocksList((prev: any[]) =>
      prev.map((s) =>
        s.stock_id === stock.stock_id ? { ...s, quantity: newQty } : s,
      ),
    );

    const { error } = await supabase
      .from("inventory_stocks")
      .update({ quantity: newQty })
      .eq("stock_id", stock.stock_id);

    if (!error) {
      if (diff > 0 && stock.price_per_unit > 0) {
        const cost = diff * parseFloat(stock.price_per_unit);
        if (cost > 0) {
          const { data: exp } = await supabase
            .from("business_expenses")
            .insert([
              {
                category: "Detergent/Chemicals",
                description: `Manual-restock (+${diff}): ${stock.item_name}`,
                amount: cost,
              },
            ])
            .select();

          if (exp) {
            setReportsList((prev: any[]) => [exp[0], ...prev]);
            setDashboardStats((prev: any) => ({
              ...prev,
              totalExpenses: prev.totalExpenses + cost,
            }));
            Swal.fire({
              icon: "info",
              title: `₹${cost} Expense Auto-Logged`,
              toast: true,
              position: "bottom-end",
              showConfirmButton: false,
              timer: 3000,
            });
          }
        }
      }
    }
  };

  const handleAddStockSubmit = async (e: any) => {
    e.preventDefault();
    if (editingStockId) {
      const updatePayload: any = {
        item_name: newStock.name,
        price_per_unit: parseFloat(newStock.pricePerUnit),
      };

      if (newStock.id && newStock.id !== editingStockId) {
        updatePayload.stock_id = newStock.id;
      }

      const { data, error } = await supabase
        .from("inventory_stocks")
        .update(updatePayload)
        .eq("stock_id", editingStockId)
        .select();

      if (!error && data) {
        setStocksList((prev: any[]) =>
          prev.map((s) =>
            s.stock_id === editingStockId
              ? {
                  ...s,
                  stock_id: data[0].stock_id,
                  item_name: newStock.name,
                  price_per_unit: parseFloat(newStock.pricePerUnit),
                }
              : s,
          ),
        );
        setIsAddStockModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Stock Updated!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire("Error", error?.message || "Failed to update", "error");
      }
    } else {
      const insertPayload: any = {
        item_name: newStock.name,
        quantity: parseFloat(newStock.quantity),
        unit: "pcs",
        price_per_unit: parseFloat(newStock.pricePerUnit),
      };

      if (newStock.id) {
        insertPayload.stock_id = newStock.id;
      }

      const { data, error } = await supabase
        .from("inventory_stocks")
        .insert([insertPayload])
        .select();

      if (!error && data) {
        setStocksList((prev: any[]) => [data[0], ...prev]);
        const cost =
          parseFloat(newStock.quantity) * parseFloat(newStock.pricePerUnit);
        if (cost > 0) {
          const { data: exp } = await supabase
            .from("business_expenses")
            .insert([
              {
                category: "Detergent/Chemicals",
                description: `Initial Stock: ${newStock.quantity} pcs of ${newStock.name}`,
                amount: cost,
              },
            ])
            .select();
          if (exp) {
            setReportsList((prev) => [exp[0], ...prev]);
            setDashboardStats((prev) => ({
              ...prev,
              totalExpenses: prev.totalExpenses + cost,
            }));
          }
        }
        setNewStock({
          id: "",
          name: "",
          quantity: "",
          unit: "pcs",
          pricePerUnit: "",
        });
        setIsAddStockModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Stock Added!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire("Error", error?.message || "Failed to add", "error");
      }
    }
  };

  const handleDeleteStock = async (stockId: any) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes",
    });
    if (isConfirmed) {
      const { error } = await supabase
        .from("inventory_stocks")
        .delete()
        .eq("stock_id", stockId);
      if (!error) {
        setStocksList(stocksList.filter((s: any) => s.stock_id !== stockId));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          showConfirmButton: false,
          timer: 1000,
        });
      }
    }
  };

  // ================= ARYA AI ADD STOCK & SERVICE =================
  const handleVoiceAddStock = async (
    name: string,
    quantity: number,
    pricePerUnit: number,
  ) => {
    if (!name || isNaN(quantity) || isNaN(pricePerUnit)) {
      Swal.fire(
        "Incomplete Data",
        "Arya needs the item name, quantity, and price per unit.",
        "warning",
      );
      return;
    }
    const { data, error } = await supabase
      .from("inventory_stocks")
      .insert([
        {
          item_name: name,
          quantity: parseFloat(quantity as any),
          unit: "pcs",
          price_per_unit: parseFloat(pricePerUnit as any),
        },
      ])
      .select();

    if (!error && data) {
      setStocksList((prev: any[]) => [data[0], ...prev]);
      const cost =
        parseFloat(quantity as any) * parseFloat(pricePerUnit as any);
      if (cost > 0) {
        const { data: exp } = await supabase
          .from("business_expenses")
          .insert([
            {
              category: "Detergent/Chemicals",
              description: `Voice Initial Stock: ${quantity} pcs of ${name}`,
              amount: cost,
            },
          ])
          .select();
        if (exp) {
          setReportsList((prev: any[]) => [exp[0], ...prev]);
          setDashboardStats((prev: any) => ({
            ...prev,
            totalExpenses: prev.totalExpenses + cost,
          }));
        }
      }
      Swal.fire({
        icon: "success",
        title: "Stock Added by Arya!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } else {
      Swal.fire(
        "Error",
        error?.message || "Failed to add stock via voice",
        "error",
      );
    }
  };

  const handleVoiceAddService = async (name: string, price: number) => {
    if (!name || isNaN(price)) {
      Swal.fire(
        "Incomplete Data",
        "Arya needs the service name and price.",
        "warning",
      );
      return;
    }
    const { data, error } = await supabase
      .from("laundry_services")
      .insert([{ name: name, price: parseFloat(price as any) }])
      .select();

    if (!error && data) {
      setClothCatalog((prev: any[]) => [...prev, data[0]]);
      Swal.fire({
        icon: "success",
        title: "Service Added by Arya!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    } else {
      Swal.fire(
        "Error",
        error?.message || "Failed to add service via voice",
        "error",
      );
    }
  };

  // ================= FIXED ORDER STATUS UPDATE (ADMIN) =================
  const handleOrderStatusUpdate = async (orderId: any, newStatus: any) => {
    if (newStatus === "Rejected") {
      const { value: formValues, isDismissed } = await Swal.fire({
        title: "Reject Order",
        html: `
          <div class="text-start">
            <select id="swal-reject-reason" class="form-select bg-light mb-3">
              <option value="">-- No predefined reason (Write below) --</option>
              <option value="Shop operation hours are over">Shop operation hours are over</option>
              <option value="Store is full">Store is full</option>
            </select>
            <textarea id="swal-reject-manual" class="form-control bg-light" rows="3" placeholder="Type custom reason here..."></textarea>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Confirm Rejection",
        confirmButtonColor: "#dc3545",
        preConfirm: () => {
          const selectReason = (
            document.getElementById("swal-reject-reason") as HTMLSelectElement
          ).value;
          const manualReason = (
            document.getElementById("swal-reject-manual") as HTMLTextAreaElement
          ).value.trim();
          if (!selectReason && !manualReason) {
            Swal.showValidationMessage("Required.");
            return false;
          }
          return selectReason ? selectReason : manualReason;
        },
      });
      if (isDismissed) {
        setOrdersList([...ordersList]);
        return;
      }

      setOrdersList((prev: any[]) =>
        prev.map((o) =>
          String(o.order_id) === String(orderId)
            ? { ...o, status: "Rejected", rejection_reason: formValues }
            : o,
        ),
      );

      const { error } = await supabase
        .from("laundry_orders")
        .update({ status: "Rejected", rejection_reason: formValues })
        .eq("order_id", orderId);
      if (error) Swal.fire("Database Error", error.message, "error");
    } else {
      setOrdersList((prev: any[]) =>
        prev.map((o) =>
          String(o.order_id) === String(orderId)
            ? { ...o, status: newStatus, rejection_reason: null }
            : o,
        ),
      );
      if (
        activeInvoiceOrder &&
        String(activeInvoiceOrder.order_id) === String(orderId)
      ) {
        setActiveInvoiceOrder((prev: any) => ({
          ...prev,
          status: newStatus,
          rejection_reason: null,
        }));
      }

      const { error } = await supabase
        .from("laundry_orders")
        .update({ status: newStatus, rejection_reason: null })
        .eq("order_id", orderId);

      if (error) {
        Swal.fire("Database Error", error.message, "error");
      } else {
        Swal.fire({
          icon: "success",
          title: `Order #${orderId} -> ${newStatus}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    }
  };

  // ================= FIXED STORE-ISOLATED REALTIME LISTENERS =================
  useEffect(() => {
    if (!userProfile) return;
    const channel = supabase
      .channel(`realtime:public:laundry_orders:${currentShopId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "laundry_orders" },
        (payload: any) => {
          const incomingShopId = getOrderShopId(payload.new);
          if (userProfile.role === "admin" || userProfile.role === "manager") {
            if (incomingShopId === currentShopId) {
              setOrdersList((prev: any[]) => [payload.new, ...prev]);
              playNotificationSound();
              addNotification(
                `[${getShopNameById(incomingShopId)}] New order #${payload.new.order_id} placed by ${payload.new.customer_name}!`,
              );
              Swal.fire({
                title: "🚨 NEW ORDER ALERT! 🚨",
                html: `<div class="text-start bg-light p-3 rounded-3 mt-2 shadow-sm border"><h6 class="fw-bold text-primary mb-1">Order ID: #${payload.new.order_id}</h6><p class="mb-1 small"><strong>Customer:</strong> ${payload.new.customer_name}</p><p class="mb-0 small text-secondary"><strong>Branch:</strong> ${getShopNameById(incomingShopId)}</p></div>`,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 5000,
              });
            }
          } else if (
            userProfile.role === "user" &&
            payload.new.customer_name === userProfile.full_name
          ) {
            setOrdersList((prev: any[]) => [payload.new, ...prev]);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "laundry_orders" },
        (payload: any) => {
          const incomingShopId = getOrderShopId(payload.new);

          const existingInMemory = ordersRef.current.find(
            (o: any) => String(o.order_id) === String(payload.new.order_id),
          );
          const previousStatus = existingInMemory?.status;
          const previousSchedule = existingInMemory
            ? getOrderDeliverySchedule(existingInMemory)
            : null;
          const incomingSchedule = getOrderDeliverySchedule(payload.new);

          const mergedOrder = {
            ...existingInMemory,
            ...payload.new,
            delivery_schedule: incomingSchedule,
          };

          if (userProfile.role === "admin" || userProfile.role === "manager") {
            if (incomingShopId === currentShopId) {
              setOrdersList((prev: any[]) =>
                prev.map((o) =>
                  String(o.order_id) === String(payload.new.order_id)
                    ? mergedOrder
                    : o,
                ),
              );
              if (previousSchedule && previousSchedule !== incomingSchedule) {
                playNotificationSound();
                addNotification(
                  `Order #${payload.new.order_id} delivery schedule updated to: ${incomingSchedule}`,
                );
              }
            }
          } else if (
            userProfile.role === "user" &&
            payload.new.customer_name === userProfile.full_name
          ) {
            setOrdersList((prev: any[]) =>
              prev.map((o) =>
                String(o.order_id) === String(payload.new.order_id)
                  ? mergedOrder
                  : o,
              ),
            );
            if (
              previousStatus &&
              payload.new.status &&
              previousStatus !== payload.new.status
            ) {
              playNotificationSound();
              const msg = `Your order id: #${payload.new.order_id} status has been updated to ${payload.new.status}!`;
              addNotification(msg);
              Swal.fire({
                title: "Order Status Update",
                text: msg,
                icon: "success",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 5000,
              });
            }
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile, currentShopId]);

  // ================= ARYA AI MANUAL & WAKE WORD =================
  const playWakeChime = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error(e);
    }
  };

  const speakWithMicSuppression = (
    text: string,
    onEndCallback?: () => void,
  ) => {
    try {
      if (recognitionRef.current) recognitionRef.current.abort();
    } catch (e) {}
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
      if (userProfile?.role === "admin" && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const toggleAryaManually = () => {
    if (aryaState === "dormant") {
      setAryaState("listening");
      playWakeChime();
      speakWithMicSuppression("I am listening. How can I help?");
    } else {
      setAryaState("dormant");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    if (userProfile?.role !== "admin") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognitionRef.current = recognition;

    const executeAryaCommand = async (commandString: string) => {
      setAryaState("processing");
      const inventoryContext = stocksRef.current.map((s) => ({
        item: s.item_name,
        qty: `${s.quantity} ${s.unit}`,
      }));
      const ordersContext = ordersRef.current.slice(0, 10).map((o) => ({
        id: o.order_id,
        customer: o.customer_name,
        status: o.status,
      }));
      const reportsContext = reportsRef.current
        .slice(0, 10)
        .map((r) => ({ category: r.category, amount: r.amount }));

      try {
        const response = await fetch("/api/arya", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: commandString,
            inventoryContext,
            ordersContext,
            reportsContext,
          }),
        });
        const data = await response.json();
        speakWithMicSuppression(data.message, () => {
          setAryaState("dormant");
        });

        if (data.action === "UPDATE_ORDER") {
          handleOrderStatusUpdate(Number(data.orderId), data.newStatus);
        } else if (data.action === "NAVIGATE") {
          setActiveSection(data.section);
        } else if (data.action === "ADD_STOCK") {
          const name = data.payload?.name || data.stockName || data.name;
          const qty = data.payload?.quantity || data.quantity || data.qty;
          const price =
            data.payload?.pricePerUnit || data.pricePerUnit || data.price;
          handleVoiceAddStock(name, qty, price);
        } else if (data.action === "ADD_SERVICE") {
          const name = data.payload?.name || data.serviceName || data.name;
          const price = data.payload?.price || data.price;
          handleVoiceAddService(name, price);
        } else if (data.action === "OPEN_ADD_STOCK") {
          setActiveSection("stocks");
          openAddStockModal();
        } else if (data.action === "OPEN_ADD_SERVICE") {
          setActiveSection("services");
          openAddServiceModal();
        }
      } catch (error) {
        setAryaState("dormant");
      }
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();
      const saidArya =
        transcript.includes("arya") ||
        transcript.includes("aria") ||
        transcript.includes("aarya");

      if (aryaStateRef.current === "dormant") {
        if (saidArya) {
          playWakeChime();
          const wakeWordUsed = [
            "hey arya",
            "hey aria",
            "hey aarya",
            "arya",
            "aria",
            "aarya",
          ].find((w) => transcript.includes(w));
          const commandAfterWake = wakeWordUsed
            ? transcript.split(wakeWordUsed)[1]?.trim()
            : "";
          if (commandAfterWake && commandAfterWake.length > 3)
            executeAryaCommand(commandAfterWake);
          else {
            setAryaState("listening");
            speakWithMicSuppression("I am listening.");
          }
        }
      } else if (aryaStateRef.current === "listening") {
        executeAryaCommand(transcript);
      }
    };

    recognition.onend = () => {
      if (
        userProfile?.role === "admin" &&
        aryaStateRef.current !== "processing"
      ) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {}
        }, 1000);
      }
    };

    try {
      recognition.start();
    } catch (e) {}
    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [userProfile?.role]);

  const handleExportPDF = () => {
    const prevTitle = document.title;
    document.title = "\u200B";
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 600);
  };

  const handleUnlockSalary = () => {
    if (isSalaryVisible) {
      setIsSalaryVisible(false);
      return;
    }
    Swal.fire({
      title: "Enter Admin Password",
      input: "password",
      showCancelButton: true,
      confirmButtonText: "Unlock",
      confirmButtonColor: "#0d6efd",
    }).then((result: any) => {
      if (result.isConfirmed && result.value === "123456")
        setIsSalaryVisible(true);
      else if (result.isConfirmed)
        Swal.fire({
          icon: "error",
          title: "Incorrect",
          confirmButtonColor: "#0a1128",
        });
    });
  };

  const handleUpdateSalary = async (
    staffId: any,
    currentSalary: any,
    staffName: any,
  ) => {
    const { value: newSalary } = await Swal.fire({
      title: `Update Salary`,
      input: "number",
      inputValue: currentSalary,
      showCancelButton: true,
      confirmButtonText: "Save",
    });
    if (newSalary) {
      const { error } = await supabase
        .from("staff_payroll")
        .update({ monthly_salary: parseFloat(newSalary) })
        .eq("staff_id", staffId);
      if (!error) {
        setPayrollList((prev: any[]) =>
          prev.map((s) =>
            s.staff_id === staffId ? { ...s, monthly_salary: newSalary } : s,
          ),
        );
        Swal.fire({
          icon: "success",
          title: "Salary Updated!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  // ================= ONBOARDING SUBMIT: CLOSES MODAL FIRST, THEN SHOWS CONFIRMATION =================
  const handleOnboardingSubmit = async (e: any) => {
    e.preventDefault();
    if (!currentUser) return;

    const alreadyLocked = isCustomerShopLocked(currentUser.id, userProfile);
    const chosenShop = onboardingData.shop_id;

    if (!chosenShop || !isValidShopId(chosenShop)) {
      Swal.fire(
        "Select a Shop",
        "Please select your preferred Laundry Store branch from the dropdown.",
        "warning",
      );
      return;
    }

    setIsOnboardingOpen(false);

    if (!alreadyLocked && userProfile?.role === "user") {
      const { isConfirmed } = await Swal.fire({
        title: "Confirm Store Selection",
        html: `<div class="small text-secondary">You have selected <strong>${getShopNameById(chosenShop)}</strong>.<br/><br/><span class="text-danger fw-bold">⚠️ Important: Once selected, your store branch is final and cannot be changed later.</span></div>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Lock My Store",
        confirmButtonColor: "#0d6efd",
      });

      if (!isConfirmed) {
        setIsOnboardingOpen(true);
        return;
      }
    }

    saveUserShopSelection(currentUser.id, chosenShop, true);
    setCurrentShopId(chosenShop);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: onboardingData.name,
        phone: onboardingData.phone,
        address: onboardingData.address,
        shop_id: chosenShop,
        shop_locked: true,
        is_first_login: false,
      })
      .eq("id", currentUser.id);

    if (error) {
      await supabase
        .from("profiles")
        .update({
          full_name: onboardingData.name,
          phone: onboardingData.phone,
          address: onboardingData.address,
          is_first_login: false,
        })
        .eq("id", currentUser.id);
    }

    setUserProfile((prev: any) => ({
      ...prev,
      full_name: onboardingData.name,
      phone: onboardingData.phone,
      address: onboardingData.address,
      shop_id: chosenShop,
      shop_locked: true,
      is_first_login: false,
    }));

    await loadShopData(
      {
        ...userProfile,
        full_name: onboardingData.name,
        shop_id: chosenShop,
        shop_locked: true,
      },
      chosenShop,
    );

    Swal.fire({
      icon: "success",
      title: "Profile & Store Saved!",
      text: `Connected to ${getShopNameById(chosenShop)}`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleLogout = async () => {
    setIsProfilePopupOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const addToCart = (item: any) => {
    const existing = cart.find((c) => c.service_id === item.service_id);
    if (existing)
      setCart(
        cart.map((c) =>
          c.service_id === item.service_id ? { ...c, qty: c.qty + 1 } : c,
        ),
      );
    else setCart([...cart, { ...item, qty: 1 }]);
  };
  const removeFromCart = (id: any) =>
    setCart(cart.filter((c) => c.service_id !== id));

  const calculateCartSubtotal = () =>
    cart.reduce((sum: any, item: any) => sum + item.price * item.qty, 0);

  const getCheckoutDeliveryFee = () =>
    deliveryOption === "Fast" ? FAST_DELIVERY_FEE : 0;

  const calculateCartTotal = () =>
    calculateCartSubtotal() + getCheckoutDeliveryFee();

  const getCheckoutScheduleString = () => {
    if (deliveryOption === "Fast") {
      return "Fast Express Delivery (Within 24 Hrs)";
    }
    if (deliveryOption === "Custom") {
      if (!customDeliveryDate) return "Custom Delivery Date";
      const formattedDate = new Date(
        `${customDeliveryDate}T00:00:00`,
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return `Custom Delivery: ${formattedDate} (${customDeliveryTime})`;
    }
    return "Standard Delivery (48-72 Hrs)";
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay)
        return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0)
      return Swal.fire("Empty Cart", "Add items first.", "warning");
    // ================= BLOCK ORDERS IF STORE IS SUSPENDED OR EXPIRED =================
    const checkShopId =
      getUserSavedShop(currentUser?.id, userProfile) ||
      currentShopId ||
      "SHOP-A";
    const checkShopObj = shopsList.find((s: any) => s.shop_id === checkShopId);
    const isShopTimeExpired =
      checkShopObj?.subscription_end &&
      new Date(checkShopObj.subscription_end).getTime() <= Date.now();

    if (checkShopObj?.status === "Suspended" || isShopTimeExpired) {
      return Swal.fire({
        icon: "error",
        title: "Unable to Place Order",
        text: "Unable to place the order: Either the shop has stopped taking orders or has been closed.",
        confirmButtonColor: "#dc3545",
      });
    }
    if (
      userProfile?.role === "user" &&
      !isCustomerShopLocked(currentUser?.id, userProfile)
    ) {
      setIsOnboardingOpen(true);
      return Swal.fire(
        "Select Your Store First",
        "Please choose and lock your Laundry Store branch before placing an order.",
        "info",
      );
    }

    if (deliveryOption === "Custom" && !customDeliveryDate) {
      return Swal.fire(
        "Select Delivery Date",
        "Please pick your preferred Custom Delivery Date & Time.",
        "warning",
      );
    }

    const deliveryFee = getCheckoutDeliveryFee();
    const totalAmount = calculateCartTotal();
    const scheduleStr = getCheckoutScheduleString();
    const targetShopId =
      getUserSavedShop(currentUser?.id, userProfile) ||
      currentShopId ||
      "SHOP-A";

    const orderDetailsSummary = cart
      .map((c: any) => `${c.name} (x${c.qty} @₹${c.price})`)
      .join(", ");
    const todayStr = getLocalYYYYMMDD();

    if (paymentMethod === "Online") {
      const res = await loadRazorpayScript();
      if (!res) return Swal.fire("Error", "Razorpay failed to load.", "error");
      const options = {
        key: "rzp_live_TTaH03kARMoEdZ",
        amount: totalAmount * 100,
        currency: "INR",
        name: "WashNora Laundry Services",
        handler: async function (response: any) {
          const serviceStr = `${orderDetailsSummary} [Razorpay: ${response.razorpay_payment_id}] [SHOP: ${targetShopId}] [SCHEDULE: ${scheduleStr}] [DELIVERY: ${deliveryFee}] [PAYMENT: Fully Paid | PAID: ${totalAmount} | DATE: ${todayStr}]`;
          let { data, error } = await supabase
            .from("laundry_orders")
            .insert([
              {
                customer_name: userProfile?.full_name || "Customer",
                customer_phone: userProfile?.phone || "N/A",
                location: userProfile?.address || "Main Location",
                shop_id: targetShopId,
                delivery_schedule: scheduleStr,
                delivery_charge: deliveryFee,
                payment_status: "Fully Paid",
                paid_amount: totalAmount,
                service_type: serviceStr,
                total_amount: totalAmount,
                status: "Received",
              },
            ])
            .select();

          if (error) {
            const fallback = await supabase
              .from("laundry_orders")
              .insert([
                {
                  customer_name: userProfile?.full_name || "Customer",
                  customer_phone: userProfile?.phone || "N/A",
                  location: userProfile?.address || "Main Location",
                  service_type: serviceStr,
                  total_amount: totalAmount,
                  status: "Received",
                },
              ])
              .select();
            data = fallback.data;
            error = fallback.error;
          }

          if (!error && data) {
            saveLocalPaymentOverride(
              data[0].order_id,
              "Fully Paid",
              totalAmount,
              todayStr,
              deliveryFee,
              scheduleStr,
            );
            setCart([]);
            setDeliveryOption("Standard");
            setCustomDeliveryDate("");
            Swal.fire(
              "Success",
              `Order #${data[0].order_id} Sent to ${getShopNameById(targetShopId)}!`,
              "success",
            );
            setActiveSection("dashboard");
          }
        },
        prefill: {
          name: userProfile?.full_name || "",
          contact: userProfile?.phone || "",
        },
        theme: { color: "#0d6efd" },
      };
      new (window as any).Razorpay(options).open();
    } else {
      const serviceStr = `${orderDetailsSummary} [COD] [SHOP: ${targetShopId}] [SCHEDULE: ${scheduleStr}] [DELIVERY: ${deliveryFee}] [PAYMENT: Unpaid | PAID: 0 | DATE: ${todayStr}]`;
      let { data, error } = await supabase
        .from("laundry_orders")
        .insert([
          {
            customer_name: userProfile?.full_name || "Customer",
            customer_phone: userProfile?.phone || "N/A",
            location: userProfile?.address || "Main Location",
            shop_id: targetShopId,
            delivery_schedule: scheduleStr,
            delivery_charge: deliveryFee,
            payment_status: "Unpaid",
            paid_amount: 0,
            service_type: serviceStr,
            total_amount: totalAmount,
            status: "Pickup",
          },
        ])
        .select();

      if (error) {
        const fallback = await supabase
          .from("laundry_orders")
          .insert([
            {
              customer_name: userProfile?.full_name || "Customer",
              customer_phone: userProfile?.phone || "N/A",
              location: userProfile?.address || "Main Location",
              service_type: serviceStr,
              total_amount: totalAmount,
              status: "Pickup",
            },
          ])
          .select();
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data) {
        saveLocalPaymentOverride(
          data[0].order_id,
          "Unpaid",
          0,
          todayStr,
          deliveryFee,
          scheduleStr,
        );
        setCart([]);
        setDeliveryOption("Standard");
        setCustomDeliveryDate("");
        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: `Sent to ${getShopNameById(targetShopId)}`,
          timer: 2500,
          showConfirmButton: false,
        });
        setActiveSection("dashboard");
      }
    }
  };

  const handleAddStaffSubmit = async (e: any) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("staff_payroll")
      .insert([
        {
          staff_name: newStaff.name,
          designation: newStaff.designation,
          monthly_salary: parseFloat(newStaff.salary),
          status: "Pending",
        },
      ])
      .select();
    if (!error && data) {
      setPayrollList((prev: any[]) => [data[0], ...prev]);
      setNewStaff({ name: "", designation: "", salary: "" });
      setIsAddStaffModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Added!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleAddExpenseSubmit = async (e: any) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("business_expenses")
      .insert([
        {
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
        },
      ])
      .select();
    if (!error && data) {
      setReportsList((prev: any[]) => [data[0], ...prev]);
      setDashboardStats((prev: any) => ({
        ...prev,
        totalExpenses: prev.totalExpenses + parseFloat(newExpense.amount),
      }));
      setNewExpense({ category: "", description: "", amount: "" });
      setIsAddExpenseModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Logged!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const openAddServiceModal = () => {
    setEditingServiceId(null);
    setServiceForm({ name: "", price: "" });
    setIsServiceModalOpen(true);
  };
  const openEditServiceModal = (service: any) => {
    setEditingServiceId(service.service_id);
    setServiceForm({ name: service.name, price: service.price });
    setIsServiceModalOpen(true);
  };

  const handleSaveServiceSubmit = async (e: any) => {
    e.preventDefault();
    if (editingServiceId) {
      const { data, error } = await supabase
        .from("laundry_services")
        .update({
          name: serviceForm.name,
          price: parseFloat(serviceForm.price),
        })
        .eq("service_id", editingServiceId)
        .select();
      if (!error && data) {
        setClothCatalog((prev: any[]) =>
          prev.map((s: any) =>
            s.service_id === editingServiceId ? data[0] : s,
          ),
        );
        setIsServiceModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Updated!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } else {
      const { data, error } = await supabase
        .from("laundry_services")
        .insert([
          { name: serviceForm.name, price: parseFloat(serviceForm.price) },
        ])
        .select();
      if (!error && data) {
        setClothCatalog((prev: any[]) => [...prev, data[0]]);
        setIsServiceModalOpen(false);
        Swal.fire({
          icon: "success",
          title: "Added!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  const handleDeleteService = async (serviceId: any) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete Service?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes",
    });
    if (isConfirmed) {
      const { error } = await supabase
        .from("laundry_services")
        .delete()
        .eq("service_id", serviceId);
      if (!error)
        setClothCatalog(
          clothCatalog.filter((s: any) => s.service_id !== serviceId),
        );
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev: any[]) =>
      prev.map((n: any) => ({ ...n, read: true })),
    );
    setIsNotificationOpen(!isNotificationOpen);
  };
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // True when a customer is on a mobile screen (<992px)
  const isUserMobileView = isMobile && userProfile?.role === "user";

  const sidebarWidth = isMobile
    ? "230px"
    : isSidebarCollapsed
      ? "72px"
      : "230px";

  const getOrderStatusStyle = (status: any) => {
    switch (status) {
      case "Pickup":
        return "bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25";
      case "Received":
        return "bg-info bg-opacity-10 text-info border border-info border-opacity-25";
      case "In Progress":
        return "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
      case "Finished":
        return "bg-success bg-opacity-10 text-success border border-success border-opacity-25";
      case "Out for Delivery":
        return "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25";
      case "Rejected":
        return "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
      default:
        return "bg-light text-secondary border border-secondary border-opacity-25";
    }
  };

  const getPayrollStatusStyle = (status: any) => {
    switch (status) {
      case "Paid":
        return "bg-success bg-opacity-10 text-success border border-success border-opacity-25";
      case "Overdue":
        return "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25";
      case "Pending":
        return "bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25";
      default:
        return "bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25";
    }
  };

  const firstName = userProfile?.full_name
    ? userProfile.full_name.split(" ")[0]
    : "Admin";

  const filteredOrders = ordersList.filter((order: any) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const cleanIdQuery = searchLower.replace(/^(#|inv-|inv)/i, "").trim();
    const matchesSearch =
      !searchLower ||
      order.order_id.toString().includes(cleanIdQuery) ||
      (order.customer_name &&
        order.customer_name.toLowerCase().includes(searchLower));
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoiceOrders = ordersList.filter((order: any) => {
    const q = invoiceSearchQuery.toLowerCase().trim();
    const cleanOrderIdQuery = q.replace(/^(#|inv-|inv)/i, "").trim();
    const isNumericSearch = /^\d+$/.test(cleanOrderIdQuery);

    const matchesSearch =
      !q ||
      (isNumericSearch
        ? order.order_id.toString() === cleanOrderIdQuery ||
          order.order_id.toString().includes(cleanOrderIdQuery)
        : order.order_id.toString().includes(cleanOrderIdQuery) ||
          (order.customer_name &&
            order.customer_name.toLowerCase().includes(q)));

    const payStatus = getOrderPaymentStatus(order);
    const matchesPayFilter =
      invoicePaymentFilter === "All" || payStatus === invoicePaymentFilter;
    return matchesSearch && matchesPayFilter;
  });

  const getExpensePieData = () => {
    const categoryTotals: any = {};
    reportsList.forEach((exp: any) => {
      const cat = exp.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
    });
    return Object.keys(categoryTotals).map((key) => ({
      name: key,
      value: categoryTotals[key],
    }));
  };

  const getRevenueLineData = () => {
    const dataMap: any = {};
    ordersList.forEach((o: any) => {
      const paidAmt = getOrderPaidAmount(o);
      if (o.status !== "Rejected" && paidAmt > 0) {
        const dateStr = getOrderPaymentDateStr(o);
        const d = dateStr
          ? new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "Today";
        dataMap[d] = (dataMap[d] || 0) + paidAmt;
      }
    });
    return Object.keys(dataMap)
      .reverse()
      .map((date) => ({ name: date, Revenue: dataMap[date] }));
  };

  const expensePieData = getExpensePieData();
  const revenueLineData = getRevenueLineData();
  const lowStocks = stocksList.filter((s) => parseFloat(s.quantity) <= 10);

  const customerHasLockedStore =
    userProfile?.role === "user" &&
    isCustomerShopLocked(currentUser?.id, userProfile);

  const totalCartItemsCount = cart.reduce(
    (sum: number, item: any) => sum + (item.qty || 1),
    0,
  );

  if (!isMounted) return null;

  if (isAppLoading) {
    return (
      <div
        className="d-flex flex-column w-100 vh-100 justify-content-center align-items-center"
        style={{ backgroundColor: "#F8F9FB" }}
      >
        <div
          className="spinner-border text-primary shadow-sm mb-3"
          style={{ width: "3rem", height: "3rem", borderWidth: "0.3em" }}
          role="status"
        ></div>
        <h4 className="fw-bold text-dark" style={{ letterSpacing: "0.5px" }}>
          Laundry <span className="text-primary">ERP</span>
        </h4>
        <p className="text-secondary small fw-medium">
          Loading branch workspace...
        </p>
      </div>
    );
  }

  return (
    <div
      className="d-flex w-100 position-relative fade-in compact-erp-ui"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F9FB",
        overflowX: "hidden",
      }}
    >
      <audio
        id="notificationSound"
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        preload="auto"
      ></audio>

      {/* ================= MODALS ================= */}
      {rescheduleOrderTarget && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "440px" }}
          >
            <button
              onClick={() => setRescheduleOrderTarget(null)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-calendar-check fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0">
                  Schedule Delivery Preference
                </h6>
                <small className="text-secondary">
                  Order #{rescheduleOrderTarget.order_id} • Away from home? Pick
                  when you want your clothes delivered.
                </small>
              </div>
            </div>

            <form onSubmit={handleSaveCustomerReschedule}>
              <div className="d-flex flex-column gap-2 mb-3">
                <div
                  onClick={() => setRescheduleType("Standard")}
                  className={`p-2 px-3 rounded-3 border cursor-pointer d-flex justify-content-between align-items-center ${
                    rescheduleType === "Standard"
                      ? "border-primary bg-primary bg-opacity-10"
                      : "bg-light"
                  }`}
                >
                  <div>
                    <strong className="text-dark d-block small">
                      <i className="bi bi-truck me-2 text-primary"></i>Standard
                      Delivery
                    </strong>
                    <small className="text-secondary">
                      Regular 48–72 Hours Turnaround
                    </small>
                  </div>
                  <span className="badge bg-success rounded-pill">FREE</span>
                </div>

                <div
                  onClick={() => setRescheduleType("Fast")}
                  className={`p-2 px-3 rounded-3 border cursor-pointer d-flex justify-content-between align-items-center ${
                    rescheduleType === "Fast"
                      ? "border-primary bg-primary bg-opacity-10"
                      : "bg-light"
                  }`}
                >
                  <div>
                    <strong className="text-dark d-block small">
                      <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>
                      Fast Express Delivery
                    </strong>
                    <small className="text-secondary">
                      Priority Delivery within 24 Hours
                    </small>
                  </div>
                  <span className="badge bg-warning text-dark rounded-pill">
                    +₹{FAST_DELIVERY_FEE}
                  </span>
                </div>

                <div
                  onClick={() => setRescheduleType("Custom")}
                  className={`p-2 px-3 rounded-3 border cursor-pointer d-flex justify-content-between align-items-center ${
                    rescheduleType === "Custom"
                      ? "border-primary bg-primary bg-opacity-10"
                      : "bg-light"
                  }`}
                >
                  <div>
                    <strong className="text-dark d-block small">
                      <i className="bi bi-calendar2-week-fill me-2 text-info"></i>
                      Custom Delivery Date & Time
                    </strong>
                    <small className="text-secondary">
                      Not at home for 2–3 days? Schedule exact date & slot
                    </small>
                  </div>
                  <span className="badge bg-info text-dark rounded-pill">
                    Custom
                  </span>
                </div>
              </div>

              {rescheduleType === "Custom" && (
                <div className="bg-light p-3 rounded-3 border mb-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-dark mb-1">
                      Preferred Delivery Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm border-0 shadow-sm"
                      min={getLocalYYYYMMDD()}
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label small fw-bold text-dark mb-1">
                      Preferred Time Slot
                    </label>
                    <select
                      className="form-select form-select-sm border-0 shadow-sm"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    >
                      <option value="09:00 AM - 12:00 PM">
                        Morning (09:00 AM - 12:00 PM)
                      </option>
                      <option value="12:00 PM - 03:00 PM">
                        Afternoon (12:00 PM - 03:00 PM)
                      </option>
                      <option value="03:00 PM - 06:00 PM">
                        Evening (03:00 PM - 06:00 PM)
                      </option>
                      <option value="06:00 PM - 09:00 PM">
                        Night (06:00 PM - 09:00 PM)
                      </option>
                    </select>
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-pill shadow-sm"
                >
                  Save Delivery Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setRescheduleOrderTarget(null)}
                  className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrderDetails && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "460px" }}
          >
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>
            <div className="text-center mb-3">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center mx-auto mb-2 shadow-sm border border-primary border-opacity-25"
                style={{ width: "48px", height: "48px", fontSize: "1.5rem" }}
              >
                <i className="bi bi-receipt"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                Order #{selectedOrderDetails.order_id}
              </h5>
              <span className="badge bg-light text-secondary border px-2 py-1">
                {new Date(selectedOrderDetails.created_at).toLocaleString(
                  "en-IN",
                  { dateStyle: "medium", timeStyle: "short" },
                )}
              </span>
            </div>
            <div className="bg-light p-3 rounded-3 mb-3 border shadow-sm">
              <h6 className="fw-bold text-dark mb-2 border-bottom pb-1 small">
                <i className="bi bi-person me-2 text-primary"></i>Customer &
                Branch Info
              </h6>
              <div className="small text-secondary mb-1">
                <strong>Store Branch:</strong>{" "}
                {getShopNameById(getOrderShopId(selectedOrderDetails))}
              </div>
              <div className="small text-secondary mb-1">
                <strong>Name:</strong> {selectedOrderDetails.customer_name}
              </div>
              <div className="small text-secondary mb-1">
                <strong>Phone:</strong> {selectedOrderDetails.customer_phone}
              </div>
              <div className="small text-secondary mb-1">
                <strong>Address:</strong> {selectedOrderDetails.location}
              </div>
              <div className="small text-primary fw-semibold mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-clock-history me-1"></i>
                  <strong>Delivery:</strong>{" "}
                  {getOrderDeliverySchedule(selectedOrderDetails)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const ord = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    openRescheduleModal(ord);
                  }}
                  className="btn btn-sm btn-link p-0 text-decoration-none fw-bold"
                >
                  Change
                </button>
              </div>
            </div>
            <div className="bg-light p-3 rounded-3 mb-3 border shadow-sm">
              <h6 className="fw-bold text-dark mb-2 border-bottom pb-1 small">
                <i className="bi bi-bag-check me-2 text-primary"></i>Order Items
              </h6>
              <div
                className="small text-dark mb-2"
                style={{
                  lineHeight: "1.5",
                  maxHeight: "90px",
                  overflowY: "auto",
                }}
              >
                {parseOrderItemsForInvoice(selectedOrderDetails).map(
                  (item: any, i: any) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center mb-1"
                    >
                      <span>
                        <i className="bi bi-dot text-primary me-1"></i>
                        {item.name} (x{item.qty} @₹{item.unitPrice})
                      </span>
                      <strong>₹{item.total}</strong>
                    </div>
                  ),
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <strong className="text-dark small">Total Amount</strong>
                <h6 className="fw-bold text-success mb-0">
                  ₹{selectedOrderDetails.total_amount}
                </h6>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => {
                  const ord = selectedOrderDetails;
                  setSelectedOrderDetails(null);
                  setActiveInvoiceOrder(ord);
                  setActiveSection("invoices");
                }}
                className="btn btn-outline-primary btn-sm w-100 fw-bold py-2 rounded-pill shadow-sm"
              >
                <i className="bi bi-receipt-cutoff me-1"></i> Open Full Invoice
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-pill shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomerProfile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "380px" }}
          >
            <button
              onClick={() => setSelectedCustomerProfile(null)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>
            <div className="text-center mb-3">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center mx-auto mb-2 shadow-sm border border-primary border-opacity-25"
                style={{ width: "64px", height: "64px", fontSize: "2rem" }}
              >
                <i className="bi bi-person-circle"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">
                {selectedCustomerProfile.name}
              </h5>
              <span className="badge bg-light text-secondary border px-2 py-1">
                Customer Details
              </span>
            </div>
            <div className="bg-light p-3 rounded-3 mb-3 border shadow-sm">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-telephone-fill text-primary fs-6 me-3"></i>
                <div>
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "0.65rem", fontWeight: "bold" }}
                  >
                    PHONE NUMBER
                  </small>
                  <span className="fw-medium text-dark small">
                    {selectedCustomerProfile.phone}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill text-danger fs-6 me-3"></i>
                <div>
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "0.65rem", fontWeight: "bold" }}
                  >
                    FULL ADDRESS
                  </small>
                  <span
                    className="fw-medium text-dark small"
                    style={{ lineHeight: "1.3", display: "block" }}
                  >
                    {selectedCustomerProfile.address}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomerProfile(null)}
              className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-pill shadow-sm"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {isAddExpenseModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "420px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">Log Expense</h6>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="btn-close"
              ></button>
            </div>
            <form onSubmit={handleAddExpenseSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Expense Category
                </label>
                <select
                  className="form-select form-select-sm bg-light border-0 py-2"
                  required
                  value={newExpense.category}
                  onChange={(e: any) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  <option value="Detergent/Chemicals">
                    Detergent & Chemicals
                  </option>
                  <option value="Electricity">Electricity Bill</option>
                  <option value="Equipment Repair">
                    Equipment Maintenance
                  </option>
                  <option value="Fuel/Transport">Fuel & Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Description
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newExpense.description}
                  onChange={(e: any) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Bought 10kg Surf Excel"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Amount Spent (₹)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newExpense.amount}
                  onChange={(e: any) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="500"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-3"
              >
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddStaffModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "420px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">Add New Staff</h6>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="btn-close"
              ></button>
            </div>
            <form onSubmit={handleAddStaffSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newStaff.name}
                  onChange={(e: any) =>
                    setNewStaff({ ...newStaff, name: e.target.value })
                  }
                  placeholder="Staff Name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Designation
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newStaff.designation}
                  onChange={(e: any) =>
                    setNewStaff({ ...newStaff, designation: e.target.value })
                  }
                  placeholder="e.g. Delivery Executive"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newStaff.salary}
                  onChange={(e: any) =>
                    setNewStaff({ ...newStaff, salary: e.target.value })
                  }
                  placeholder="15000"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-3"
              >
                Save Staff Member
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddStockModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "420px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">
                {editingStockId
                  ? "Edit Inventory Stock"
                  : "Add Inventory Stock"}
              </h6>
              <button
                onClick={() => setIsAddStockModalOpen(false)}
                className="btn-close"
              ></button>
            </div>
            <form onSubmit={handleAddStockSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Stock ID / Code
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  value={newStock.id}
                  onChange={(e: any) =>
                    setNewStock({ ...newStock, id: e.target.value })
                  }
                  placeholder="Auto-generated if left blank"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Item Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newStock.name}
                  onChange={(e: any) =>
                    setNewStock({ ...newStock, name: e.target.value })
                  }
                  placeholder="e.g. Ariel Detergent"
                />
              </div>
              {!editingStockId && (
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">
                    Initial Quantity (pcs)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm bg-light border-0 py-2"
                    required
                    value={newStock.quantity}
                    onChange={(e: any) =>
                      setNewStock({ ...newStock, quantity: e.target.value })
                    }
                    placeholder="10"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Base Price (per 1 pcs in ₹)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={newStock.pricePerUnit}
                  onChange={(e: any) =>
                    setNewStock({ ...newStock, pricePerUnit: e.target.value })
                  }
                  placeholder="e.g. 220"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-3"
              >
                {editingStockId ? "Update Stock Details" : "Save Stock Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isServiceModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "420px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">
                {editingServiceId ? "Edit Service" : "Add New Service"}
              </h6>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="btn-close"
              ></button>
            </div>
            <form onSubmit={handleSaveServiceSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Service Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={serviceForm.name}
                  onChange={(e: any) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  placeholder="e.g. Dry Cleaning / Jacket"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Price per piece (₹)
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={serviceForm.price}
                  onChange={(e: any) =>
                    setServiceForm({ ...serviceForm, price: e.target.value })
                  }
                  placeholder="150"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-3"
              >
                {editingServiceId ? "Update Service" : "Add to App Catalog"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isOnboardingOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg position-relative"
            style={{
              width: "90%",
              maxWidth: "440px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h5 className="fw-bold text-dark mb-1">Complete Your Profile</h5>
            <p className="text-secondary small mb-3">
              Enter your contact details and select your Laundry Store branch.
            </p>
            <form onSubmit={handleOnboardingSubmit}>
              <div className="mb-2">
                <label className="form-label text-secondary small fw-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={onboardingData.name}
                  onChange={(e: any) =>
                    setOnboardingData({
                      ...onboardingData,
                      name: e.target.value,
                    })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="mb-2">
                <label className="form-label text-secondary small fw-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  value={onboardingData.phone}
                  onChange={(e: any) =>
                    setOnboardingData({
                      ...onboardingData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold mb-1">
                  Full Pickup/Delivery Address
                </label>
                <textarea
                  className="form-control form-control-sm bg-light border-0 py-2"
                  required
                  rows={2}
                  value={onboardingData.address}
                  onChange={(e: any) =>
                    setOnboardingData({
                      ...onboardingData,
                      address: e.target.value,
                    })
                  }
                  placeholder="House no, Street, City"
                ></textarea>
              </div>

              <div className="mb-3 p-3 rounded-3 border bg-light">
                <label className="form-label text-dark small fw-bold mb-1">
                  <i className="bi bi-shop text-primary me-1"></i> Select Your
                  Laundry Store Branch
                </label>
                <select
                  className="form-select form-select-sm border-primary fw-semibold"
                  required
                  disabled={
                    customerHasLockedStore &&
                    isValidShopId(onboardingData.shop_id)
                  }
                  value={onboardingData.shop_id || ""}
                  onChange={(e: any) =>
                    setOnboardingData({
                      ...onboardingData,
                      shop_id: e.target.value,
                    })
                  }
                >
                  <option value="">-- Choose Your Nearest Store --</option>
                  {shopsList.map((sh: any) => (
                    <option key={sh.shop_id} value={sh.shop_id}>
                      {sh.shop_name}{" "}
                      {sh.branch_location ? `(${sh.branch_location})` : ""}
                    </option>
                  ))}
                </select>
                {customerHasLockedStore &&
                isValidShopId(onboardingData.shop_id) ? (
                  <small
                    className="text-success d-block mt-2 fw-semibold"
                    style={{ fontSize: "0.72rem" }}
                  >
                    <i className="bi bi-lock-fill me-1"></i>Your store location
                    is permanently locked to{" "}
                    {getShopNameById(onboardingData.shop_id)}.
                  </small>
                ) : (
                  <small
                    className="text-danger d-block mt-2 fw-semibold"
                    style={{ fontSize: "0.72rem" }}
                  >
                    ⚠️ Note: Once you select and save your store location, it is
                    final and cannot be changed later.
                  </small>
                )}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-100 fw-bold py-2 rounded-3"
                >
                  Save Details
                </button>
                {userProfile?.full_name && customerHasLockedStore && (
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(false)}
                    className="btn btn-outline-secondary btn-sm px-3 rounded-3"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isProfilePopupOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 d-flex flex-column flex-md-row gap-3 align-items-center position-relative"
            style={{ width: "90%", maxWidth: "460px" }}
          >
            <button
              onClick={() => setIsProfilePopupOpen(false)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>
            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold fs-3 shadow-sm"
              style={{ width: "68px", height: "68px", flexShrink: 0 }}
            >
              {userProfile?.full_name
                ? userProfile.full_name[0].toUpperCase()
                : "U"}
            </div>
            <div className="flex-grow-1 text-center text-md-start">
              <h5 className="fw-bold text-dark mb-1">
                {userProfile?.full_name || "No Name Set"}
              </h5>
              <p
                className="text-muted small mb-2 text-uppercase fw-semibold"
                style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
              >
                Role: {userProfile?.role || "user"} •{" "}
                <span className="text-primary">
                  {getShopNameById(currentShopId)}
                </span>
              </p>
              <div className="d-flex flex-column gap-1 mb-3 text-secondary small">
                <div>
                  <i className="bi bi-envelope me-2 text-primary"></i>
                  {currentUser?.email}
                </div>
                <div>
                  <i className="bi bi-telephone me-2 text-primary"></i>
                  {userProfile?.phone || "No phone number"}
                </div>
                <div>
                  <i className="bi bi-geo-alt me-2 text-primary"></i>
                  {userProfile?.address || "No address"}
                </div>
              </div>
              <div className="d-flex justify-content-center justify-content-md-start gap-2">
                <button
                  onClick={() => {
                    setIsProfilePopupOpen(false);
                    const savedValidShop = getUserSavedShop(
                      currentUser?.id,
                      userProfile,
                    );
                    setOnboardingData({
                      name: userProfile?.full_name || "",
                      phone: userProfile?.phone || "",
                      address: userProfile?.address || "",
                      shop_id: savedValidShop || "",
                    });
                    setIsOnboardingOpen(true);
                  }}
                  className="btn btn-outline-primary btn-sm px-3 fw-medium rounded-pill"
                >
                  <i className="bi bi-pencil me-1"></i> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm px-3 fw-medium rounded-pill"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DARK UI SIDEBAR (HIDDEN ON MOBILE FOR END USERS) ================= */}
      {!isUserMobileView && (
        <aside
          className="d-flex flex-column transition-all shadow-lg no-print"
          style={{
            width: sidebarWidth,
            position: "fixed",
            height: "100vh",
            zIndex: 1050,
            backgroundColor: "#0A1128",
            transition: "width 0.3s ease, transform 0.3s ease",
            transform:
              isMobile && isSidebarCollapsed
                ? "translateX(-100%)"
                : "translateX(0)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div
            className={`d-flex align-items-center py-3 mb-2 ${isSidebarCollapsed && !isMobile ? "justify-content-center px-0" : "px-3"}`}
          >
            <div
              className="bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm"
              style={{ width: "32px", height: "32px", flexShrink: 0 }}
            >
              <i className="bi bi-droplet-half text-primary fs-6"></i>
            </div>
            {(!isSidebarCollapsed || isMobile) && (
              <div className="ms-2 text-white text-nowrap">
                <h6 className="fw-bold mb-0" style={{ letterSpacing: "0.4px" }}>
                  Laundry <span className="text-primary">ERP</span>
                </h6>
                <small
                  className="text-white-50"
                  style={{
                    fontSize: "0.62rem",
                    display: "block",
                    marginTop: "-2px",
                  }}
                >
                  We Care Your Clothes
                </small>
              </div>
            )}
          </div>

          <div className="px-2 flex-grow-1">
            <nav className="nav flex-column gap-1 mt-1">
              <button
                title="Dashboard"
                onClick={() => {
                  setActiveSection("dashboard");
                  if (isMobile) setIsSidebarCollapsed(true);
                }}
                className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "dashboard" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                style={{
                  backgroundColor:
                    activeSection === "dashboard" ? "#0d6efd" : "transparent",
                }}
              >
                <div className="d-flex align-items-center">
                  <i
                    className={`bi bi-grid-1x2-fill ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                  ></i>{" "}
                  {(!isSidebarCollapsed || isMobile) && <span>Dashboard</span>}
                </div>
              </button>
              <button
                title={userProfile?.role === "user" ? "Book Order" : "Orders"}
                onClick={() => {
                  setActiveSection("orders");
                  if (isMobile) setIsSidebarCollapsed(true);
                }}
                className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "orders" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                style={{
                  backgroundColor:
                    activeSection === "orders" ? "#0d6efd" : "transparent",
                }}
              >
                <div className="d-flex align-items-center">
                  <i
                    className={`bi bi-clipboard-check ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                  ></i>{" "}
                  {(!isSidebarCollapsed || isMobile) && (
                    <span>
                      {userProfile?.role === "user" ? "Book Order" : "Orders"}
                    </span>
                  )}
                </div>
              </button>
              <button
                title="Invoices"
                onClick={() => {
                  setActiveSection("invoices");
                  if (!activeInvoiceOrder && ordersList.length > 0) {
                    setActiveInvoiceOrder(ordersList[0]);
                  }
                  if (isMobile) setIsSidebarCollapsed(true);
                }}
                className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "invoices" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                style={{
                  backgroundColor:
                    activeSection === "invoices" ? "#0d6efd" : "transparent",
                }}
              >
                <div className="d-flex align-items-center">
                  <i
                    className={`bi bi-receipt-cutoff ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                  ></i>{" "}
                  {(!isSidebarCollapsed || isMobile) && (
                    <span>
                      {userProfile?.role === "user"
                        ? "My Invoices"
                        : "Invoices & Billing"}
                    </span>
                  )}
                </div>
              </button>
              {userProfile?.role === "admin" && (
                <button
                  title="Payroll"
                  onClick={() => {
                    setActiveSection("payroll");
                    if (isMobile) setIsSidebarCollapsed(true);
                  }}
                  className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "payroll" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                  style={{
                    backgroundColor:
                      activeSection === "payroll" ? "#0d6efd" : "transparent",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i
                      className={`bi bi-people ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                    ></i>{" "}
                    {(!isSidebarCollapsed || isMobile) && <span>Payroll</span>}
                  </div>
                </button>
              )}
              {(userProfile?.role === "admin" ||
                userProfile?.role === "manager") && (
                <>
                  <button
                    title="Services"
                    onClick={() => {
                      setActiveSection("services");
                      if (isMobile) setIsSidebarCollapsed(true);
                    }}
                    className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "services" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                    style={{
                      backgroundColor:
                        activeSection === "services"
                          ? "#0d6efd"
                          : "transparent",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`bi bi-tag-fill ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                      ></i>{" "}
                      {(!isSidebarCollapsed || isMobile) && (
                        <span>Services Mgt</span>
                      )}
                    </div>
                  </button>
                  <button
                    title="Stocks"
                    onClick={() => {
                      setActiveSection("stocks");
                      if (isMobile) setIsSidebarCollapsed(true);
                    }}
                    className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "stocks" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                    style={{
                      backgroundColor:
                        activeSection === "stocks" ? "#0d6efd" : "transparent",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`bi bi-box-seam ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                      ></i>{" "}
                      {(!isSidebarCollapsed || isMobile) && (
                        <span>Inventory Stocks</span>
                      )}
                    </div>
                  </button>
                  <button
                    title="Reports"
                    onClick={() => {
                      setActiveSection("reports");
                      if (isMobile) setIsSidebarCollapsed(true);
                    }}
                    className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-2 border-0 transition-all ${activeSection === "reports" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                    style={{
                      backgroundColor:
                        activeSection === "reports" ? "#0d6efd" : "transparent",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className={`bi bi-bar-chart-fill ${isSidebarCollapsed && !isMobile ? "" : "me-2"}`}
                      ></i>{" "}
                      {(!isSidebarCollapsed || isMobile) && (
                        <span>Reports</span>
                      )}
                    </div>
                  </button>
                </>
              )}
            </nav>
          </div>
        </aside>
      )}

      {!isUserMobileView && isMobile && !isSidebarCollapsed && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 no-print"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
          onClick={() => setIsSidebarCollapsed(true)}
        ></div>
      )}

      <main
        className="w-100 transition-all d-flex flex-column"
        style={{
          marginLeft: isMobile ? "0px" : sidebarWidth,
          paddingBottom: isUserMobileView ? "82px" : "0px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <header
          className="bg-white d-flex justify-content-between align-items-center px-3 py-2 sticky-top border-bottom no-print"
          style={{ zIndex: 1030 }}
        >
          <div className="d-flex align-items-center gap-2">
            {/* Hamburger menu hidden on mobile for end users; replaced with clean brand icon */}
            {!isUserMobileView ? (
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center p-0 shadow-sm"
                style={{ width: "34px", height: "34px" }}
              >
                <i className="bi bi-list fs-6 text-white"></i>
              </button>
            ) : (
              <div className="d-flex align-items-center gap-2 me-1">
                <div
                  className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                  style={{ width: "32px", height: "32px", flexShrink: 0 }}
                >
                  <i className="bi bi-droplet-half fs-6"></i>
                </div>
                <span
                  className="fw-bold text-dark"
                  style={{ fontSize: "0.95rem" }}
                >
                  Wash<span className="text-primary">Nora</span>
                </span>
              </div>
            )}

            {/* ACTIVE STORE BADGE / ADMIN STORE SELECTOR */}
            {userProfile?.role === "user" ? (
              customerHasLockedStore ? (
                <span
                  className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-2 px-md-3 py-1 fw-semibold d-flex align-items-center gap-1 text-truncate"
                  style={{ maxWidth: isUserMobileView ? "185px" : "none" }}
                >
                  <i className="bi bi-shop"></i>
                  <span className="text-truncate">
                    {getShopNameById(currentShopId)}
                  </span>
                  <i
                    className="bi bi-lock-fill ms-1 text-secondary"
                    title="Locked Store Branch"
                  ></i>
                </span>
              ) : (
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="btn btn-warning btn-sm rounded-pill px-2 px-md-3 py-1 fw-bold d-flex align-items-center gap-1"
                >
                  <i className="bi bi-shop"></i> Select Store
                </button>
              )
            ) : (
              <div className="d-flex align-items-center gap-1 bg-light border rounded-pill px-2 py-1">
                <i className="bi bi-shop text-primary ms-1"></i>
                <select
                  className="form-select form-select-sm border-0 bg-transparent fw-bold text-dark py-0 ps-1 pe-4 shadow-none"
                  style={{ fontSize: "0.78rem" }}
                  value={currentShopId}
                  onChange={(e) => handleAdminSwitchShop(e.target.value)}
                  title="Assign / View Active Store Branch"
                >
                  {shopsList.map((sh: any) => (
                    <option key={sh.shop_id} value={sh.shop_id}>
                      {sh.shop_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            <div className="d-none d-xl-flex align-items-center gap-3 border-end pe-3">
              <a
                href="/tos"
                className="text-secondary text-decoration-none small hover-primary transition-all"
              >
                Terms of Service
              </a>
              <a
                href="/pp"
                className="text-secondary text-decoration-none small hover-primary transition-all"
              >
                Privacy Policy
              </a>
            </div>

            {currentTime && (
              <div className="d-none d-md-flex align-items-center text-secondary border rounded-pill px-3 py-1 small fw-medium bg-white">
                <i className="bi bi-calendar3 me-2 text-dark"></i>
                {currentTime.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                <span className="mx-2 text-muted">|</span>
                {currentTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            )}

            {/* ARYA AI WIDGET */}
            {userProfile?.role === "admin" && (
              <div
                onClick={toggleAryaManually}
                className={`d-none d-md-flex align-items-center gap-2 border rounded-pill px-3 py-1 shadow-sm transition-all cursor-pointer ${
                  aryaState === "listening"
                    ? "bg-primary text-white scale-up"
                    : aryaState === "processing"
                      ? "bg-warning text-dark"
                      : "bg-light text-secondary hover-bg-light"
                }`}
                title="Click to toggle Arya AI"
              >
                {aryaState === "listening" ? (
                  <>
                    <div className="spinner-grow spinner-grow-sm text-white" />
                    <span className="small fw-bold">Listening...</span>
                  </>
                ) : aryaState === "processing" ? (
                  <>
                    <div className="spinner-border spinner-border-sm text-dark" />
                    <span className="small fw-bold">Processing...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-mic-fill text-primary"></i>
                    <span className="small fw-medium">Arya AI</span>
                  </>
                )}
              </div>
            )}

            <div className="position-relative">
              <button
                onClick={markAllNotificationsRead}
                className="btn btn-white rounded-circle position-relative p-1 border shadow-sm"
                style={{ width: "34px", height: "34px" }}
              >
                <i className="bi bi-bell text-dark"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning text-dark border border-white"
                    style={{ fontSize: "0.6rem", padding: "3px 5px" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div
                  className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0 rounded-4 py-0"
                  style={{ width: "280px", zIndex: 1050, overflow: "hidden" }}
                >
                  <div className="bg-primary text-white px-3 py-2 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold small">Notifications</h6>
                  </div>
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: "260px", overflowY: "auto" }}
                  >
                    {notifications.length === 0 ? (
                      <div className="text-center py-3 text-muted small">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n: any) => (
                        <div
                          key={n.id}
                          className="list-group-item list-group-item-action px-3 py-2 bg-light border-bottom"
                        >
                          <div className="d-flex w-100 justify-content-between mb-1">
                            <span className="fw-bold small text-dark">
                              Update
                            </span>
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.65rem" }}
                            >
                              {n.timestamp}
                            </small>
                          </div>
                          <p
                            className="mb-0 text-secondary small"
                            style={{ lineHeight: "1.35" }}
                          >
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile avatar remains in header on desktop & admin, moved to bottom nav on mobile user view */}
            {!isUserMobileView && (
              <div
                className="d-flex align-items-center gap-2 cursor-pointer"
                onClick={() => setIsProfilePopupOpen(true)}
              >
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold shadow-sm"
                  style={{ width: "34px", height: "34px", fontSize: "0.85rem" }}
                >
                  {userProfile?.full_name
                    ? userProfile.full_name[0].toUpperCase()
                    : "T"}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="container-fluid p-2 p-md-3 flex-grow-1">
          {/* ================= DASHBOARD SECTION ================= */}
          {activeSection === "dashboard" && (
            <div className="fade-in">
              <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h4 className="fw-bold text-dark mb-0">
                    Welcome back, {firstName} 👋
                  </h4>
                  <p className="text-secondary small mb-0">
                    {userProfile?.role === "user"
                      ? `Connected Store: ${customerHasLockedStore ? getShopNameById(currentShopId) : "Please Select Your Store"} • Track orders & schedule deliveries.`
                      : `Managing ${getShopNameById(currentShopId)}  Live branch overview.`}
                  </p>
                </div>
                {userProfile?.role === "user" && !isUserMobileView && (
                  <button
                    onClick={() => setActiveSection("orders")}
                    className="btn btn-primary btn-sm fw-bold rounded-pill px-3 py-2 shadow-sm"
                  >
                    <i className="bi bi-plus-circle me-1"></i>Book New Order
                  </button>
                )}
              </div>

              {/* STOCK ALERTS */}
              {userProfile?.role !== "user" && lowStocks.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {lowStocks.map((s) => {
                    const qty = parseFloat(s.quantity);
                    return qty === 0 ? (
                      <div
                        key={s.stock_id}
                        className="badge bg-danger text-white py-1 px-2 shadow-sm"
                      >
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>{" "}
                        {s.item_name} Out of stock
                      </div>
                    ) : (
                      <div
                        key={s.stock_id}
                        className="badge bg-warning text-dark py-1 px-2 shadow-sm"
                      >
                        <i className="bi bi-exclamation-circle-fill me-1"></i>{" "}
                        {s.item_name} is low
                      </div>
                    );
                  })}
                </div>
              )}

              {userProfile?.role !== "user" && (
                <>
                  <div className="row g-2 g-md-3 mb-3">
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-primary">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          Today's Revenue
                        </p>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                          <h5 className="fw-bold text-dark mb-0">
                            ₹{dashboardStats.todayRev}
                          </h5>
                          <span className="badge bg-light text-secondary border rounded-pill">
                            {dashboardStats.todayOrders} Ord
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-success">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          This Month
                        </p>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                          <h5 className="fw-bold text-dark mb-0">
                            ₹{dashboardStats.monthRev}
                          </h5>
                          <span className="badge bg-light text-secondary border rounded-pill">
                            {dashboardStats.monthOrders} Ord
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-warning">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          This Year
                        </p>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-1">
                          <h5 className="fw-bold text-dark mb-0">
                            ₹{dashboardStats.yearRev}
                          </h5>
                          <span className="badge bg-light text-secondary border rounded-pill">
                            {dashboardStats.yearOrders} Ord
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-danger">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          Total Expenses
                        </p>
                        <h5 className="fw-bold text-dark mb-0">
                          ₹{dashboardStats.totalExpenses}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="row g-2 g-md-3 mb-3">
                    {[
                      {
                        title: "Branch Orders",
                        value: dashboardStats.totalOrders,
                        hex: "#0d6efd",
                        icon: "cart3",
                      },
                      {
                        title: "Branch Revenue",
                        value: `₹${dashboardStats.revenue}`,
                        hex: "#198754",
                        icon: "currency-rupee",
                      },
                      {
                        title: "Pending Pickups",
                        value: dashboardStats.pendingPickups,
                        hex: "#fd7e14",
                        icon: "bag-fill",
                      },
                      {
                        title: "Out for Delivery",
                        value: dashboardStats.delivery,
                        hex: "#6f42c1",
                        icon: "truck",
                      },
                    ].map((stat, idx) => (
                      <div className="col-6 col-xl-3" key={idx}>
                        <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex justify-content-center align-items-center text-white"
                              style={{
                                width: "38px",
                                height: "38px",
                                backgroundColor: stat.hex,
                                flexShrink: 0,
                              }}
                            >
                              <i className={`bi bi-${stat.icon}`}></i>
                            </div>
                            <div>
                              <p className="mb-0 fw-semibold text-secondary small">
                                {stat.title}
                              </p>
                              <h5 className="fw-bold text-dark mb-0">
                                {stat.value}
                              </h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="bg-primary rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <i className="bi bi-clipboard2-data"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">
                        {userProfile?.role === "user"
                          ? "Your Recent Orders & Delivery Schedule"
                          : `Recent Live Orders  ${getShopNameById(currentShopId)}`}
                      </h6>
                      <small className="text-secondary d-block">
                        {userProfile?.role === "user"
                          ? "Click 'Schedule / Change Date' on any order to pick a custom delivery date & time."
                          : "Showing orders exclusively for this branch"}
                      </small>
                    </div>
                  </div>
                  {!isUserMobileView && (
                    <button
                      onClick={() => setActiveSection("orders")}
                      className="btn btn-primary btn-sm fw-medium rounded-3 px-3"
                    >
                      {userProfile?.role === "user"
                        ? "Book Order"
                        : "View All Orders"}{" "}
                      <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  )}
                </div>

                <div className="card-body p-0">
                  {ordersList.length === 0 ? (
                    <div className="text-center py-4">
                      <i
                        className="bi bi-inboxes text-primary opacity-50"
                        style={{ fontSize: "2.5rem" }}
                      ></i>
                      <h6 className="fw-bold text-dark mt-2">
                        No Orders Found for {getShopNameById(currentShopId)}
                      </h6>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-custom align-middle mb-0">
                        <thead className="bg-light border-bottom">
                          <tr className="text-secondary">
                            <th className="ps-3">ORDER ID</th>
                            <th>CUSTOMER INFO</th>
                            <th>DELIVERY SCHEDULE</th>
                            <th>AMOUNT</th>
                            <th>PAYMENT</th>
                            <th className="pe-3">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(userProfile?.role === "user"
                            ? ordersList
                            : ordersList.slice(0, 6)
                          ).map((order: any) => (
                            <tr
                              key={order.order_id}
                              className="border-bottom border-light"
                            >
                              <td className="ps-3 fw-bold text-dark">
                                <span
                                  className="text-primary text-decoration-underline cursor-pointer"
                                  onClick={() => {
                                    setActiveInvoiceOrder(order);
                                    setActiveSection("invoices");
                                  }}
                                >
                                  #{order.order_id}
                                </span>
                              </td>
                              <td>
                                {userProfile?.role !== "user" ? (
                                  <span
                                    className="fw-semibold text-dark d-block cursor-pointer text-decoration-underline"
                                    onClick={() =>
                                      setSelectedCustomerProfile({
                                        name: order.customer_name,
                                        phone: order.customer_phone,
                                        address: order.location,
                                      })
                                    }
                                  >
                                    {order.customer_name}
                                  </span>
                                ) : (
                                  <span className="fw-semibold text-dark d-block">
                                    {order.customer_name}
                                  </span>
                                )}
                                <span className="text-secondary small d-block">
                                  <i className="bi bi-telephone me-1"></i>
                                  {order.customer_phone} • {order.location}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-column align-items-start gap-1">
                                  <span className="badge bg-info bg-opacity-10 text-dark border border-info border-opacity-25 px-2 py-1 fw-semibold">
                                    <i className="bi bi-calendar-event me-1 text-primary"></i>
                                    {getOrderDeliverySchedule(order)}
                                  </span>
                                  {order.status !== "Rejected" && (
                                    <button
                                      type="button"
                                      onClick={() => openRescheduleModal(order)}
                                      className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-bold"
                                    >
                                      <i className="bi bi-pencil-square me-1"></i>
                                      Schedule / Change Date
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="fw-bold text-dark">
                                ₹{order.total_amount || 0}
                              </td>
                              <td>
                                <span
                                  className={`badge rounded-pill px-2 py-1 fw-semibold ${getPaymentStatusBadgeStyle(getOrderPaymentStatus(order))}`}
                                >
                                  {getOrderPaymentStatus(order)}
                                </span>
                              </td>
                              <td className="pe-3">
                                <span
                                  className={`badge rounded-pill px-2 py-1 fw-semibold ${getOrderStatusStyle(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= INVOICES & BILLING SECTION ================= */}
          {activeSection === "invoices" && (
            <div className="fade-in">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 no-print">
                <div>
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-receipt-cutoff text-primary me-2"></i>
                    {userProfile?.role === "user"
                      ? "My Invoices"
                      : `Invoices & Billing  ${getShopNameById(currentShopId)}`}
                  </h5>
                  <p className="text-secondary small mb-0">
                    {userProfile?.role === "user"
                      ? "View and download your official order invoices."
                      : "Search strictly by Order ID, edit delivery charges, preview A4 print layout, or send via WhatsApp Web"}
                  </p>
                </div>
                {activeInvoiceOrder && (
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      onClick={handlePreviewInvoice}
                      className="btn btn-primary btn-sm px-3 py-1 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-1"
                    >
                      <i
                        className={`bi ${
                          userProfile?.role === "user"
                            ? "bi-file-earmark-arrow-down-fill"
                            : "bi-printer-fill"
                        }`}
                      ></i>{" "}
                      {userProfile?.role === "user"
                        ? "Download Invoice PDF"
                        : "Preview / Print Invoice"}
                    </button>
                    {userProfile?.role !== "user" && (
                      <button
                        onClick={() =>
                          handleSendInvoiceWhatsApp(activeInvoiceOrder)
                        }
                        className="btn btn-success btn-sm px-3 py-1 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-1"
                      >
                        <i className="bi bi-whatsapp"></i> Send Invoice to
                        Customer
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Summary Cards */}
              {userProfile?.role !== "user" && (
                <div className="row g-2 mb-3 no-print">
                  <div className="col-4">
                    <div className="card border-0 shadow-sm rounded-3 bg-white p-2 px-3 border-start border-4 border-success">
                      <small className="text-secondary fw-bold text-uppercase">
                        Fully Paid
                      </small>
                      <h5 className="fw-bold text-success mb-0">
                        {
                          ordersList.filter(
                            (o) => getOrderPaymentStatus(o) === "Fully Paid",
                          ).length
                        }
                      </h5>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card border-0 shadow-sm rounded-3 bg-white p-2 px-3 border-start border-4 border-warning">
                      <small className="text-secondary fw-bold text-uppercase">
                        Partially Paid
                      </small>
                      <h5 className="fw-bold text-warning mb-0">
                        {
                          ordersList.filter(
                            (o) =>
                              getOrderPaymentStatus(o) === "Partially Paid",
                          ).length
                        }
                      </h5>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="card border-0 shadow-sm rounded-3 bg-white p-2 px-3 border-start border-4 border-danger">
                      <small className="text-secondary fw-bold text-uppercase">
                        Unpaid Bills
                      </small>
                      <h5 className="fw-bold text-danger mb-0">
                        {
                          ordersList.filter(
                            (o) => getOrderPaymentStatus(o) === "Unpaid",
                          ).length
                        }
                      </h5>
                    </div>
                  </div>
                </div>
              )}

              {/* Search & Payment Filter Bar */}
              <div className="card border-0 shadow-sm rounded-3 bg-white mb-3 no-print">
                <div className="card-body p-2 d-flex flex-column flex-md-row gap-2 align-items-center">
                  <div className="position-relative flex-grow-1 w-100">
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-primary"></i>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light border-0 rounded-pill py-2 ps-5"
                      placeholder={
                        userProfile?.role === "user"
                          ? "Search your invoices by Order ID (e.g. 102 or INV-102)..."
                          : "Search strictly by Order ID (e.g. 102 or INV-102) or Customer Name..."
                      }
                      value={invoiceSearchQuery}
                      onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="form-select form-select-sm bg-light border-0 rounded-pill py-2 w-100 w-md-auto fw-semibold text-dark"
                    value={invoicePaymentFilter}
                    onChange={(e) => setInvoicePaymentFilter(e.target.value)}
                    style={{ minWidth: "180px" }}
                  >
                    <option value="All">All Payment Statuses</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid (Not Paid Yet)</option>
                  </select>
                </div>
              </div>

              <div className="row g-3">
                {/* Left Column: Orders / Invoice Selector List */}
                <div className="col-lg-4 no-print">
                  <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden h-100">
                    <div className="card-header bg-white border-bottom p-2 px-3 d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark small">
                        {userProfile?.role === "user"
                          ? "Your Order Invoices"
                          : "Select Order"}
                      </span>
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                        {filteredInvoiceOrders.length}
                      </span>
                    </div>
                    <div
                      className="card-body p-2 custom-scrollbar"
                      style={{ maxHeight: "600px", overflowY: "auto" }}
                    >
                      {filteredInvoiceOrders.length === 0 ? (
                        <div className="text-center py-4 text-muted small">
                          No matching Order ID found.
                        </div>
                      ) : (
                        filteredInvoiceOrders.map((ord: any) => {
                          const pStatus = getOrderPaymentStatus(ord);
                          const pPaid = getOrderPaidAmount(ord);
                          const total = parseFloat(ord.total_amount) || 0;
                          const balance = Math.max(0, total - pPaid);
                          const isSelected =
                            activeInvoiceOrder?.order_id === ord.order_id;

                          return (
                            <div
                              key={ord.order_id}
                              onClick={() => setActiveInvoiceOrder(ord)}
                              className={`p-2 px-3 rounded-3 mb-2 cursor-pointer transition-all border ${
                                isSelected
                                  ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                                  : "border-light bg-white"
                              }`}
                            >
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <div>
                                  <span className="badge bg-dark text-white rounded-pill me-1">
                                    INV-{ord.order_id}
                                  </span>
                                  <strong className="text-dark small">
                                    {ord.customer_name}
                                  </strong>
                                </div>
                                <span
                                  className={`badge rounded-pill fw-semibold ${getPaymentStatusBadgeStyle(pStatus)}`}
                                >
                                  {pStatus}
                                </span>
                              </div>
                              <div className="small text-secondary text-truncate">
                                <i className="bi bi-geo-alt me-1"></i>
                                {ord.location}
                              </div>
                              <div className="d-flex justify-content-between align-items-center pt-1 mt-1 border-top border-light small">
                                <span>
                                  Total: <strong>₹{total}</strong>
                                  {pStatus === "Partially Paid" && (
                                    <span className="ms-1 text-danger fw-semibold">
                                      (Due: ₹{balance})
                                    </span>
                                  )}
                                </span>
                                <small className="text-muted">
                                  {ord.created_at
                                    ? new Date(
                                        ord.created_at,
                                      ).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                      })
                                    : ""}
                                </small>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Auto-Generated Invoice */}
                <div className="col-lg-8 print-full-width">
                  {!activeInvoiceOrder ? (
                    <div className="card border-0 shadow-sm rounded-3 bg-white p-4 text-center h-100 d-flex flex-column justify-content-center align-items-center no-print">
                      <i
                        className="bi bi-receipt-cutoff text-primary opacity-50 mb-2"
                        style={{ fontSize: "3rem" }}
                      ></i>
                      <h6 className="fw-bold text-dark">
                        No Order Selected for Invoice
                      </h6>
                    </div>
                  ) : (
                    <div
                      id="printable-invoice-area"
                      className="card border-0 shadow-sm rounded-3 bg-white p-3 p-md-4 position-relative overflow-hidden"
                    >
                      {/* Admin Payment Status Control Bar */}
                      {userProfile?.role !== "user" && (
                        <div className="bg-light p-2 px-3 rounded-3 mb-3 border d-flex flex-wrap justify-content-between align-items-center gap-2 no-print">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-wallet2 text-primary"></i>
                            <span className="small fw-bold text-dark">
                              Order #{activeInvoiceOrder.order_id} Controls:
                            </span>
                          </div>
                          <div className="d-flex flex-wrap gap-1">
                            <button
                              onClick={() =>
                                handleUpdateDeliveryCharge(activeInvoiceOrder)
                              }
                              className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 fw-bold"
                            >
                              <i className="bi bi-truck me-1"></i> Edit Delivery
                            </button>
                            <button
                              onClick={() =>
                                handlePaymentStatusUpdate(
                                  activeInvoiceOrder,
                                  "Fully Paid",
                                )
                              }
                              className={`btn btn-sm rounded-pill px-2 py-1 fw-bold ${
                                getOrderPaymentStatus(activeInvoiceOrder) ===
                                "Fully Paid"
                                  ? "btn-success text-white"
                                  : "btn-outline-success"
                              }`}
                            >
                              Fully Paid
                            </button>
                            <button
                              onClick={() =>
                                handlePaymentStatusUpdate(
                                  activeInvoiceOrder,
                                  "Partially Paid",
                                )
                              }
                              className={`btn btn-sm rounded-pill px-2 py-1 fw-bold ${
                                getOrderPaymentStatus(activeInvoiceOrder) ===
                                "Partially Paid"
                                  ? "btn-warning text-dark"
                                  : "btn-outline-warning text-dark"
                              }`}
                            >
                              Partial Paid
                            </button>
                            <button
                              onClick={() =>
                                handlePaymentStatusUpdate(
                                  activeInvoiceOrder,
                                  "Unpaid",
                                )
                              }
                              className={`btn btn-sm rounded-pill px-2 py-1 fw-bold ${
                                getOrderPaymentStatus(activeInvoiceOrder) ===
                                "Unpaid"
                                  ? "btn-danger text-white"
                                  : "btn-outline-danger"
                              }`}
                            >
                              Unpaid
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Official Invoice Header */}
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 border-bottom pb-3 mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                            style={{ width: "42px", height: "42px" }}
                          >
                            <i className="bi bi-droplet-half fs-4"></i>
                          </div>
                          <div>
                            <h5 className="fw-bold text-dark mb-0">
                              WashNora{" "}
                              <span className="text-primary">Laundry ERP</span>
                            </h5>
                            <small className="text-secondary d-block">
                              {getShopNameById(
                                getOrderShopId(activeInvoiceOrder),
                              )}
                            </small>
                            <small className="text-muted">
                              Support: +91 7738342274
                            </small>
                          </div>
                        </div>
                        <div className="text-md-end">
                          <h5 className="fw-bold text-uppercase text-primary mb-0">
                            INVOICE #INV-{activeInvoiceOrder.order_id}
                          </h5>
                          <div className="small text-secondary">
                            Date:{" "}
                            {activeInvoiceOrder.created_at
                              ? new Date(
                                  activeInvoiceOrder.created_at,
                                ).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "N/A"}
                          </div>
                          <span
                            className={`badge rounded-pill px-2 py-1 mt-1 fw-bold ${getPaymentStatusBadgeStyle(
                              getOrderPaymentStatus(activeInvoiceOrder),
                            )}`}
                          >
                            PAYMENT:{" "}
                            {getOrderPaymentStatus(
                              activeInvoiceOrder,
                            ).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Order Meta Details */}
                      <div className="row g-2 mb-3">
                        <div className="col-sm-6">
                          <div className="p-2 px-3 bg-light rounded-3 h-100 border">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                              Billed To (Customer)
                            </small>
                            <div className="fw-bold text-dark small">
                              {activeInvoiceOrder.customer_name}
                            </div>
                            <div className="small text-secondary">
                              <i className="bi bi-telephone-fill me-1 text-primary"></i>
                              {activeInvoiceOrder.customer_phone}
                            </div>
                            <div className="small text-secondary">
                              <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                              {activeInvoiceOrder.location}
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="p-2 px-3 bg-light rounded-3 h-100 border">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                              Order & Delivery Info
                            </small>
                            <div className="small text-secondary">
                              <strong>Order ID:</strong> #
                              {activeInvoiceOrder.order_id} •{" "}
                              <strong>Status:</strong>{" "}
                              {activeInvoiceOrder.status}
                            </div>
                            <div className="small text-secondary">
                              <strong>Payment Mode:</strong>{" "}
                              {activeInvoiceOrder.service_type?.includes(
                                "[Razorpay:",
                              )
                                ? "Online (Razorpay)"
                                : "Cash / COD"}
                            </div>
                            <div className="small text-primary fw-semibold">
                              <strong>Delivery:</strong>{" "}
                              {getOrderDeliverySchedule(activeInvoiceOrder)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Itemized Services Table */}
                      <div className="table-responsive mb-3">
                        <table className="table table-bordered table-sm align-middle mb-0">
                          <thead className="bg-light">
                            <tr
                              className="text-secondary"
                              style={{ fontSize: "0.78rem" }}
                            >
                              <th className="py-2 ps-3">#</th>
                              <th className="py-2">ORDERED SERVICE / ITEM</th>
                              <th className="py-2 text-center">QTY</th>
                              <th className="py-2 text-end">RATE</th>
                              <th className="py-2 pe-3 text-end">LINE TOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseOrderItemsForInvoice(activeInvoiceOrder).map(
                              (item: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="ps-3 fw-semibold text-secondary">
                                    {idx + 1}
                                  </td>
                                  <td className="fw-bold text-dark">
                                    {item.name}
                                  </td>
                                  <td className="text-center fw-semibold">
                                    {item.qty}
                                  </td>
                                  <td className="text-end text-dark fw-medium">
                                    ₹{item.unitPrice}
                                  </td>
                                  <td className="pe-3 text-end fw-bold text-dark">
                                    ₹{item.total}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Financial Breakdown */}
                      {(() => {
                        const totalAmt =
                          parseFloat(activeInvoiceOrder.total_amount) || 0;
                        const deliveryCharge =
                          getOrderDeliveryCharge(activeInvoiceOrder);
                        const subtotalAmt = Math.max(
                          0,
                          totalAmt - deliveryCharge,
                        );
                        const paidAmt = getOrderPaidAmount(activeInvoiceOrder);
                        const balanceAmt = Math.max(0, totalAmt - paidAmt);
                        return (
                          <div className="row justify-content-end">
                            <div className="col-md-7">
                              <div className="bg-light p-3 rounded-3 border">
                                <div className="d-flex justify-content-between mb-1 small">
                                  <span className="text-secondary">
                                    Subtotal Amount:
                                  </span>
                                  <strong className="text-dark">
                                    ₹{subtotalAmt}
                                  </strong>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-1 small">
                                  <span className="text-secondary">
                                    Pickup & Delivery Charges:
                                  </span>
                                  <div className="d-flex align-items-center gap-2">
                                    {deliveryCharge === 0 ? (
                                      <strong className="text-success">
                                        FREE
                                      </strong>
                                    ) : (
                                      <strong className="text-dark">
                                        ₹{deliveryCharge}
                                      </strong>
                                    )}
                                    {userProfile?.role !== "user" && (
                                      <button
                                        onClick={() =>
                                          handleUpdateDeliveryCharge(
                                            activeInvoiceOrder,
                                          )
                                        }
                                        className="btn btn-sm btn-white border text-primary py-0 px-2 rounded-pill no-print"
                                        style={{ fontSize: "0.68rem" }}
                                      >
                                        <i className="bi bi-pencil-fill me-1"></i>
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between mb-1 pt-1 border-top">
                                  <span className="fw-bold text-dark small">
                                    Grand Total:
                                  </span>
                                  <h6 className="fw-bold text-primary mb-0">
                                    ₹{totalAmt}
                                  </h6>
                                </div>
                                <div className="d-flex justify-content-between mb-1 small">
                                  <span className="text-success fw-semibold">
                                    Amount Paid:
                                  </span>
                                  <strong className="text-success">
                                    ₹{paidAmt}
                                  </strong>
                                </div>
                                <div className="d-flex justify-content-between pt-1 border-top">
                                  <span className="fw-bold text-danger small">
                                    Balance Due:
                                  </span>
                                  <h6 className="fw-bold text-danger mb-0">
                                    ₹{balanceAmt}
                                  </h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 border-top mt-3 pt-2 small text-muted">
                        <div>
                          <div className="text-dark fw-medium">
                            Thank you for choosing{" "}
                            <strong>WashNora Laundry Services</strong>!
                          </div>
                          <div className="text-secondary fw-semibold">
                            This invoice is generated by{" "}
                            <span className="text-primary fw-bold">
                              Zen-Tech Systems
                            </span>
                            .
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-2 no-print">
                          <button
                            onClick={handlePreviewInvoice}
                            className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                          >
                            <i
                              className={`bi ${
                                userProfile?.role === "user"
                                  ? "bi-file-earmark-arrow-down-fill"
                                  : "bi-printer-fill"
                              }`}
                            ></i>{" "}
                            {userProfile?.role === "user"
                              ? "Download Invoice PDF"
                              : "Preview Invoice"}
                          </button>
                          {userProfile?.role !== "user" && (
                            <button
                              onClick={() =>
                                handleSendInvoiceWhatsApp(activeInvoiceOrder)
                              }
                              className="btn btn-success btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                            >
                              <i className="bi bi-whatsapp"></i> Send Invoice to
                              Customer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= SERVICES SECTION ================= */}
          {activeSection === "services" &&
            (userProfile?.role === "admin" ||
              userProfile?.role === "manager") && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold text-dark mb-0">Services Catalog</h5>
                  <button
                    onClick={openAddServiceModal}
                    className="btn btn-primary btn-sm px-3 py-1 fw-medium rounded-3 shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-circle"></i> Add New Service
                  </button>
                </div>

                <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-custom align-middle mb-0">
                        <thead className="bg-light border-bottom">
                          <tr className="text-secondary">
                            <th className="ps-3">SERVICE ID</th>
                            <th>SERVICE NAME</th>
                            <th>PRICE PER PIECE</th>
                            <th className="pe-3 text-end">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clothCatalog.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center py-4 text-muted"
                              >
                                No services found.
                              </td>
                            </tr>
                          ) : (
                            clothCatalog.map((service: any) => (
                              <tr
                                key={service.service_id}
                                className="border-bottom border-light"
                              >
                                <td className="ps-3 fw-bold text-secondary">
                                  #{service.service_id}
                                </td>
                                <td className="fw-bold text-dark">
                                  {service.name}
                                </td>
                                <td>
                                  <span className="fw-bold text-success bg-success bg-opacity-10 rounded-pill px-2 py-1">
                                    ₹{service.price}
                                  </span>
                                </td>
                                <td className="pe-3 text-end">
                                  <button
                                    onClick={() =>
                                      openEditServiceModal(service)
                                    }
                                    className="btn btn-sm btn-light border text-primary rounded-2 py-0 px-2 me-1"
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteService(service.service_id)
                                    }
                                    className="btn btn-sm btn-white text-danger border rounded-2 py-0 px-2"
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* ================= ORDERS SECTION ================= */}
          {activeSection === "orders" && (
            <div className="fade-in">
              {userProfile?.role === "user" ? (
                <div className="fade-in">
                  <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-0">
                        Book a Laundry Service{" "}
                        <i className="bi bi-stars text-warning"></i>
                      </h5>
                      <small className="text-secondary">
                        Ordering from:{" "}
                        <strong className="text-primary">
                          {customerHasLockedStore
                            ? getShopNameById(currentShopId)
                            : "Please Select Your Store First"}
                        </strong>
                      </small>
                    </div>
                  </div>
                  <div className="row g-3">
                    <div className="col-lg-7">
                      <div className="row g-2">
                        {clothCatalog.map((cloth) => (
                          <div className="col-sm-6" key={cloth.service_id}>
                            <div className="card border border-light shadow-sm rounded-3 p-2 px-3 h-100 d-flex flex-row justify-content-between align-items-center bg-white premium-hover cursor-pointer">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center"
                                  style={{ width: "36px", height: "36px" }}
                                >
                                  <i
                                    className={`bi ${cloth.name.toLowerCase().includes("shirt") ? "bi-file-person" : cloth.name.toLowerCase().includes("bed") ? "bi-layout-text-window" : "bi-tag"}`}
                                  ></i>
                                </div>
                                <div>
                                  <div className="fw-bold text-dark small">
                                    {cloth.name}
                                  </div>
                                  <div className="text-primary fw-bold small">
                                    ₹{cloth.price}{" "}
                                    <span className="text-muted fw-normal">
                                      / pc
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => addToCart(cloth)}
                                className="btn btn-light text-primary btn-sm rounded-circle shadow-sm d-flex justify-content-center align-items-center add-btn-hover"
                                style={{ width: "30px", height: "30px" }}
                              >
                                <i className="bi bi-plus-lg fw-bold"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <div className="card border-0 shadow-sm rounded-3 p-3 bg-white position-relative overflow-hidden cart-card-premium">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-dark mb-0">
                            Order Summary
                          </h6>
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 fw-bold">
                            {cart.length} Items
                          </span>
                        </div>

                        {cart.length === 0 ? (
                          <div className="text-center py-4">
                            <i
                              className="bi bi-basket2 text-muted opacity-50"
                              style={{ fontSize: "2rem" }}
                            ></i>
                            <p className="fw-bold text-dark small mt-2 mb-0">
                              Your cart is empty
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div
                              className="d-flex flex-column gap-2 mb-3 pe-1 custom-scrollbar"
                              style={{
                                maxHeight: "180px",
                                overflowY: "auto",
                              }}
                            >
                              {cart.map((item: any) => (
                                <div
                                  key={item.service_id}
                                  className="d-flex justify-content-between align-items-center p-2 border border-light rounded-3 bg-light"
                                >
                                  <div>
                                    <div className="fw-bold text-dark small">
                                      {item.name}
                                    </div>
                                    <small className="text-secondary">
                                      ₹{item.price} x {item.qty}
                                    </small>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold text-dark small">
                                      ₹{item.price * item.qty}
                                    </span>
                                    <button
                                      onClick={() =>
                                        removeFromCart(item.service_id)
                                      }
                                      className="btn btn-sm btn-white text-danger border rounded-circle p-0 d-flex justify-content-center align-items-center"
                                      style={{ width: "24px", height: "24px" }}
                                    >
                                      <i
                                        className="bi bi-trash3-fill"
                                        style={{ fontSize: "0.65rem" }}
                                      ></i>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* DELIVERY SPEED & CUSTOM DATE/TIME SELECTOR */}
                            <div className="fw-bold text-dark small mb-2">
                              <i className="bi bi-truck text-primary me-1"></i>
                              Select Delivery Option
                            </div>
                            <div className="d-flex flex-column gap-1 mb-3">
                              <div
                                onClick={() => setDeliveryOption("Standard")}
                                className={`payment-card d-flex justify-content-between align-items-center p-2 rounded-3 cursor-pointer ${
                                  deliveryOption === "Standard"
                                    ? "active"
                                    : "border border-light bg-light"
                                }`}
                              >
                                <div>
                                  <span className="fw-bold text-dark d-block small">
                                    Standard Delivery (48–72 Hrs)
                                  </span>
                                </div>
                                <span className="badge bg-success rounded-pill">
                                  FREE
                                </span>
                              </div>

                              <div
                                onClick={() => setDeliveryOption("Fast")}
                                className={`payment-card d-flex justify-content-between align-items-center p-2 rounded-3 cursor-pointer ${
                                  deliveryOption === "Fast"
                                    ? "active"
                                    : "border border-light bg-light"
                                }`}
                              >
                                <div>
                                  <span className="fw-bold text-dark d-block small">
                                    <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                                    Fast Express (24 Hrs)
                                  </span>
                                </div>
                                <span className="badge bg-warning text-dark rounded-pill">
                                  +₹{FAST_DELIVERY_FEE}
                                </span>
                              </div>

                              <div
                                onClick={() => setDeliveryOption("Custom")}
                                className={`payment-card d-flex justify-content-between align-items-center p-2 rounded-3 cursor-pointer ${
                                  deliveryOption === "Custom"
                                    ? "active"
                                    : "border border-light bg-light"
                                }`}
                              >
                                <div>
                                  <span className="fw-bold text-dark d-block small">
                                    <i className="bi bi-calendar-event text-primary me-1"></i>
                                    Custom Date & Time
                                  </span>
                                </div>
                                <span className="badge bg-primary rounded-pill">
                                  Pick Date
                                </span>
                              </div>
                            </div>

                            {deliveryOption === "Custom" && (
                              <div className="p-2 bg-light rounded-3 border mb-3">
                                <div className="mb-2">
                                  <label className="form-label small fw-bold text-dark mb-1">
                                    Delivery Date
                                  </label>
                                  <input
                                    type="date"
                                    className="form-control form-control-sm border-0"
                                    min={getLocalYYYYMMDD()}
                                    value={customDeliveryDate}
                                    onChange={(e) =>
                                      setCustomDeliveryDate(e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="form-label small fw-bold text-dark mb-1">
                                    Time Slot
                                  </label>
                                  <select
                                    className="form-select form-select-sm border-0"
                                    value={customDeliveryTime}
                                    onChange={(e) =>
                                      setCustomDeliveryTime(e.target.value)
                                    }
                                  >
                                    <option value="09:00 AM - 12:00 PM">
                                      Morning (09:00 AM - 12:00 PM)
                                    </option>
                                    <option value="12:00 PM - 03:00 PM">
                                      Afternoon (12:00 PM - 03:00 PM)
                                    </option>
                                    <option value="03:00 PM - 06:00 PM">
                                      Evening (03:00 PM - 06:00 PM)
                                    </option>
                                    <option value="06:00 PM - 09:00 PM">
                                      Night (06:00 PM - 09:00 PM)
                                    </option>
                                  </select>
                                </div>
                              </div>
                            )}

                            <div className="border-top pt-2 mb-3">
                              <div className="d-flex justify-content-between small mb-1">
                                <span className="text-secondary">
                                  Items Subtotal
                                </span>
                                <strong className="text-dark">
                                  ₹{calculateCartSubtotal()}
                                </strong>
                              </div>
                              <div className="d-flex justify-content-between small mb-2">
                                <span className="text-secondary">
                                  Delivery ({deliveryOption})
                                </span>
                                {getCheckoutDeliveryFee() === 0 ? (
                                  <strong className="text-success">Free</strong>
                                ) : (
                                  <strong className="text-dark">
                                    ₹{getCheckoutDeliveryFee()}
                                  </strong>
                                )}
                              </div>
                              <div className="d-flex justify-content-between align-items-center p-2 bg-primary bg-opacity-10 rounded-3">
                                <span className="text-primary fw-bold small">
                                  Total Amount
                                </span>
                                <h6 className="fw-bold text-primary mb-0">
                                  ₹{calculateCartTotal()}
                                </h6>
                              </div>
                            </div>

                            <div className="d-flex gap-2 mb-3">
                              <div
                                className={`payment-card flex-fill p-2 rounded-3 text-center cursor-pointer small fw-bold ${paymentMethod === "Online" ? "active text-primary" : "border bg-light text-secondary"}`}
                                onClick={() => setPaymentMethod("Online")}
                              >
                                <i className="bi bi-credit-card me-1"></i>Online
                              </div>
                              <div
                                className={`payment-card flex-fill p-2 rounded-3 text-center cursor-pointer small fw-bold ${paymentMethod === "Cod" ? "active text-success" : "border bg-light text-secondary"}`}
                                onClick={() => setPaymentMethod("Cod")}
                              >
                                <i className="bi bi-cash-coin me-1"></i>COD
                              </div>
                            </div>

                            <button
                              onClick={handleCheckout}
                              className="btn btn-gradient btn-sm w-100 fw-bold py-2 rounded-pill text-white shadow"
                            >
                              {paymentMethod === "Online"
                                ? "Proceed to Pay"
                                : "Place Order"}{" "}
                              <i className="bi bi-arrow-right-circle-fill ms-1"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h5 className="fw-bold text-dark mb-0">
                      Order Management {getShopNameById(currentShopId)}
                    </h5>
                  </div>
                  <div className="card border-0 shadow-sm rounded-3 bg-white mb-3">
                    <div className="card-body p-2 d-flex flex-column flex-md-row gap-2 align-items-center">
                      <div className="position-relative flex-grow-1 w-100">
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light border-0 rounded-pill py-2 ps-5"
                          placeholder="Search by Order ID or Customer Name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <select
                        className="form-select form-select-sm bg-light border-0 rounded-pill py-2 w-100 w-md-auto fw-medium text-dark"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ minWidth: "160px" }}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pickup">Pickup</option>
                        <option value="Received">Received</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Finished">Finished</option>
                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm rounded-3 bg-white">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-custom align-middle mb-0">
                          <thead className="bg-light border-bottom">
                            <tr className="text-secondary">
                              <th className="ps-3">ORDER ID</th>
                              <th>DATE</th>
                              <th>CUSTOMER INFO</th>
                              <th>DELIVERY SCHEDULE</th>
                              <th>AMOUNT</th>
                              <th>PAYMENT</th>
                              <th>STATUS</th>
                              <th className="pe-3 text-end">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="text-center py-4 text-muted"
                                >
                                  No orders found for this branch.
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((order: any) => (
                                <tr
                                  key={order.order_id}
                                  className="border-bottom border-light"
                                >
                                  <td className="ps-3 fw-bold text-dark">
                                    <span
                                      className="text-primary text-decoration-underline cursor-pointer"
                                      onClick={() =>
                                        setSelectedOrderDetails(order)
                                      }
                                    >
                                      #{order.order_id}
                                    </span>
                                  </td>
                                  <td className="text-secondary small">
                                    {order.created_at
                                      ? new Date(
                                          order.created_at,
                                        ).toLocaleString("en-IN", {
                                          dateStyle: "short",
                                          timeStyle: "short",
                                        })
                                      : "N/A"}
                                  </td>
                                  <td>
                                    <span
                                      className="fw-semibold text-dark d-block cursor-pointer text-decoration-underline"
                                      onClick={() =>
                                        setSelectedCustomerProfile({
                                          name: order.customer_name,
                                          phone: order.customer_phone,
                                          address: order.location,
                                        })
                                      }
                                    >
                                      {order.customer_name}
                                    </span>
                                    <span className="text-secondary small">
                                      {order.customer_phone}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex flex-column align-items-start gap-1">
                                      <span className="badge bg-info bg-opacity-10 text-dark border border-info border-opacity-25 px-2 py-1 fw-semibold">
                                        {getOrderDeliverySchedule(order)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openRescheduleModal(order)
                                        }
                                        className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-bold"
                                      >
                                        <i className="bi bi-pencil-square me-1"></i>
                                        Change Schedule
                                      </button>
                                    </div>
                                  </td>
                                  <td className="fw-bold text-dark">
                                    ₹{order.total_amount || 0}
                                  </td>
                                  <td>
                                    <select
                                      className={`form-select form-select-sm d-inline-block w-auto rounded-pill px-2 py-0 fw-semibold cursor-pointer ${getPaymentStatusBadgeStyle(getOrderPaymentStatus(order))}`}
                                      value={getOrderPaymentStatus(order)}
                                      onChange={(e) =>
                                        handlePaymentStatusUpdate(
                                          order,
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="Fully Paid">
                                        Fully Paid
                                      </option>
                                      <option value="Partially Paid">
                                        Partially Paid
                                      </option>
                                      <option value="Unpaid">Unpaid</option>
                                    </select>
                                  </td>
                                  <td>
                                    <span
                                      className={`badge rounded-pill px-2 py-1 fw-semibold ${getOrderStatusStyle(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="pe-3 text-end">
                                    <div className="d-flex align-items-center justify-content-end gap-1">
                                      <button
                                        onClick={() => {
                                          setActiveInvoiceOrder(order);
                                          setActiveSection("invoices");
                                        }}
                                        className="btn btn-sm btn-outline-primary rounded-2 py-0 px-2"
                                        title="View Invoice"
                                      >
                                        <i className="bi bi-receipt"></i>
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleSendInvoiceWhatsApp(order)
                                        }
                                        className="btn btn-sm btn-outline-success rounded-2 py-0 px-2"
                                        title="Send on WhatsApp"
                                      >
                                        <i className="bi bi-whatsapp"></i>
                                      </button>
                                      <select
                                        className="form-select form-select-sm d-inline-block w-auto border rounded-2 bg-white text-secondary py-0 px-2 cursor-pointer"
                                        value={order.status}
                                        onChange={(e: any) =>
                                          handleOrderStatusUpdate(
                                            order.order_id,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="Pickup">Pickup</option>
                                        <option value="Received">
                                          Received
                                        </option>
                                        <option value="In Progress">
                                          In Progress
                                        </option>
                                        <option value="Finished">
                                          Finished
                                        </option>
                                        <option value="Out for Delivery">
                                          Out for Delivery
                                        </option>
                                        <option value="Rejected">
                                          Rejected
                                        </option>
                                      </select>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= PAYROLL SECTION ================= */}
          {activeSection === "payroll" && userProfile?.role === "admin" && (
            <div className="fade-in">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold text-dark mb-0">Payroll Management</h5>
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="btn btn-primary btn-sm px-3 py-1 fw-medium rounded-3 shadow-sm d-flex align-items-center gap-1"
                >
                  <i className="bi bi-person-plus-fill"></i> Add Staff
                </button>
              </div>
              <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover table-custom align-middle mb-0">
                      <thead className="bg-light border-bottom">
                        <tr className="text-secondary">
                          <th className="ps-3">STAFF NAME</th>
                          <th>DESIGNATION</th>
                          <th>
                            SALARY{" "}
                            <button
                              onClick={handleUnlockSalary}
                              className="btn btn-link text-muted p-0 ms-1 text-decoration-none border-0"
                            >
                              <i
                                className={`bi ${isSalaryVisible ? "bi-unlock-fill text-primary" : "bi-lock-fill"}`}
                              ></i>
                            </button>
                          </th>
                          <th>PAYMENT STATUS</th>
                          <th className="pe-3 text-end">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-4 text-muted"
                            >
                              No staff found.
                            </td>
                          </tr>
                        ) : (
                          payrollList.map((staff: any) => (
                            <tr
                              key={staff.staff_id}
                              className="border-bottom border-light"
                            >
                              <td className="ps-3 fw-bold text-dark">
                                {staff.staff_name}
                              </td>
                              <td className="text-secondary">
                                {staff.designation}
                              </td>
                              <td className="fw-bold text-dark">
                                {isSalaryVisible
                                  ? `₹${staff.monthly_salary}`
                                  : "₹ * * * *"}
                              </td>
                              <td>
                                <span
                                  className={`badge rounded-pill px-2 py-1 fw-semibold ${getPayrollStatusStyle(staff.status)}`}
                                >
                                  {staff.status}
                                </span>
                              </td>
                              <td className="pe-3 text-end d-flex align-items-center justify-content-end gap-1">
                                <select
                                  className="form-select form-select-sm d-inline-block w-auto border rounded-2 bg-white text-secondary py-0 px-2"
                                  value={staff.status}
                                  onChange={(e) =>
                                    handlePayrollStatusUpdate(
                                      staff.staff_id,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Overdue">Overdue</option>
                                </select>
                                {isSalaryVisible && (
                                  <button
                                    onClick={() =>
                                      handleUpdateSalary(
                                        staff.staff_id,
                                        staff.monthly_salary,
                                        staff.staff_name,
                                      )
                                    }
                                    className="btn btn-sm btn-light border rounded-2 py-0 px-2"
                                  >
                                    <i className="bi bi-pencil-square text-primary"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= INVENTORY / STOCKS SECTION ================= */}
          {activeSection === "stocks" &&
            (userProfile?.role === "admin" ||
              userProfile?.role === "manager") && (
              <div className="fade-in">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold text-dark mb-0">Inventory Stocks</h5>
                  <button
                    onClick={openAddStockModal}
                    className="btn btn-primary btn-sm px-3 py-1 fw-medium rounded-3 shadow-sm d-flex align-items-center gap-1"
                  >
                    <i className="bi bi-plus-circle"></i> Add Stock Item
                  </button>
                </div>
                <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-custom align-middle mb-0">
                        <thead className="bg-light border-bottom">
                          <tr className="text-secondary">
                            <th className="ps-3">STOCK ID</th>
                            <th>ITEM NAME</th>
                            <th>QUANTITY (PCS)</th>
                            <th>BASE PRICE</th>
                            <th className="pe-3 text-end">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stocksList.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="text-center py-4 text-muted"
                              >
                                No inventory stocks found.
                              </td>
                            </tr>
                          ) : (
                            stocksList.map((stock: any) => (
                              <tr
                                key={stock.stock_id}
                                className="border-bottom border-light"
                              >
                                <td className="ps-3 fw-bold text-secondary">
                                  #{stock.stock_id}
                                </td>
                                <td className="fw-bold text-dark">
                                  {stock.item_name}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <button
                                      onClick={() =>
                                        handleStockAdjust(stock, -1)
                                      }
                                      className="btn btn-sm btn-outline-danger rounded-circle p-0 d-flex justify-content-center align-items-center"
                                      style={{ width: "24px", height: "24px" }}
                                    >
                                      <i className="bi bi-dash"></i>
                                    </button>
                                    <input
                                      key={`stock-input-${stock.stock_id}-${stock.quantity}`}
                                      type="number"
                                      min="0"
                                      className="form-control form-control-sm text-center fw-bold border-0 mx-1 py-0"
                                      style={{
                                        width: "56px",
                                        backgroundColor: "#e2e8f0",
                                      }}
                                      defaultValue={stock.quantity}
                                      onBlur={(e) =>
                                        handleStockSet(stock, e.target.value)
                                      }
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        e.currentTarget.blur()
                                      }
                                    />
                                    <button
                                      onClick={() =>
                                        handleStockAdjust(stock, 1)
                                      }
                                      className="btn btn-sm btn-outline-success rounded-circle p-0 d-flex justify-content-center align-items-center"
                                      style={{ width: "24px", height: "24px" }}
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                </td>
                                <td className="fw-medium text-secondary">
                                  ₹{stock.price_per_unit || 0} / pcs
                                </td>
                                <td className="pe-3 text-end">
                                  <button
                                    onClick={() => openEditStockModal(stock)}
                                    className="btn btn-sm btn-light border text-primary rounded-2 py-0 px-2 me-1"
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteStock(stock.stock_id)
                                    }
                                    className="btn btn-sm btn-white text-danger border rounded-2 py-0 px-2"
                                  >
                                    <i className="bi bi-trash3-fill"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* ================= REPORTS SECTION ================= */}
          {activeSection === "reports" && userProfile?.role !== "user" && (
            <div className="fade-in">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 no-print">
                <h5 className="fw-bold text-dark mb-0">
                  Financial Reports & Analytics {getShopNameById(currentShopId)}
                </h5>
                <button
                  onClick={handleExportPDF}
                  className="btn btn-outline-primary btn-sm px-3 py-1 fw-medium rounded-3 bg-white shadow-sm d-flex align-items-center gap-1"
                >
                  <i className="bi bi-download"></i> Export PDF
                </button>
              </div>

              <div className="row g-2 g-md-3 mb-3">
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-primary">
                    <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                      Today's Paid Revenue
                    </p>
                    <h5 className="fw-bold text-dark mb-0">
                      ₹{dashboardStats.todayRev}
                    </h5>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-success">
                    <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                      Monthly Paid Revenue
                    </p>
                    <h5 className="fw-bold text-dark mb-0">
                      ₹{dashboardStats.monthRev}
                    </h5>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-warning">
                    <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                      Yearly Paid Revenue
                    </p>
                    <h5 className="fw-bold text-dark mb-0">
                      ₹{dashboardStats.yearRev}
                    </h5>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3 border-start border-4 border-info">
                    <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                      Net Profit (Paid - Exp)
                    </p>
                    <h5
                      className={`fw-bold mb-0 ${
                        dashboardStats.revenue - dashboardStats.totalExpenses >=
                        0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      ₹{dashboardStats.revenue - dashboardStats.totalExpenses}
                    </h5>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3">
                    <h6 className="fw-bold text-dark mb-3 small">
                      Revenue Trend (Full & Partial Payments Received)
                    </h6>
                    <div style={{ height: "250px", width: "100%" }}>
                      {revenueLineData.length === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-light rounded-3 border border-dashed">
                          <span className="small text-secondary fw-semibold">
                            No Paid Revenue Data Yet
                          </span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={revenueLineData}
                            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                          >
                            <Line
                              type="monotone"
                              dataKey="Revenue"
                              stroke="#0d6efd"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: "#0d6efd" }}
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "#6c757d" }}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "#6c757d" }}
                              tickFormatter={(val) => `₹${val}`}
                            />
                            <Tooltip
                              formatter={(value) => [`₹${value}`, "Revenue"]}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm rounded-3 h-100 bg-white p-3">
                    <h6 className="fw-bold text-dark mb-3 small">
                      Expense Distribution
                    </h6>
                    <div style={{ height: "250px", width: "100%" }}>
                      {expensePieData.length === 0 ? (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100 bg-light rounded-3 border border-dashed">
                          <span className="small text-secondary fw-semibold">
                            No Expenses Logged
                          </span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expensePieData}
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {expensePieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [`₹${value}`, "Amount"]}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={30}
                              iconType="circle"
                              wrapperStyle={{ fontSize: "11px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">Expense Ledger</h6>
                  <button
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="btn btn-primary btn-sm px-3 fw-medium rounded-3 no-print"
                  >
                    <i className="bi bi-plus-lg me-1"></i> Add Expense
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover table-custom align-middle mb-0">
                      <thead className="bg-light border-bottom">
                        <tr className="text-secondary">
                          <th className="ps-3">DATE</th>
                          <th>CATEGORY</th>
                          <th>DESCRIPTION</th>
                          <th className="pe-3 text-end">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-4 text-muted"
                            >
                              No expenses logged yet.
                            </td>
                          </tr>
                        ) : (
                          reportsList.map((expense: any) => (
                            <tr
                              key={expense.expense_id}
                              className="border-bottom border-light"
                            >
                              <td className="ps-3 fw-semibold text-dark">
                                {new Date(
                                  expense.created_at ||
                                    expense.expense_date ||
                                    Date.now(),
                                ).toLocaleDateString("en-IN", {
                                  dateStyle: "medium",
                                })}
                              </td>
                              <td className="text-secondary">
                                {expense.category}
                              </td>
                              <td className="text-secondary">
                                {expense.description}
                              </td>
                              <td className="pe-3 text-end fw-bold text-danger">
                                - ₹{expense.amount}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ================= INSTAGRAM-STYLE MOBILE BOTTOM NAVIGATION BAR (END USERS ONLY) ================= */}
      {isUserMobileView && (
        <nav
          className="mobile-user-bottom-nav no-print"
          aria-label="Mobile Bottom Navigation"
        >
          <button
            type="button"
            onClick={() => {
              setIsProfilePopupOpen(false);
              setActiveSection("dashboard");
            }}
            className={`mobile-nav-btn ${
              activeSection === "dashboard" && !isProfilePopupOpen
                ? "active"
                : ""
            }`}
          >
            <i
              className={`bi ${
                activeSection === "dashboard" && !isProfilePopupOpen
                  ? "bi-house-door-fill"
                  : "bi-house-door"
              }`}
            ></i>
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsProfilePopupOpen(false);
              setActiveSection("orders");
            }}
            className={`mobile-nav-btn position-relative ${
              activeSection === "orders" && !isProfilePopupOpen ? "active" : ""
            }`}
          >
            <div className="position-relative d-inline-block">
              <i
                className={`bi ${
                  activeSection === "orders" && !isProfilePopupOpen
                    ? "bi-plus-square-fill"
                    : "bi-plus-square"
                }`}
              ></i>
              {totalCartItemsCount > 0 && (
                <span className="mobile-cart-badge">{totalCartItemsCount}</span>
              )}
            </div>
            <span>Book Order</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsProfilePopupOpen(false);
              setActiveSection("invoices");
              if (!activeInvoiceOrder && ordersList.length > 0) {
                setActiveInvoiceOrder(ordersList[0]);
              }
            }}
            className={`mobile-nav-btn ${
              activeSection === "invoices" && !isProfilePopupOpen
                ? "active"
                : ""
            }`}
          >
            <i
              className={`bi ${
                activeSection === "invoices" && !isProfilePopupOpen
                  ? "bi-receipt-cutoff"
                  : "bi-receipt"
              }`}
            ></i>
            <span>Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => setIsProfilePopupOpen(true)}
            className={`mobile-nav-btn ${isProfilePopupOpen ? "active" : ""}`}
          >
            <div
              className={`mobile-profile-avatar ${
                isProfilePopupOpen ? "active-ring" : ""
              }`}
            >
              {userProfile?.full_name
                ? userProfile.full_name[0].toUpperCase()
                : "U"}
            </div>
            <span>Profile</span>
          </button>
        </nav>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Compact Global Font & Table Sizing to Prevent Overlap */
        .compact-erp-ui {
          font-size: 0.84rem !important;
        }
        .compact-erp-ui h4 { font-size: 1.2rem !important; }
        .compact-erp-ui h5 { font-size: 1.02rem !important; }
        .compact-erp-ui h6 { font-size: 0.9rem !important; }
        .compact-erp-ui .small, .compact-erp-ui small { font-size: 0.74rem !important; }
        .compact-erp-ui .badge { font-size: 0.7rem !important; }
        .compact-erp-ui .btn-sm { font-size: 0.75rem !important; }
        .compact-erp-ui .form-control, .compact-erp-ui .form-select { font-size: 0.8rem !important; }

        .table-custom th {
          padding: 0.6rem 0.65rem !important;
          font-size: 0.68rem !important;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }
        .table-custom td {
          padding: 0.6rem 0.65rem !important;
          font-size: 0.78rem !important;
          vertical-align: middle;
        }

        .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .scale-up { animation: scaleUp 0.3s ease forwards; box-shadow: 0 0 15px rgba(13, 110, 253, 0.5); }
        @keyframes scaleUp { from { transform: scale(1); } to { transform: scale(1.04); } }

        .hover-bg-dark:hover { background-color: rgba(255,255,255,0.05) !important; color: white !important; }
        .hover-primary:hover { color: #0d6efd !important; }
        body { background-color: #F8F9FB; }
        
        .premium-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(13, 110, 253, 0.1) !important; border-color: rgba(13, 110, 253, 0.3) !important; }
        .add-btn-hover { transition: all 0.2s ease; }
        .premium-hover:hover .add-btn-hover { background-color: #0d6efd !important; color: white !important; }
        .cart-card-premium { border-top: 3px solid #0d6efd !important; }

        .border-dashed { border-style: dashed !important; border-width: 1.5px !important; border-color: #dee2e6 !important; }
        .payment-card { transition: all 0.2s ease; border: 1.5px solid transparent; }
        .payment-card.active { border-color: #0d6efd !important; background-color: rgba(13, 110, 253, 0.06) !important; }

        .btn-gradient { background: linear-gradient(135deg, #0d6efd, #6f42c1); border: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
        
        input[type="number"]::-webkit-inner-spin-button, 
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

        /* Instagram-Style Mobile Bottom Navigation Bar */
        .mobile-user-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(62px + env(safe-area-inset-bottom, 0px));
          padding-bottom: env(safe-area-inset-bottom, 0px);
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 -4px 20px rgba(10, 17, 40, 0.06);
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 1080;
        }
        .mobile-nav-btn {
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2px;
          color: #6c757d;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 6px 0;
          transition: all 0.2s ease;
        }
        .mobile-nav-btn i {
          font-size: 1.3rem;
          line-height: 1;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mobile-nav-btn.active {
          color: #0d6efd;
          font-weight: 700;
        }
        .mobile-nav-btn.active i {
          transform: translateY(-1px) scale(1.1);
        }
        .mobile-cart-badge {
          position: absolute;
          top: -5px;
          right: -9px;
          background: #dc3545;
          color: #fff;
          font-size: 0.58rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 1.5px solid #fff;
        }
        .mobile-profile-avatar {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #0d6efd;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
        }
        .mobile-profile-avatar.active-ring {
          border-color: #0a1128;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.35);
          transform: scale(1.08);
        }

        /* Zero-Margin Print Rules: Removes Browser Top Date/Title & Bottom URL/Page Number */
        @page {
          size: A4 portrait;
          margin: 0mm !important;
        }
        @media print {
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0mm !important;
            padding: 0mm !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
          .container-fluid { padding: 0 !important; }
          .print-full-width { width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important; }
          #printable-invoice-area {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
