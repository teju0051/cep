"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

// Strictly allowed Zen-Tech Super Admin emails (fallback in addition to role === 'superadmin')
const ALLOWED_SUPERADMIN_EMAILS = ["tejasshinde021@gmail.com"];

export default function ZenTechSuperAdminPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"clients" | "invoices">("clients");

  // Auth & Super Admin Profile
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // B2B Data States
  const [shopsList, setShopsList] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [saasInvoices, setSaasInvoices] = useState<any[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Selected Store for Detailed Info Modal & Invoice Preview
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [activeSaasInvoice, setActiveSaasInvoice] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load All B2B Stores, Services, Orders & SaaS Invoices (Only called AFTER Super Admin is verified)
  const loadSuperAdminData = async () => {
    setIsLoading(true);

    const { data: shops } = await supabase
      .from("shops")
      .select("*")
      .order("created_at", { ascending: true });

    if (shops) {
      const now = new Date();
      const processedShops = await Promise.all(
        shops.map(async (sh: any) => {
          const endDate = sh.subscription_end
            ? new Date(sh.subscription_end)
            : null;
          if (endDate && endDate <= now && sh.status !== "Suspended") {
            const autoReason =
              "Subscription expired automatically. Please renew your Zen-Tech license.";
            await supabase
              .from("shops")
              .update({ status: "Suspended", suspension_reason: autoReason })
              .eq("shop_id", sh.shop_id);
            return {
              ...sh,
              status: "Suspended",
              suspension_reason: autoReason,
            };
          }
          return sh;
        }),
      );
      setShopsList(processedShops);
      if (selectedShop) {
        const updatedSelected = processedShops.find(
          (s) => s.shop_id === selectedShop.shop_id,
        );
        if (updatedSelected) setSelectedShop(updatedSelected);
      }
    }

    const { data: services } = await supabase
      .from("laundry_services")
      .select("*")
      .order("created_at", { ascending: true });
    if (services) setAllServices(services);

    const { data: orders } = await supabase
      .from("laundry_orders")
      .select(
        "order_id, shop_id, total_amount, service_type, status, created_at",
      );
    if (orders) setAllOrders(orders);

    const { data: invoices } = await supabase
      .from("saas_invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (invoices) {
      setSaasInvoices(invoices);
      if (invoices.length > 0 && !activeSaasInvoice) {
        setActiveSaasInvoice(invoices[0]);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const verifyAndInitSuperAdmin = async () => {
      setIsCheckingAuth(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        window.location.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      const userEmail = (session.user.email || "").toLowerCase().trim();

      // STRICT CHECK: ONLY role === "superadmin" OR explicitly whitelisted Zen-Tech email
      // Regular 'user', 'manager', and store 'admin' are strictly DENIED
      const isStrictSuperAdmin =
        profile?.role === "superadmin" ||
        ALLOWED_SUPERADMIN_EMAILS.includes(userEmail);

      if (!isStrictSuperAdmin) {
        setIsAuthorized(false);
        setIsCheckingAuth(false);
        await Swal.fire({
          icon: "error",
          title: "403 — Restricted Access",
          text: "Unauthorized: Only Zen-Tech Super Admin staff can access this telemetry portal.",
          confirmButtonText: "Return to Dashboard",
          confirmButtonColor: "#dc3545",
          allowOutsideClick: false,
        });
        window.location.replace("/dashboard");
        return;
      }

      // Authorized Super Admin
      setCurrentUser(session.user);
      setUserProfile(
        profile || { full_name: "Zen-Tech Super Admin", role: "superadmin" },
      );
      setIsAuthorized(true);
      setIsCheckingAuth(false);
      await loadSuperAdminData();
    };

    verifyAndInitSuperAdmin();
  }, []);

  // Helper: Get Days & Hours Remaining
  const getSubscriptionTimeStatus = (subEndStr: string) => {
    if (!subEndStr)
      return {
        expired: false,
        daysLeft: 30,
        text: "30 Days Left",
        urgent: false,
      };
    const now = new Date().getTime();
    const end = new Date(subEndStr).getTime();
    const diffMs = end - now;

    if (diffMs <= 0) {
      return { expired: true, daysLeft: 0, text: "EXPIRED", urgent: true };
    }

    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    return {
      expired: false,
      daysLeft,
      text:
        daysLeft > 0
          ? `${daysLeft}d ${hoursLeft}h remaining`
          : `${hoursLeft}h remaining`,
      urgent: daysLeft <= 7,
    };
  };

  // Helper: Match orders to shop
  const getOrdersForShop = (shopId: string) => {
    return allOrders.filter((o: any) => {
      if (o.shop_id === shopId) return true;
      const match = (o.service_type || "").match(/\[SHOP:\s*([^\]]+)\]/i);
      return match ? match[1].trim() === shopId : false;
    });
  };

  // Helper: Match services to shop
  const getServicesForShop = (shopId: string) => {
    const specific = allServices.filter((s: any) => s.shop_id === shopId);
    return specific.length > 0
      ? specific
      : allServices.filter((s: any) => !s.shop_id);
  };

  // ================= 1. MANUAL SUSPEND / ACTIVATE STORE =================
  const handleToggleSuspendStore = async (shop: any) => {
    const isCurrentlySuspended = shop.status === "Suspended";

    if (!isCurrentlySuspended) {
      const { value: customReason, isDismissed } = await Swal.fire({
        title: `Suspend ${shop.shop_name}?`,
        html: `
          <p class="text-secondary small text-start mb-2">
            Suspending this store will immediately terminate the store Admin's active session, block login, and stop customers from placing orders.
          </p>
        `,
        input: "textarea",
        inputLabel: "Custom Suspension Message (Shown to Store Admin)",
        inputPlaceholder:
          "e.g. Your subscription has ended or payment is overdue. Please renew to continue services...",
        inputValue:
          shop.suspension_reason ||
          "Your subscription has been ended. Please renew to continue the service.",
        showCancelButton: true,
        confirmButtonText: "Suspend Store Now",
        confirmButtonColor: "#dc3545",
        inputValidator: (val) => {
          if (!val || !val.trim())
            return "Please enter a suspension reason/message.";
          return null;
        },
      });

      if (isDismissed) return;

      const { error } = await supabase
        .from("shops")
        .update({
          status: "Suspended",
          suspension_reason: customReason.trim(),
        })
        .eq("shop_id", shop.shop_id);

      if (!error) {
        Swal.fire({
          icon: "warning",
          title: "Store Suspended",
          text: `${shop.shop_name} is now inactive. Admin sessions and customer orders are blocked.`,
          timer: 2500,
          showConfirmButton: false,
        });
        await loadSuperAdminData();
      } else {
        Swal.fire("Database Error", error.message, "error");
      }
    } else {
      const defaultNewEnd = new Date();
      defaultNewEnd.setDate(defaultNewEnd.getDate() + 30);
      const isoLocal = new Date(
        defaultNewEnd.getTime() - defaultNewEnd.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);

      const { value: newEndDateTime, isDismissed } = await Swal.fire({
        title: `Reactivate ${shop.shop_name}`,
        html: `<p class="small text-secondary mb-2">Set the new Subscription End Date & Time for this store:</p>`,
        input: "datetime-local",
        inputValue: isoLocal,
        showCancelButton: true,
        confirmButtonText: "Activate Store",
        confirmButtonColor: "#198754",
      });

      if (isDismissed) return;

      const updatedSubEnd = newEndDateTime
        ? new Date(newEndDateTime).toISOString()
        : defaultNewEnd.toISOString();

      const { error } = await supabase
        .from("shops")
        .update({
          status: "Active",
          suspension_reason: null,
          subscription_end: updatedSubEnd,
          last_paid_at: new Date().toISOString(),
        })
        .eq("shop_id", shop.shop_id);

      if (!error) {
        Swal.fire({
          icon: "success",
          title: "Store Reactivated!",
          text: `${shop.shop_name} is now Active.`,
          timer: 2000,
          showConfirmButton: false,
        });
        await loadSuperAdminData();
      } else {
        Swal.fire("Database Error", error.message, "error");
      }
    }
  };

  // ================= 2. UPDATE SUBSCRIPTION END DATE & TIME =================
  const handleUpdateSubscriptionDate = async (shop: any) => {
    const currentEnd = shop.subscription_end
      ? new Date(shop.subscription_end)
      : new Date();
    const isoLocal = new Date(
      currentEnd.getTime() - currentEnd.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    const { value: selectedDateTime, isDismissed } = await Swal.fire({
      title: "Set Subscription End Date & Time",
      html: `
        <div class="text-start small text-secondary mb-2">
          Store: <strong class="text-dark">${shop.shop_name}</strong><br/>
          When this date & time is reached, the Admin session will automatically terminate and redirect to <code>/login</code>.
        </div>
      `,
      input: "datetime-local",
      inputValue: isoLocal,
      showCancelButton: true,
      confirmButtonText: "Save Expiry Date & Time",
      confirmButtonColor: "#0d6efd",
    });

    if (isDismissed || !selectedDateTime) return;

    const newIso = new Date(selectedDateTime).toISOString();
    const isFuture = new Date(selectedDateTime).getTime() > Date.now();

    const { error } = await supabase
      .from("shops")
      .update({
        subscription_end: newIso,
        status: isFuture ? "Active" : "Suspended",
        suspension_reason: isFuture
          ? null
          : "Your subscription has been ended. Please renew to continue the service.",
      })
      .eq("shop_id", shop.shop_id);

    if (!error) {
      Swal.fire({
        icon: "success",
        title: "Subscription Updated!",
        text: `New Expiry: ${new Date(selectedDateTime).toLocaleString("en-IN")}`,
        timer: 2200,
        showConfirmButton: false,
      });
      await loadSuperAdminData();
    } else {
      Swal.fire("Error", error.message, "error");
    }
  };

  // ================= 3. EDIT STORE OWNER DETAILS =================
  const handleEditStoreOwner = async (shop: any) => {
    const { value: formValues, isDismissed } = await Swal.fire({
      title: `Edit Client & Store Info`,
      html: `
        <div class="text-start">
          <label class="form-label small fw-bold mb-1">Store / Branch Name</label>
          <input id="swal-shop-name" class="form-control form-control-sm mb-2" value="${shop.shop_name || ""}" />
          <label class="form-label small fw-bold mb-1">Branch Location</label>
          <input id="swal-branch-loc" class="form-control form-control-sm mb-2" value="${shop.branch_location || ""}" />
          <label class="form-label small fw-bold mb-1">Owner Full Name</label>
          <input id="swal-owner-name" class="form-control form-control-sm mb-2" value="${shop.owner_name || ""}" />
          <label class="form-label small fw-bold mb-1">Owner Phone (WhatsApp)</label>
          <input id="swal-owner-phone" class="form-control form-control-sm mb-2" value="${shop.owner_phone || ""}" />
          <label class="form-label small fw-bold mb-1">Owner Email</label>
          <input id="swal-owner-email" class="form-control form-control-sm mb-2" value="${shop.owner_email || ""}" />
          <label class="form-label small fw-bold mb-1">Subscription Plan Amount (₹)</label>
          <input id="swal-plan-amt" type="number" class="form-control form-control-sm" value="${shop.last_invoice_amount || 4999}" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      confirmButtonColor: "#0d6efd",
      preConfirm: () => {
        return {
          shop_name: (
            document.getElementById("swal-shop-name") as HTMLInputElement
          ).value.trim(),
          branch_location: (
            document.getElementById("swal-branch-loc") as HTMLInputElement
          ).value.trim(),
          owner_name: (
            document.getElementById("swal-owner-name") as HTMLInputElement
          ).value.trim(),
          owner_phone: (
            document.getElementById("swal-owner-phone") as HTMLInputElement
          ).value.trim(),
          owner_email: (
            document.getElementById("swal-owner-email") as HTMLInputElement
          ).value.trim(),
          last_invoice_amount:
            parseFloat(
              (document.getElementById("swal-plan-amt") as HTMLInputElement)
                .value,
            ) || 4999,
        };
      },
    });

    if (isDismissed || !formValues) return;

    const { error } = await supabase
      .from("shops")
      .update(formValues)
      .eq("shop_id", shop.shop_id);

    if (!error) {
      Swal.fire({
        icon: "success",
        title: "Client Details Updated",
        timer: 1800,
        showConfirmButton: false,
      });
      await loadSuperAdminData();
    } else {
      Swal.fire("Error", error.message, "error");
    }
  };

  // ================= 4. GENERATE / RECORD B2B SAAS INVOICE =================
  const handleGenerateSaasInvoice = async (shop: any) => {
    const { value: formVal, isDismissed } = await Swal.fire({
      title: `Generate SaaS Invoice — ${shop.shop_name}`,
      html: `
        <div class="text-start">
          <label class="form-label small fw-bold mb-1">Client / Owner Name</label>
          <input id="inv-owner" class="form-control form-control-sm mb-2" value="${shop.owner_name || "Avinash Hirwale"}" />
          <label class="form-label small fw-bold mb-1">Subscription Amount (₹)</label>
          <input id="inv-amount" type="number" class="form-control form-control-sm mb-2" value="${shop.last_invoice_amount || 4999}" />
          <label class="form-label small fw-bold mb-1">Billing Period / Note</label>
          <input id="inv-period" class="form-control form-control-sm mb-2" value="Monthly ERP License (${new Date().toLocaleString("en-IN", { month: "short", year: "numeric" })})" />
          <label class="form-label small fw-bold mb-1">Payment Status</label>
          <select id="inv-status" class="form-select form-select-sm mb-2">
            <option value="Paid">Paid (Extend Subscription +30 Days)</option>
            <option value="Pending">Pending (Send Payment Reminder)</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Create & View Invoice",
      confirmButtonColor: "#0d6efd",
      preConfirm: () => {
        return {
          owner_name: (
            document.getElementById("inv-owner") as HTMLInputElement
          ).value.trim(),
          amount:
            parseFloat(
              (document.getElementById("inv-amount") as HTMLInputElement).value,
            ) || 4999,
          billing_period: (
            document.getElementById("inv-period") as HTMLInputElement
          ).value.trim(),
          payment_status: (
            document.getElementById("inv-status") as HTMLSelectElement
          ).value,
        };
      },
    });

    if (isDismissed || !formVal) return;

    const nowIso = new Date().toISOString();

    const { data: insertedInv, error } = await supabase
      .from("saas_invoices")
      .insert([
        {
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
          owner_name: formVal.owner_name,
          owner_phone: shop.owner_phone || "",
          amount: formVal.amount,
          billing_period: formVal.billing_period,
          payment_status: formVal.payment_status,
          paid_at: formVal.payment_status === "Paid" ? nowIso : null,
        },
      ])
      .select();

    if (formVal.payment_status === "Paid") {
      const baseDate =
        shop.subscription_end &&
        new Date(shop.subscription_end).getTime() > Date.now()
          ? new Date(shop.subscription_end)
          : new Date();
      baseDate.setDate(baseDate.getDate() + 30);

      await supabase
        .from("shops")
        .update({
          status: "Active",
          suspension_reason: null,
          last_paid_at: nowIso,
          last_invoice_amount: formVal.amount,
          subscription_end: baseDate.toISOString(),
        })
        .eq("shop_id", shop.shop_id);
    }

    if (!error && insertedInv) {
      await loadSuperAdminData();
      setActiveSaasInvoice(insertedInv[0]);
      setSelectedShop(null);
      setActiveTab("invoices");
      Swal.fire({
        icon: "success",
        title: "B2B Invoice Generated!",
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Error", error?.message || "Could not create invoice", "error");
    }
  };

  // ================= 5. ADD NEW CLIENT STORE =================
  const handleAddNewStoreModal = async () => {
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 30);
    const isoLocal = new Date(
      defaultEnd.getTime() - defaultEnd.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    const { value: newShop, isDismissed } = await Swal.fire({
      title: "Onboard New B2B Client Store",
      html: `
        <div class="text-start">
          <label class="form-label small fw-bold mb-1">Unique Shop ID</label>
          <input id="new-shop-id" class="form-control form-control-sm mb-2" placeholder="e.g. SHOP-D" />
          <label class="form-label small fw-bold mb-1">Store Name</label>
          <input id="new-shop-name" class="form-control form-control-sm mb-2" placeholder="e.g. WashNora - Vashi Branch" />
          <label class="form-label small fw-bold mb-1">Branch Location</label>
          <input id="new-shop-loc" class="form-control form-control-sm mb-2" placeholder="e.g. Vashi, Navi Mumbai" />
          <label class="form-label small fw-bold mb-1">Owner Name</label>
          <input id="new-owner-name" class="form-control form-control-sm mb-2" placeholder="Client Full Name" />
          <label class="form-label small fw-bold mb-1">Owner Phone</label>
          <input id="new-owner-phone" class="form-control form-control-sm mb-2" placeholder="+91 9876543210" />
          <label class="form-label small fw-bold mb-1">Owner Email</label>
          <input id="new-owner-email" class="form-control form-control-sm mb-2" placeholder="client@domain.com" />
          <label class="form-label small fw-bold mb-1">Subscription End Date & Time</label>
          <input id="new-sub-end" type="datetime-local" class="form-control form-control-sm" value="${isoLocal}" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Create Client Store",
      confirmButtonColor: "#0d6efd",
      preConfirm: () => {
        const shop_id = (
          document.getElementById("new-shop-id") as HTMLInputElement
        ).value
          .trim()
          .toUpperCase();
        const shop_name = (
          document.getElementById("new-shop-name") as HTMLInputElement
        ).value.trim();
        if (!shop_id || !shop_name) {
          Swal.showValidationMessage("Shop ID and Store Name are required.");
          return false;
        }
        return {
          shop_id,
          shop_name,
          branch_location: (
            document.getElementById("new-shop-loc") as HTMLInputElement
          ).value.trim(),
          owner_name: (
            document.getElementById("new-owner-name") as HTMLInputElement
          ).value.trim(),
          owner_phone: (
            document.getElementById("new-owner-phone") as HTMLInputElement
          ).value.trim(),
          owner_email: (
            document.getElementById("new-owner-email") as HTMLInputElement
          ).value.trim(),
          status: "Active",
          subscription_end: new Date(
            (document.getElementById("new-sub-end") as HTMLInputElement).value,
          ).toISOString(),
          last_paid_at: new Date().toISOString(),
          last_invoice_amount: 4999,
        };
      },
    });

    if (isDismissed || !newShop) return;

    const { error } = await supabase.from("shops").insert([newShop]);
    if (!error) {
      Swal.fire("Success", `${newShop.shop_name} onboarded!`, "success");
      await loadSuperAdminData();
    } else {
      Swal.fire("Error", error.message, "error");
    }
  };

  // Send WhatsApp Payment Reminder to Store Owner
  const handleSendWhatsAppToOwner = (shop: any) => {
    const rawPhone = (shop.owner_phone || "").replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      Swal.fire(
        "Missing Phone",
        "Please set a valid Owner Phone number first.",
        "warning",
      );
      return;
    }
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const subInfo = getSubscriptionTimeStatus(shop.subscription_end);

    const msg = `*ZEN-TECH SYSTEMS — B2B SUBSCRIPTION REMINDER* 🛡️
-----------------------------------------
*Client:* ${shop.owner_name || "Partner"}
*Store:* ${shop.shop_name} (${shop.shop_id})
*Current Status:* *${shop.status.toUpperCase()}*
*Subscription Expiry:* ${
      shop.subscription_end
        ? new Date(shop.subscription_end).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "N/A"
    } (${subInfo.text})
*Renewal Amount:* ₹${shop.last_invoice_amount || 4999}
-----------------------------------------
Please complete your subscription renewal on time to enjoy uninterrupted access to your Laundry ERP portal.`;

    window.open(
      `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
        msg,
      )}`,
      "_blank",
    );
  };

  const filteredShops = shopsList.filter((sh) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      sh.shop_name?.toLowerCase().includes(q) ||
      sh.shop_id?.toLowerCase().includes(q) ||
      sh.owner_name?.toLowerCase().includes(q) ||
      sh.branch_location?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || sh.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = shopsList.filter((s) => s.status === "Active").length;
  const suspendedCount = shopsList.filter(
    (s) => s.status === "Suspended",
  ).length;
  const expiringSoonCount = shopsList.filter((s) => {
    const st = getSubscriptionTimeStatus(s.subscription_end);
    return !st.expired && st.daysLeft <= 7;
  }).length;

  if (!isMounted) return null;

  // HARD SECURITY GATE: Never render the Super Admin UI while checking or if unauthorized
  if (isCheckingAuth || !isAuthorized) {
    return (
      <div
        className="d-flex flex-column w-100 vh-100 justify-content-center align-items-center"
        style={{ backgroundColor: "#0A1128", color: "#ffffff" }}
      >
        <div
          className="spinner-border text-info mb-3"
          style={{ width: "2.6rem", height: "2.6rem" }}
          role="status"
        />
        <h6 className="fw-bold mb-1">
          Verifying Zen-Tech Super Admin Clearance...
        </h6>
        <small className="text-white-50">
          Unauthorized access attempts are blocked automatically.
        </small>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "#F4F6FA", fontSize: "0.85rem" }}
    >
      {/* ================= TOP NAVBAR (ZEN-TECH SUPER ADMIN) ================= */}
      <header
        className="px-4 py-3 d-flex justify-content-between align-items-center shadow-sm sticky-top no-print"
        style={{ backgroundColor: "#0A1128", color: "#fff", zIndex: 1040 }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-primary d-flex justify-content-center align-items-center fw-bold shadow"
            style={{ width: "40px", height: "40px", fontSize: "1.1rem" }}
          >
            ZT
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0 text-white">
                Zen-Tech <span className="text-info">Super Admin</span>
              </h5>
              <span
                className="badge bg-info text-dark rounded-pill fw-bold"
                style={{ fontSize: "0.68rem" }}
              >
                B2B SaaS Control Center
              </span>
            </div>
            <small className="text-white-50">
              Software Owner: Zen-Tech Systems • Multi-Store Licensing,
              Subscriptions & Billing
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-md-block text-end">
            <div className="fw-semibold text-white small">
              {currentTime.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              •{" "}
              {currentTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <small className="text-info">
              Super Admin: {userProfile?.full_name || currentUser?.email}
            </small>
          </div>

          <a
            href="/dashboard"
            className="btn btn-outline-light btn-sm rounded-pill px-3 fw-semibold"
          >
            <i className="bi bi-box-arrow-up-right me-1"></i> Open Store ERP
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold"
          >
            <i className="bi bi-power me-1"></i> Logout
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="container-fluid p-3 p-md-4 flex-grow-1">
        {/* KPI SUMMARY CARDS */}
        <div className="row g-3 mb-4 no-print">
          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary h-100">
              <small className="text-secondary fw-bold text-uppercase">
                Total B2B Client Stores
              </small>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h3 className="fw-bold text-dark mb-0">{shopsList.length}</h3>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1">
                  Licensed
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success h-100">
              <small className="text-secondary fw-bold text-uppercase">
                Active Stores
              </small>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h3 className="fw-bold text-success mb-0">{activeCount}</h3>
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">
                  Live & Running
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger h-100">
              <small className="text-secondary fw-bold text-uppercase">
                Inactive / Suspended
              </small>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h3 className="fw-bold text-danger mb-0">{suspendedCount}</h3>
                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1">
                  Orders Blocked
                </span>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning h-100">
              <small className="text-secondary fw-bold text-uppercase">
                Expiring Within 7 Days
              </small>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h3 className="fw-bold text-warning mb-0">
                  {expiringSoonCount}
                </h3>
                <span className="badge bg-warning text-dark rounded-pill px-3 py-1">
                  8:00 AM Auto-Alert
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION PILLS */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 no-print">
          <div className="d-flex gap-2">
            <button
              onClick={() => setActiveTab("clients")}
              className={`btn btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm ${
                activeTab === "clients"
                  ? "btn-primary"
                  : "btn-white bg-white text-dark border"
              }`}
            >
              <i className="bi bi-buildings-fill me-2"></i>Client Stores &
              Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`btn btn-sm rounded-pill px-4 py-2 fw-bold shadow-sm ${
                activeTab === "invoices"
                  ? "btn-primary"
                  : "btn-white bg-white text-dark border"
              }`}
            >
              <i className="bi bi-receipt-cutoff me-2"></i>B2B Client Invoices (
              {saasInvoices.length})
            </button>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handleAddNewStoreModal}
              className="btn btn-dark btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm"
            >
              <i className="bi bi-plus-circle me-1"></i> + Add New Client Store
            </button>
            <button
              onClick={loadSuperAdminData}
              className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-bold bg-white"
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>

        {/* ================= TAB 1: CLIENTS & STORES DIRECTORY ================= */}
        {activeTab === "clients" && (
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="card-header bg-white p-3 border-bottom d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div>
                <h6 className="fw-bold text-dark mb-0">
                  All Stores Using Zen-Tech Laundry ERP Software
                </h6>
                <small className="text-secondary">
                  Click on any store row or "Info" to inspect owner details,
                  active services, last paid invoice, or suspend services.
                </small>
              </div>

              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0 rounded-pill px-3"
                  placeholder="Search store, ID, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ minWidth: "220px" }}
                />
                <select
                  className="form-select form-select-sm bg-light border-0 rounded-pill px-3 fw-semibold"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Suspended">Suspended / Inactive</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-secondary small text-uppercase">
                  <tr>
                    <th className="ps-3 py-3">Store ID & Name</th>
                    <th>Software Client (Owner)</th>
                    <th>Status</th>
                    <th>Subscription End Date & Time</th>
                    <th>Last Invoice Paid</th>
                    <th className="pe-3 text-end">Super Admin Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" />
                        Loading stores & subscriptions...
                      </td>
                    </tr>
                  ) : filteredShops.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No stores match your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredShops.map((shop) => {
                      const subStatus = getSubscriptionTimeStatus(
                        shop.subscription_end,
                      );
                      const shopOrders = getOrdersForShop(shop.shop_id);
                      const shopServices = getServicesForShop(shop.shop_id);

                      return (
                        <tr key={shop.shop_id} className="border-bottom">
                          <td
                            className="ps-3 cursor-pointer"
                            onClick={() => setSelectedShop(shop)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-dark text-white rounded-pill">
                                {shop.shop_id}
                              </span>
                              <div>
                                <div className="fw-bold text-primary text-decoration-underline">
                                  {shop.shop_name}
                                </div>
                                <small className="text-secondary">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {shop.branch_location || "Mumbai"} •{" "}
                                  {shopServices.length} Services •{" "}
                                  {shopOrders.length} Orders
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="fw-bold text-dark">
                              {shop.owner_name || "Avinash Hirwale"}
                            </div>
                            <small className="text-secondary d-block">
                              <i className="bi bi-telephone me-1"></i>
                              {shop.owner_phone || "+91 9876543210"}
                            </small>
                            <small className="text-muted">
                              {shop.owner_email}
                            </small>
                          </td>

                          <td>
                            {shop.status === "Suspended" ? (
                              <div>
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-1 fw-bold">
                                  <i className="bi bi-slash-circle me-1"></i>
                                  Inactive (Suspended)
                                </span>
                                {shop.suspension_reason && (
                                  <small
                                    className="d-block text-danger mt-1 text-truncate"
                                    style={{ maxWidth: "190px" }}
                                    title={shop.suspension_reason}
                                  >
                                    Msg: "{shop.suspension_reason}"
                                  </small>
                                )}
                              </div>
                            ) : (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1 fw-bold">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Active
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="fw-bold text-dark">
                              {shop.subscription_end
                                ? new Date(
                                    shop.subscription_end,
                                  ).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "Not Set"}
                            </div>
                            <span
                              className={`badge rounded-pill mt-1 ${
                                subStatus.expired
                                  ? "bg-danger text-white"
                                  : subStatus.urgent
                                    ? "bg-warning text-dark"
                                    : "bg-info bg-opacity-10 text-primary"
                              }`}
                            >
                              <i className="bi bi-clock-history me-1"></i>
                              {subStatus.text}
                            </span>
                          </td>

                          <td>
                            <div className="fw-bold text-success">
                              ₹{shop.last_invoice_amount || 4999}
                            </div>
                            <small className="text-secondary">
                              {shop.last_paid_at
                                ? new Date(
                                    shop.last_paid_at,
                                  ).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </small>
                          </td>

                          <td className="pe-3 text-end">
                            <div className="d-flex justify-content-end flex-wrap gap-1">
                              <button
                                onClick={() => setSelectedShop(shop)}
                                className="btn btn-sm btn-outline-dark rounded-pill px-2 py-1 fw-semibold"
                                title="Full Store Info, Owner & Services"
                              >
                                <i className="bi bi-info-circle me-1"></i>Info
                              </button>

                              <button
                                onClick={() =>
                                  handleUpdateSubscriptionDate(shop)
                                }
                                className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 fw-semibold"
                                title="Set Subscription End Date & Time"
                              >
                                <i className="bi bi-calendar-event me-1"></i>End
                                Date
                              </button>

                              <button
                                onClick={() => handleGenerateSaasInvoice(shop)}
                                className="btn btn-sm btn-outline-success rounded-pill px-2 py-1 fw-semibold"
                                title="Create / View B2B Invoice"
                              >
                                <i className="bi bi-receipt me-1"></i>Invoice
                              </button>

                              <button
                                onClick={() => handleToggleSuspendStore(shop)}
                                className={`btn btn-sm rounded-pill px-2 py-1 fw-bold ${
                                  shop.status === "Suspended"
                                    ? "btn-success text-white"
                                    : "btn-danger text-white"
                                }`}
                              >
                                <i
                                  className={`bi ${
                                    shop.status === "Suspended"
                                      ? "bi-play-circle-fill"
                                      : "bi-pause-circle-fill"
                                  } me-1`}
                                ></i>
                                {shop.status === "Suspended"
                                  ? "Activate"
                                  : "Suspend"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: B2B SAAS INVOICES ================= */}
        {activeTab === "invoices" && (
          <div className="row g-3">
            <div className="col-lg-4 no-print">
              <div className="card border-0 shadow-sm rounded-4 bg-white h-100">
                <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold text-dark mb-0">
                    B2B Client Invoices
                  </h6>
                  <span className="badge bg-primary rounded-pill">
                    {saasInvoices.length}
                  </span>
                </div>
                <div
                  className="card-body p-2"
                  style={{ maxHeight: "540px", overflowY: "auto" }}
                >
                  {saasInvoices.length === 0 ? (
                    <div className="text-center py-4 text-muted small">
                      No B2B invoices generated yet. Click "Invoice" on any
                      store to generate one.
                    </div>
                  ) : (
                    saasInvoices.map((inv) => (
                      <div
                        key={inv.invoice_id}
                        onClick={() => setActiveSaasInvoice(inv)}
                        className={`p-3 rounded-3 mb-2 cursor-pointer border transition-all ${
                          activeSaasInvoice?.invoice_id === inv.invoice_id
                            ? "border-primary bg-primary bg-opacity-10"
                            : "border-light bg-light"
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge bg-dark text-white rounded-pill">
                            #ZT-INV-{inv.invoice_id}
                          </span>
                          <span
                            className={`badge rounded-pill ${
                              inv.payment_status === "Paid"
                                ? "bg-success text-white"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {inv.payment_status}
                          </span>
                        </div>
                        <div className="fw-bold text-dark">{inv.shop_name}</div>
                        <small className="text-secondary d-block">
                          Owner: {inv.owner_name} • ₹{inv.amount}
                        </small>
                        <small className="text-muted">
                          {new Date(inv.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {activeSaasInvoice ? (
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                  <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                    <div>
                      <h4 className="fw-bold text-dark mb-0">
                        ZEN-TECH <span className="text-primary">SYSTEMS</span>
                      </h4>
                      <small className="text-secondary d-block">
                        Official B2B Software Subscription & ERP License Invoice
                      </small>
                      <small className="text-muted">
                        MSME Udyam: UDYAM-MH-27-0214642 • Support: +91
                        7738342274
                      </small>
                    </div>
                    <div className="text-end">
                      <h5 className="fw-bold text-primary mb-0">
                        #ZT-INV-{activeSaasInvoice.invoice_id}
                      </h5>
                      <small className="text-secondary d-block">
                        Issued:{" "}
                        {new Date(
                          activeSaasInvoice.created_at,
                        ).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </small>
                      <span
                        className={`badge rounded-pill mt-1 px-3 py-1 ${
                          activeSaasInvoice.payment_status === "Paid"
                            ? "bg-success text-white"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {activeSaasInvoice.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <small className="text-muted fw-bold text-uppercase d-block mb-1">
                          Licensed Client & Store
                        </small>
                        <div className="fw-bold text-dark">
                          {activeSaasInvoice.shop_name}
                        </div>
                        <div className="small text-secondary">
                          Store ID: {activeSaasInvoice.shop_id}
                        </div>
                        <div className="small text-secondary">
                          Owner: <strong>{activeSaasInvoice.owner_name}</strong>
                        </div>
                        <div className="small text-secondary">
                          Phone: {activeSaasInvoice.owner_phone || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <small className="text-muted fw-bold text-uppercase d-block mb-1">
                          Software & Billing Info
                        </small>
                        <div className="small text-secondary">
                          <strong>Product:</strong> WashNora Multi-Branch
                          Laundry ERP
                        </div>
                        <div className="small text-secondary">
                          <strong>Cycle:</strong>{" "}
                          {activeSaasInvoice.billing_period}
                        </div>
                        <div className="small text-secondary">
                          <strong>Last Paid Date:</strong>{" "}
                          {activeSaasInvoice.paid_at
                            ? new Date(
                                activeSaasInvoice.paid_at,
                              ).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Pending Payment"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <table className="table table-bordered align-middle mb-3">
                    <thead className="bg-light">
                      <tr>
                        <th>DESCRIPTION</th>
                        <th className="text-center">LICENSE</th>
                        <th className="text-end">TOTAL (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>{activeSaasInvoice.billing_period}</strong>
                          <div className="small text-secondary">
                            Full Cloud ERP, Order & Invoice Management, Realtime
                            Sync & Arya AI
                          </div>
                        </td>
                        <td className="text-center">1 Store Branch</td>
                        <td className="text-end fw-bold">
                          ₹{activeSaasInvoice.amount}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top no-print">
                    <small className="text-secondary">
                      Generated by{" "}
                      <strong>Zen-Tech Intelligence & ERP Billing</strong>
                    </small>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                      >
                        <i className="bi bi-printer-fill me-1"></i> Print / Save
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm rounded-4 bg-white p-5 text-center">
                  <h6 className="text-secondary mb-0">
                    Select an invoice on the left to preview
                  </h6>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= DETAILED STORE INFO MODAL (PER-STORE INSPECTOR) ================= */}
      {selectedShop && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center no-print"
          style={{ backgroundColor: "rgba(10, 17, 40, 0.72)", zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 position-relative"
            style={{
              width: "95%",
              maxWidth: "740px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setSelectedShop(null)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 border-bottom pb-3 mb-3">
              <div>
                <span className="badge bg-dark text-white rounded-pill me-2">
                  {selectedShop.shop_id}
                </span>
                <span
                  className={`badge rounded-pill ${
                    selectedShop.status === "Suspended"
                      ? "bg-danger text-white"
                      : "bg-success text-white"
                  }`}
                >
                  {selectedShop.status}
                </span>
                <h4 className="fw-bold text-dark mt-2 mb-0">
                  {selectedShop.shop_name}
                </h4>
                <small className="text-secondary">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {selectedShop.branch_location || "Mumbai"}
                </small>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => handleEditStoreOwner(selectedShop)}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold"
                >
                  <i className="bi bi-pencil-square me-1"></i> Edit Owner /
                  Store
                </button>
                <button
                  onClick={() => handleSendWhatsAppToOwner(selectedShop)}
                  className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                >
                  <i className="bi bi-whatsapp me-1"></i> WhatsApp Owner
                </button>
              </div>
            </div>

            {/* Owner & Subscription Grid */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="p-3 rounded-3 bg-light border h-100">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-2">
                    <i className="bi bi-person-badge-fill text-primary me-2"></i>
                    Store Owner & Contact Details
                  </h6>
                  <div className="small mb-1">
                    <strong>Owner Name:</strong>{" "}
                    {selectedShop.owner_name || "Avinash Hirwale"}
                  </div>
                  <div className="small mb-1">
                    <strong>Phone Number:</strong>{" "}
                    {selectedShop.owner_phone || "+91 9876543210"}
                  </div>
                  <div className="small mb-1">
                    <strong>Email Address:</strong>{" "}
                    {selectedShop.owner_email || "owner@washnora.in"}
                  </div>
                  <div className="small">
                    <strong>Software Plan:</strong>{" "}
                    <span className="text-primary fw-semibold">
                      {selectedShop.plan_name || "Zen-Tech Enterprise ERP"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 rounded-3 bg-light border h-100">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-2">
                    <i className="bi bi-credit-card-2-front-fill text-success me-2"></i>
                    Billing & Subscription Status
                  </h6>
                  <div className="small mb-1">
                    <strong>Last Invoice Paid:</strong>{" "}
                    <span className="text-success fw-bold">
                      ₹{selectedShop.last_invoice_amount || 4999}
                    </span>{" "}
                    on{" "}
                    {selectedShop.last_paid_at
                      ? new Date(selectedShop.last_paid_at).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )
                      : "N/A"}
                  </div>
                  <div className="small mb-1">
                    <strong>Subscription Ends:</strong>{" "}
                    <span className="fw-bold text-danger">
                      {selectedShop.subscription_end
                        ? new Date(
                            selectedShop.subscription_end,
                          ).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Not Set"}
                    </span>
                  </div>
                  {selectedShop.suspension_reason && (
                    <div className="alert alert-danger py-1 px-2 mt-2 mb-0 small">
                      <strong>Suspension Note:</strong>{" "}
                      {selectedShop.suspension_reason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Services Active in This Store */}
            <div className="mb-3">
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-tags-fill text-primary me-2"></i>
                Active Laundry Services Configured in This Store (
                {getServicesForShop(selectedShop.shop_id).length})
              </h6>
              <div
                className="d-flex flex-wrap gap-2 p-3 bg-light rounded-3 border"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                {getServicesForShop(selectedShop.shop_id).length === 0 ? (
                  <span className="text-muted small">
                    No services configured yet.
                  </span>
                ) : (
                  getServicesForShop(selectedShop.shop_id).map((srv: any) => (
                    <span
                      key={srv.service_id}
                      className="badge bg-white text-dark border px-3 py-2 shadow-sm"
                    >
                      {srv.name} —{" "}
                      <strong className="text-success">₹{srv.price}/pc</strong>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons Inside Modal */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 border-top">
              <div className="d-flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggleSuspendStore(selectedShop)}
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-bold ${
                    selectedShop.status === "Suspended"
                      ? "btn-success"
                      : "btn-danger"
                  }`}
                >
                  <i
                    className={`bi ${
                      selectedShop.status === "Suspended"
                        ? "bi-check2-circle"
                        : "bi-slash-circle"
                    } me-1`}
                  ></i>
                  {selectedShop.status === "Suspended"
                    ? "Reactivate Store Services"
                    : "Suspend Store Services (With Custom Message)"}
                </button>

                <button
                  onClick={() => handleUpdateSubscriptionDate(selectedShop)}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-bold"
                >
                  <i className="bi bi-calendar-check me-1"></i> Set Subscription
                  End Date & Time
                </button>

                <button
                  onClick={() => handleGenerateSaasInvoice(selectedShop)}
                  className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-bold"
                >
                  <i className="bi bi-receipt-cutoff me-1"></i> Generate / Renew
                  Invoice
                </button>
              </div>

              <button
                onClick={() => setSelectedShop(null)}
                className="btn btn-secondary btn-sm rounded-pill px-4 py-2 fw-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
