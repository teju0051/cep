"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

export default function MyDhobhiGhatApp() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  // UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Popups
  const [selectedCustomerProfile, setSelectedCustomerProfile] =
    useState<any>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modal States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSalaryVisible, setIsSalaryVisible] = useState<boolean>(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] =
    useState<boolean>(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] =
    useState<boolean>(false);

  // Form States
  const [onboardingData, setOnboardingData] = useState<any>({
    name: "",
    phone: "",
    address: "",
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

  // Customer Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cod");

  const clothCatalog = [
    { id: 1, name: "Shirt / T-Shirt", price: 25 },
    { id: 2, name: "Trouser / Jeans", price: 35 },
    { id: 3, name: "Bedsheet (Single/Double)", price: 60 },
    { id: 4, name: "Suit / Blazer", price: 150 },
    { id: 5, name: "Saree / Traditional", price: 80 },
  ];

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

  // Responsive Check
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

  // ================= BROWSER AUDIO UNLOCKER =================
  useEffect(() => {
    const unlockAudio = () => {
      const audioEl = document.getElementById(
        "notificationSound",
      ) as HTMLAudioElement;
      if (audioEl) {
        audioEl
          .play()
          .then(() => {
            audioEl.pause();
            audioEl.currentTime = 0;
          })
          .catch((err: any) =>
            console.log("Audio unlock waiting for interaction...", err),
          );
      }
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  // Live Clock Effect
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Session and Profile on Load
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

      if (profile) {
        setUserProfile(profile);
        if (
          profile.role === "user" &&
          (!profile.full_name || !profile.phone || !profile.address)
        ) {
          setOnboardingData({
            name: profile.full_name || "",
            phone: profile.phone || "",
            address: profile.address || "",
          });
          setIsOnboardingOpen(true);
        }
      } else {
        await supabase
          .from("profiles")
          .insert([
            { id: session.user.id, role: "user", is_first_login: true },
          ]);
        setIsOnboardingOpen(true);
      }

      const { data: orders } = await supabase
        .from("laundry_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orders) {
        setOrdersList(orders);
        updateDashboardStats(orders);
      }

      if (profile?.role === "admin") {
        const { data: payroll } = await supabase
          .from("staff_payroll")
          .select("*")
          .order("created_at", { ascending: false });
        if (payroll) setPayrollList(payroll);
      }

      if (profile?.role !== "user") {
        const { data: expenses } = await supabase
          .from("business_expenses")
          .select("*")
          .order("created_at", { ascending: false });
        if (expenses) {
          setReportsList(expenses);
          const totalExp = expenses.reduce(
            (sum: any, exp: any) => sum + parseFloat(exp.amount),
            0,
          );
          setDashboardStats((prev: any) => ({
            ...prev,
            totalExpenses: totalExp,
          }));
        }
      }
    };

    initApp();
  }, []);

  const updateDashboardStats = (orders: any[]) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const monthStr = now.toISOString().slice(0, 7);
    const yearStr = now.getFullYear().toString();

    let revToday = 0,
      revMonth = 0,
      revYear = 0,
      totalRev = 0;
    let ordToday = 0,
      ordMonth = 0,
      ordYear = 0;

    orders.forEach((o: any) => {
      // Don't count rejected orders towards revenue
      if (o.status !== "Rejected") {
        const amt = parseFloat(o.total_amount) || 0;
        totalRev += amt;

        if (o.created_at) {
          const d = new Date(o.created_at);
          const dDate = d.toISOString().split("T")[0];
          const dMonth = d.toISOString().slice(0, 7);
          const dYear = d.getFullYear().toString();

          if (dDate === todayStr) {
            revToday += amt;
            ordToday++;
          }
          if (dMonth === monthStr) {
            revMonth += amt;
            ordMonth++;
          }
          if (dYear === yearStr) {
            revYear += amt;
            ordYear++;
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

  // SOUND EFFECT FUNCTION
  const playNotificationSound = () => {
    const audioEl = document.getElementById(
      "notificationSound",
    ) as HTMLAudioElement;
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl
        .play()
        .catch((err: any) => console.log("Sound blocked by browser.", err));
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

  // ================= REAL-TIME DATABASE LISTENERS =================
  useEffect(() => {
    if (!userProfile) return;

    const channel = supabase
      .channel("realtime:public:laundry_orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "laundry_orders" },
        (payload: any) => {
          setOrdersList((prev: any[]) => [payload.new, ...prev]);

          if (userProfile.role === "admin" || userProfile.role === "manager") {
            playNotificationSound();
            const msg = `New order #${payload.new.order_id} placed by ${payload.new.customer_name}!`;
            addNotification(msg);

            Swal.fire({
              title: "🚨 NEW ORDER ALERT! 🚨",
              html: `
              <div class="text-start bg-light p-4 rounded-3 mt-3 shadow-sm border">
                <h5 class="fw-bold mb-3 border-bottom pb-2 text-primary">Order ID: #${payload.new.order_id}</h5>
                <div class="mb-2"><i class="bi bi-person-fill text-muted me-2"></i> <strong>Name:</strong> ${payload.new.customer_name}</div>
                <div class="mb-2"><i class="bi bi-telephone-fill text-muted me-2"></i> <strong>Phone:</strong> ${payload.new.customer_phone}</div>
                <div class="mb-3"><i class="bi bi-geo-alt-fill text-muted me-2"></i> <strong>Location:</strong> ${payload.new.location}</div>
                <div class="mb-2"><i class="bi bi-bag-check-fill text-muted me-2"></i> <strong>Order Summary:</strong></div>
                <div class="bg-white p-3 rounded border mb-3 small" style="max-height: 120px; overflow-y: auto;">
                  ${payload.new.service_type}
                </div>
                <div class="d-flex justify-content-between align-items-center bg-white p-3 rounded border-start border-4 border-success shadow-sm mt-3">
                  <span class="text-muted fw-bold">AMOUNT:</span>
                  <h4 class="fw-bold text-success mb-0">₹${payload.new.total_amount}</h4>
                </div>
              </div>
            `,
              width: "600px",
              confirmButtonText:
                '<i class="bi bi-check2-circle me-1"></i> Acknowledge',
              confirmButtonColor: "#0d6efd",
              allowOutsideClick: false,
              backdrop: `rgba(0,0,0,0.85)`,
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "laundry_orders" },
        (payload: any) => {
          setOrdersList((prev: any[]) =>
            prev.map((o) =>
              o.order_id === payload.new.order_id ? payload.new : o,
            ),
          );

          if (
            userProfile.role === "user" &&
            payload.new.customer_name === userProfile.full_name
          ) {
            if (payload.old.status !== payload.new.status) {
              playNotificationSound();

              // If rejected, include the reason in the notification
              let msg = `Your order id: #${payload.new.order_id} status has been updated to ${payload.new.status}!`;
              if (payload.new.status === "Rejected") {
                msg = `Your order id: #${payload.new.order_id} was Rejected. Reason: ${payload.new.rejection_reason}`;
              }

              addNotification(msg);

              Swal.fire({
                title:
                  payload.new.status === "Rejected"
                    ? "Order Rejected"
                    : "Order Update",
                text: msg,
                icon: payload.new.status === "Rejected" ? "error" : "success",
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 6000,
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  useEffect(() => {
    updateDashboardStats(ordersList);
  }, [ordersList]);

  // ================= UTILITY & DYNAMIC FUNCTIONS =================
  const handleExportPDF = () => window.print();

  const handleContactSupport = () => {
    if (userProfile?.role === "admin" || userProfile?.role === "manager") {
      Swal.fire({
        title: "Zen-Tech Support",
        html: `
          <div class="text-start mt-3 bg-light p-3 rounded-3 border">
            <p class="mb-2"><i class="bi bi-envelope-fill text-primary me-2"></i> <strong>Email:</strong> zentechindiaofficial@gmail.com</p>
            <p class="mb-0"><i class="bi bi-whatsapp text-success me-2"></i> <strong>WhatsApp:</strong> +91 7738342274</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
        confirmButtonColor: "#0d6efd",
      });
    } else {
      Swal.fire({
        title: "Store Support",
        html: `
          <div class="text-start mt-3 bg-light p-3 rounded-3 border">
            <p class="mb-2"><i class="bi bi-person-badge-fill text-primary me-2"></i> <strong>Owner:</strong> Avinash Hirwale</p>
            <p class="mb-2"><i class="bi bi-telephone-fill text-success me-2"></i> <strong>Contact:</strong> +91 98765 43210</p>
            <p class="mb-0"><i class="bi bi-geo-alt-fill text-danger me-2"></i> <strong>Address:</strong> My Dhobi Ghat, Main Street</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
        confirmButtonColor: "#0d6efd",
      });
    }
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
      if (result.isConfirmed && result.value === "123456") {
        setIsSalaryVisible(true);
      } else if (result.isConfirmed) {
        Swal.fire({
          icon: "error",
          title: "Incorrect Password",
          confirmButtonColor: "#0a1128",
        });
      }
    });
  };

  const handleUpdateSalary = async (
    staffId: any,
    currentSalary: any,
    staffName: any,
  ) => {
    const { value: newSalary } = await Swal.fire({
      title: `Update Salary for ${staffName}`,
      input: "number",
      inputValue: currentSalary,
      showCancelButton: true,
      confirmButtonText: "Save Salary",
      inputValidator: (value: any) => {
        if (!value) return "Please enter a valid amount!";
      },
    });

    if (newSalary) {
      const { error } = await supabase
        .from("staff_payroll")
        .update({ monthly_salary: parseFloat(newSalary) })
        .eq("staff_id", staffId);
      if (error) {
        Swal.fire("Database Error", error.message, "error");
      } else {
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

  const handleOnboardingSubmit = async (e: any) => {
    e.preventDefault();
    if (!currentUser) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: onboardingData.name,
        phone: onboardingData.phone,
        address: onboardingData.address,
        is_first_login: false,
      })
      .eq("id", currentUser.id);

    if (!error) {
      setUserProfile((prev: any) => ({
        ...prev,
        full_name: onboardingData.name,
        phone: onboardingData.phone,
        address: onboardingData.address,
        is_first_login: false,
      }));
      setIsOnboardingOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsProfilePopupOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const addToCart = (item: any) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing)
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)),
      );
    else setCart([...cart, { ...item, qty: 1 }]);
  };
  const removeFromCart = (id: any) => setCart(cart.filter((c) => c.id !== id));
  const calculateCartTotal = () =>
    cart.reduce((sum: any, item: any) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0)
      return Swal.fire(
        "Empty Cart",
        "Please add items before placing an order.",
        "warning",
      );
    const totalAmount = calculateCartTotal();
    const orderDetailsSummary = cart
      .map((c: any) => `${c.name} (x${c.qty})`)
      .join(", ");

    const { data, error } = await supabase
      .from("laundry_orders")
      .insert([
        {
          customer_name: userProfile?.full_name || "Customer",
          customer_phone: userProfile?.phone || "N/A",
          location: userProfile?.address || "Main Location",
          service_type: orderDetailsSummary,
          total_amount: totalAmount,
          status: "Pickup",
          rejection_reason: null,
        },
      ])
      .select();

    if (!error && data) {
      setCart([]);
      Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: `Order ID #${data[0].order_id}`,
        timer: 2500,
        showConfirmButton: false,
      });
      setActiveSection("dashboard");
    } else {
      Swal.fire("Error", "Failed to place order: " + error?.message, "error");
    }
  };

  // ================= ORDER STATUS UPDATE (WITH REJECTION LOGIC) =================
  const handleOrderStatusUpdate = async (orderId: any, newStatus: any) => {
    if (newStatus === "Rejected") {
      const { value: formValues, isDismissed } = await Swal.fire({
        title: "Reject Order",
        html: `
          <div class="text-start">
            <p class="text-muted small mb-3">Please select or provide a reason for rejecting this order to inform the customer.</p>
            <label class="form-label fw-bold small text-dark">Select a predefined reason:</label>
            <select id="swal-reject-reason" class="form-select bg-light mb-3">
              <option value="">-- No predefined reason (Write below) --</option>
              <option value="Shop operation hours are over">Shop operation hours are over</option>
              <option value="Store is full / Running on high demand">Store is full / Running on high demand</option>
              <option value="Service temporarily unavailable">Service temporarily unavailable</option>
              <option value="Out of delivery coverage area">Out of delivery coverage area</option>
            </select>
            <label class="form-label fw-bold small text-dark">Or write a manual reason <span class="text-danger">*</span></label>
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
            Swal.showValidationMessage(
              "You must select a predefined reason OR write a manual one.",
            );
            return false;
          }
          return selectReason ? selectReason : manualReason;
        },
      });

      if (isDismissed) {
        setOrdersList([...ordersList]);
        return;
      }

      const { error } = await supabase
        .from("laundry_orders")
        .update({ status: "Rejected", rejection_reason: formValues })
        .eq("order_id", orderId);

      if (error)
        Swal.fire(
          "Database Error",
          `Failed to reject: ${error.message}`,
          "error",
        );
    } else {
      const { error } = await supabase
        .from("laundry_orders")
        .update({ status: newStatus, rejection_reason: null })
        .eq("order_id", orderId);

      if (error)
        Swal.fire(
          "Database Error",
          `Failed to update status: ${error.message}`,
          "error",
        );
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
        title: "Staff Added!",
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
      setNewExpense({ category: "", description: "", amount: "" });
      setIsAddExpenseModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Expense Logged!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev: any[]) =>
      prev.map((n: any) => ({ ...n, read: true })),
    );
    setIsNotificationOpen(!isNotificationOpen);
  };
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Responsive Sidebar Width handling
  const sidebarWidth = isMobile
    ? "260px"
    : isSidebarCollapsed
      ? "80px"
      : "260px";

  // ================= BADGE STYLES =================
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
    : "Tejas";

  return (
    <div
      className="d-flex w-100 position-relative"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F9FB",
        overflowX: "hidden",
      }}
    >
      {/* HIDDEN AUDIO ELEMENT */}
      <audio
        id="notificationSound"
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        preload="auto"
      ></audio>

      {/* ================= MODALS ================= */}

      {/* ORDER DETAILS POPUP (For Admins to see what users ordered) */}
      {selectedOrderDetails && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 p-md-5 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "500px" }}
          >
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="btn-close position-absolute top-0 end-0 m-4"
            ></button>
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center mx-auto mb-3 shadow-sm border border-primary border-opacity-25"
                style={{ width: "60px", height: "60px", fontSize: "2rem" }}
              >
                <i className="bi bi-receipt"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">
                Order #{selectedOrderDetails.order_id}
              </h4>
              <span className="badge bg-light text-secondary border px-3 py-1 mt-1">
                {new Date(selectedOrderDetails.created_at).toLocaleString(
                  "en-IN",
                  { dateStyle: "medium", timeStyle: "short" },
                )}
              </span>
            </div>

            <div className="bg-light p-3 rounded-4 mb-3 border shadow-sm">
              <h6 className="fw-bold text-dark mb-2 border-bottom pb-2">
                <i className="bi bi-person me-2 text-primary"></i>Customer
                Information
              </h6>
              <div className="small text-secondary mb-1">
                <strong>Name:</strong> {selectedOrderDetails.customer_name}
              </div>
              <div className="small text-secondary mb-1">
                <strong>Phone:</strong> {selectedOrderDetails.customer_phone}
              </div>
              <div className="small text-secondary">
                <strong>Address:</strong> {selectedOrderDetails.location}
              </div>
            </div>

            <div className="bg-light p-3 rounded-4 mb-4 border shadow-sm">
              <h6 className="fw-bold text-dark mb-2 border-bottom pb-2">
                <i className="bi bi-bag-check me-2 text-primary"></i>Order Items
              </h6>
              <div
                className="small text-dark mb-3"
                style={{
                  lineHeight: "1.6",
                  maxHeight: "100px",
                  overflowY: "auto",
                }}
              >
                {selectedOrderDetails.service_type
                  .split(",")
                  .map((item: any, i: any) => (
                    <div key={i} className="d-flex align-items-start mb-1">
                      <i className="bi bi-dot text-primary me-1"></i>{" "}
                      {item.trim()}
                    </div>
                  ))}
              </div>
              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <strong className="text-dark">Total Amount</strong>
                <h5 className="fw-bold text-success mb-0">
                  ₹{selectedOrderDetails.total_amount}
                </h5>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMER PROFILE POPUP (For Admins) */}
      {selectedCustomerProfile && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 p-md-5 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "400px" }}
          >
            <button
              onClick={() => setSelectedCustomerProfile(null)}
              className="btn-close position-absolute top-0 end-0 m-4"
            ></button>
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex justify-content-center align-items-center mx-auto mb-3 shadow-sm border border-primary border-opacity-25"
                style={{ width: "80px", height: "80px", fontSize: "2.5rem" }}
              >
                <i className="bi bi-person-circle"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">
                {selectedCustomerProfile.name}
              </h4>
              <span className="badge bg-light text-secondary border px-3 py-1">
                Customer Details
              </span>
            </div>

            <div className="bg-light p-3 rounded-4 mb-4 border shadow-sm">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-telephone-fill text-primary fs-5 me-3"></i>
                <div>
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                  >
                    PHONE NUMBER
                  </small>
                  <span className="fw-medium text-dark">
                    {selectedCustomerProfile.phone}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt-fill text-danger fs-5 me-3"></i>
                <div>
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "0.7rem", fontWeight: "bold" }}
                  >
                    FULL ADDRESS
                  </small>
                  <span
                    className="fw-medium text-dark"
                    style={{ lineHeight: "1.3", display: "block" }}
                  >
                    {selectedCustomerProfile.address}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomerProfile(null)}
              className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isAddExpenseModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-5 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 text-dark">Log Expense</h5>
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
                  className="form-select bg-light border-0 py-2"
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
                  className="form-control bg-light border-0 py-2"
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
              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">
                  Amount Spent (₹)
                </label>
                <input
                  type="number"
                  className="form-control bg-light border-0 py-2"
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
                className="btn btn-primary w-100 fw-bold py-2 rounded-3"
              >
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddStaffModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-5 rounded-4 shadow-lg position-relative"
            style={{ width: "90%", maxWidth: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 text-dark">Add New Staff</h5>
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
                  className="form-control bg-light border-0 py-2"
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
                  className="form-control bg-light border-0 py-2"
                  required
                  value={newStaff.designation}
                  onChange={(e: any) =>
                    setNewStaff({ ...newStaff, designation: e.target.value })
                  }
                  placeholder="e.g. Delivery Executive"
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  className="form-control bg-light border-0 py-2"
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
                className="btn btn-primary w-100 fw-bold py-2 rounded-3"
              >
                Save Staff Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING MODAL */}
      {isOnboardingOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 p-md-5 rounded-4 shadow-lg position-relative"
            style={{
              width: "90%",
              maxWidth: "450px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 className="fw-bold text-dark mb-2">Complete Profile</h3>
            <p className="text-secondary small mb-4">
              Enter your details to continue.
            </p>
            <form onSubmit={handleOnboardingSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2"
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
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2"
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
              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">
                  Full Address
                </label>
                <textarea
                  className="form-control bg-light border-0 py-2"
                  required
                  rows={3}
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
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2 rounded-3"
                >
                  Save Details
                </button>
                {userProfile?.full_name && (
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(false)}
                    className="btn btn-outline-secondary px-3 rounded-3"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE POPUP */}
      {isProfilePopupOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 d-flex flex-column flex-md-row gap-4 align-items-center position-relative"
            style={{ width: "90%", maxWidth: "500px" }}
          >
            <button
              onClick={() => setIsProfilePopupOpen(false)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>
            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold fs-1 shadow-sm"
              style={{ width: "80px", height: "80px", flexShrink: 0 }}
            >
              {userProfile?.full_name
                ? userProfile.full_name[0].toUpperCase()
                : "U"}
            </div>
            <div className="flex-grow-1 text-center text-md-start">
              <h4 className="fw-bold text-dark mb-1">
                {userProfile?.full_name || "No Name Set"}
              </h4>
              <p
                className="text-muted small mb-3 text-uppercase fw-semibold"
                style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                Role: {userProfile?.role || "user"}
              </p>
              <div className="d-flex flex-column gap-2 mb-4 text-secondary small">
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
                    setOnboardingData({
                      name: userProfile?.full_name || "",
                      phone: userProfile?.phone || "",
                      address: userProfile?.address || "",
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

      {/* ================= DARK UI SIDEBAR ================= */}
      <aside
        className="d-flex flex-column transition-all shadow-lg"
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
          className={`d-flex align-items-center py-4 mb-2 ${isSidebarCollapsed && !isMobile ? "justify-content-center px-0" : "px-4"}`}
        >
          <div
            className="bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm"
            style={{ width: "35px", height: "35px", flexShrink: 0 }}
          >
            <i className="bi bi-droplet-half text-primary fs-5"></i>
          </div>
          {(!isSidebarCollapsed || isMobile) && (
            <div className="ms-3 text-white text-nowrap">
              <h5 className="fw-bold mb-0" style={{ letterSpacing: "0.5px" }}>
                MyDhobhi<span className="text-primary">Ghat</span>
              </h5>
              <small
                className="text-white-50"
                style={{
                  fontSize: "0.65rem",
                  display: "block",
                  marginTop: "-2px",
                }}
              >
                We Care Your Clothes
              </small>
            </div>
          )}
        </div>

        <div className="px-3 flex-grow-1">
          <nav className="nav flex-column gap-2 mt-2">
            <button
              title="Dashboard"
              onClick={() => {
                setActiveSection("dashboard");
                if (isMobile) setIsSidebarCollapsed(true);
              }}
              className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-3 border-0 transition-all ${activeSection === "dashboard" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
              style={{
                backgroundColor:
                  activeSection === "dashboard" ? "#0d6efd" : "transparent",
              }}
            >
              <div className="d-flex align-items-center">
                <i
                  className={`bi bi-grid-1x2-fill fs-6 ${isSidebarCollapsed && !isMobile ? "" : "me-3"}`}
                ></i>
                {(!isSidebarCollapsed || isMobile) && <span>Dashboard</span>}
              </div>
              {(!isSidebarCollapsed || isMobile) &&
                activeSection === "dashboard" && (
                  <i className="bi bi-chevron-right small"></i>
                )}
            </button>

            <button
              title={userProfile?.role === "user" ? "Book Order" : "Orders"}
              onClick={() => {
                setActiveSection("orders");
                if (isMobile) setIsSidebarCollapsed(true);
              }}
              className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-3 border-0 transition-all ${activeSection === "orders" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
              style={{
                backgroundColor:
                  activeSection === "orders" ? "#0d6efd" : "transparent",
              }}
            >
              <div className="d-flex align-items-center">
                <i
                  className={`bi bi-clipboard-check fs-6 ${isSidebarCollapsed && !isMobile ? "" : "me-3"}`}
                ></i>
                {(!isSidebarCollapsed || isMobile) && (
                  <span>
                    {userProfile?.role === "user" ? "Book Order" : "Orders"}
                  </span>
                )}
              </div>
              {(!isSidebarCollapsed || isMobile) &&
                activeSection === "orders" && (
                  <i className="bi bi-chevron-right small"></i>
                )}
            </button>

            {userProfile?.role === "admin" && (
              <button
                title="Payroll"
                onClick={() => {
                  setActiveSection("payroll");
                  if (isMobile) setIsSidebarCollapsed(true);
                }}
                className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-3 border-0 transition-all ${activeSection === "payroll" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                style={{
                  backgroundColor:
                    activeSection === "payroll" ? "#0d6efd" : "transparent",
                }}
              >
                <div className="d-flex align-items-center">
                  <i
                    className={`bi bi-people fs-6 ${isSidebarCollapsed && !isMobile ? "" : "me-3"}`}
                  ></i>
                  {(!isSidebarCollapsed || isMobile) && <span>Payroll</span>}
                </div>
                {(!isSidebarCollapsed || isMobile) &&
                  activeSection === "payroll" && (
                    <i className="bi bi-chevron-right small"></i>
                  )}
              </button>
            )}

            {userProfile?.role !== "user" && (
              <button
                title="Reports"
                onClick={() => {
                  setActiveSection("reports");
                  if (isMobile) setIsSidebarCollapsed(true);
                }}
                className={`nav-link text-start w-100 fw-medium rounded-3 d-flex align-items-center py-3 border-0 transition-all ${activeSection === "reports" ? "bg-primary text-white shadow" : "text-white-50 hover-bg-dark"} ${isSidebarCollapsed && !isMobile ? "justify-content-center" : "justify-content-between px-3"}`}
                style={{
                  backgroundColor:
                    activeSection === "reports" ? "#0d6efd" : "transparent",
                }}
              >
                <div className="d-flex align-items-center">
                  <i
                    className={`bi bi-bar-chart-fill fs-6 ${isSidebarCollapsed && !isMobile ? "" : "me-3"}`}
                  ></i>
                  {(!isSidebarCollapsed || isMobile) && <span>Reports</span>}
                </div>
                {(!isSidebarCollapsed || isMobile) &&
                  activeSection === "reports" && (
                    <i className="bi bi-chevron-right small"></i>
                  )}
              </button>
            )}
          </nav>

          {/* Support Card / Icon */}
          <div className="mt-5 pt-3 border-top border-secondary border-opacity-25 pb-4">
            {!isSidebarCollapsed || isMobile ? (
              <>
                <div className="card bg-transparent border border-secondary border-opacity-25 rounded-4 p-3 mb-4">
                  <div className="d-flex align-items-center text-white mb-2">
                    <i className="bi bi-headset me-2 fs-5"></i>{" "}
                    <h6 className="fw-semibold mb-0">Need Help?</h6>
                  </div>
                  <p
                    className="small text-white-50 mb-3"
                    style={{ fontSize: "0.75rem", lineHeight: "1.4" }}
                  >
                    Our support team is ready to help you anytime.
                  </p>
                  <button
                    onClick={handleContactSupport}
                    className="btn btn-outline-secondary btn-sm w-100 rounded-pill text-white fw-medium border-secondary border-opacity-50"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Contact Support
                  </button>
                </div>
                <div
                  className="text-white-50 small text-center"
                  style={{ fontSize: "0.65rem" }}
                >
                  &copy; 2026 MyDhobhiGhat
                  <br />
                  All rights reserved.
                </div>
              </>
            ) : (
              <div className="d-flex flex-column align-items-center gap-3">
                <button
                  onClick={handleContactSupport}
                  className="btn btn-outline-secondary rounded-circle d-flex justify-content-center align-items-center text-white border-secondary border-opacity-50"
                  style={{ width: "40px", height: "40px" }}
                  title="Contact Support"
                >
                  <i className="bi bi-headset"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
          onClick={() => setIsSidebarCollapsed(true)}
        ></div>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main
        className="w-100 transition-all d-flex flex-column"
        style={{
          marginLeft: isMobile ? "0px" : sidebarWidth,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <header
          className="bg-white d-flex justify-content-between align-items-center px-3 px-md-4 py-3 sticky-top border-bottom"
          style={{ zIndex: 1030 }}
        >
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="btn btn-primary rounded-circle d-flex justify-content-center align-items-center p-0 shadow-sm"
              style={{ width: "40px", height: "40px" }}
            >
              <i className="bi bi-list fs-5 text-white"></i>
            </button>
          </div>

          <div className="d-flex align-items-center gap-2 gap-md-4">
            {/* Date Pill */}
            {currentTime && (
              <div className="d-none d-md-flex align-items-center text-secondary border rounded-pill px-3 py-2 small fw-medium bg-white">
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

            {/* NOTIFICATION BELL */}
            <div className="position-relative">
              <button
                onClick={markAllNotificationsRead}
                className="btn btn-white rounded-circle position-relative p-2 border shadow-sm"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-bell text-dark"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning text-dark border border-white"
                    style={{ fontSize: "0.65rem", padding: "4px 6px" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div
                  className="dropdown-menu show position-absolute end-0 mt-3 shadow-lg border-0 rounded-4 py-0"
                  style={{ width: "300px", zIndex: 1050, overflow: "hidden" }}
                >
                  <div className="bg-primary text-white px-4 py-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Notifications</h6>
                  </div>
                  <div
                    className="list-group list-group-flush"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted small">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n: any) => (
                        <div
                          key={n.id}
                          className="list-group-item list-group-item-action px-4 py-3 bg-light border-bottom"
                        >
                          <div className="d-flex w-100 justify-content-between mb-1">
                            <h6 className="mb-0 fw-bold small text-dark">
                              <i
                                className="bi bi-circle-fill text-primary me-2"
                                style={{ fontSize: "8px" }}
                              ></i>
                              Update
                            </h6>
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.7rem" }}
                            >
                              {n.timestamp}
                            </small>
                          </div>
                          <p
                            className="mb-0 text-secondary small"
                            style={{ lineHeight: "1.4" }}
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

            {/* Profile Avatar */}
            <div
              className="d-flex align-items-center gap-2 cursor-pointer ms-1 ms-md-0"
              onClick={() => setIsProfilePopupOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold shadow-sm"
                style={{ width: "40px", height: "40px", fontSize: "1rem" }}
              >
                {userProfile?.full_name
                  ? userProfile.full_name[0].toUpperCase()
                  : "T"}
              </div>
              <span className="text-dark fw-bold d-none d-md-block ms-1">
                {firstName}{" "}
                <i
                  className="bi bi-chevron-down text-muted ms-1"
                  style={{ fontSize: "0.7rem" }}
                ></i>
              </span>
            </div>
          </div>
        </header>

        <div className="container-fluid p-3 p-md-4 flex-grow-1">
          {/* ================= DASHBOARD SECTION ================= */}
          {activeSection === "dashboard" && (
            <div className="fade-in">
              {/* WELCOME BANNER */}
              <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h2 className="fw-bold text-dark mb-1">
                    Welcome back, {firstName} 👋
                  </h2>
                  <p className="text-secondary mb-0">
                    Here's what's happening with your business today.
                  </p>
                </div>
                <div
                  className="d-none d-lg-flex align-items-center opacity-75"
                  style={{ height: "80px" }}
                >
                  <i className="bi bi-clouds-fill text-primary fs-1 me-2"></i>
                  <i className="bi bi-basket-fill text-warning fs-1 me-2"></i>
                </div>
              </div>

              {/* STATS CARDS */}
              {userProfile?.role !== "user" && (
                <>
                  {/* TIME-BASED STATS */}
                  <div className="row g-3 g-md-4 mb-4">
                    <div className="col-12 col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 p-md-4 border-start border-4 border-primary premium-hover transition-all">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          Today's Revenue
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          <h3 className="fw-bold text-dark mb-0">
                            ₹{dashboardStats.todayRev}
                          </h3>
                          <span className="badge bg-light text-secondary border rounded-pill small">
                            {dashboardStats.todayOrders} Orders
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 p-md-4 border-start border-4 border-success premium-hover transition-all">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          This Month
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          <h3 className="fw-bold text-dark mb-0">
                            ₹{dashboardStats.monthRev}
                          </h3>
                          <span className="badge bg-light text-secondary border rounded-pill small">
                            {dashboardStats.monthOrders} Orders
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 p-md-4 border-start border-4 border-warning premium-hover transition-all">
                        <p className="mb-1 fw-semibold text-secondary small text-uppercase">
                          This Year
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          <h3 className="fw-bold text-dark mb-0">
                            ₹{dashboardStats.yearRev}
                          </h3>
                          <span className="badge bg-light text-secondary border rounded-pill small">
                            {dashboardStats.yearOrders} Orders
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OVERALL LIFETIME STATS */}
                  <div className="row g-3 g-md-4 mb-4">
                    {[
                      {
                        title: "Total Lifetime Orders",
                        value: dashboardStats.totalOrders,
                        color: "primary",
                        hex: "#0d6efd",
                        icon: "cart3",
                      },
                      {
                        title: "Lifetime Revenue",
                        value: `₹${dashboardStats.revenue}`,
                        color: "success",
                        hex: "#198754",
                        icon: "currency-rupee",
                      },
                      {
                        title: "Pending Pickups",
                        value: dashboardStats.pendingPickups,
                        color: "warning",
                        hex: "#fd7e14",
                        icon: "bag-fill",
                      },
                      {
                        title: "Delivery",
                        value: dashboardStats.delivery,
                        color: "purple",
                        hex: "#6f42c1",
                        icon: "truck",
                      },
                    ].map((stat, idx) => (
                      <div className="col-6 col-xl-3" key={idx}>
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 p-md-4 position-relative overflow-hidden premium-hover transition-all">
                          <div className="d-flex align-items-center mb-3 gap-3">
                            <div
                              className="rounded-circle d-flex justify-content-center align-items-center text-white"
                              style={{
                                width: "48px",
                                height: "48px",
                                backgroundColor: stat.hex,
                              }}
                            >
                              <i className={`bi bi-${stat.icon} fs-5`}></i>
                            </div>
                            <div>
                              <p
                                className="mb-0 fw-semibold text-secondary small"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {stat.title}
                              </p>
                              <h4 className="fw-bold text-dark mb-0">
                                {stat.value}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* RECENT LIVE ORDERS TABLE */}
              <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white border-bottom-0 p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-primary rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className="bi bi-clipboard2-data fs-5"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">
                        {userProfile?.role === "user"
                          ? "Your Recent Orders"
                          : "Recent Live Orders"}
                      </h5>
                      <small className="text-secondary d-block mt-n1">
                        Track all your live orders in real-time
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-light border btn-sm fw-medium rounded-3 px-3 d-none d-md-block">
                      <i className="bi bi-funnel"></i> Filter
                    </button>
                    <button
                      onClick={() => setActiveSection("orders")}
                      className="btn btn-primary btn-sm fw-medium rounded-3 px-3"
                    >
                      View All Orders <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>

                <div className="card-body p-0">
                  {ordersList.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i
                          className="bi bi-inboxes text-primary opacity-50"
                          style={{ fontSize: "4rem" }}
                        ></i>
                      </div>
                      <h5 className="fw-bold text-dark">No Orders Found</h5>
                      <p className="text-secondary small">
                        There are no live orders at the moment.
                      </p>
                      {userProfile?.role === "user" && (
                        <button
                          onClick={() => setActiveSection("orders")}
                          className="btn btn-primary rounded-3 px-4 fw-medium mt-2"
                        >
                          <i className="bi bi-plus-lg me-1"></i> New Order
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0 text-nowrap">
                        <thead className="bg-light border-bottom border-top">
                          <tr
                            className="text-secondary"
                            style={{
                              fontSize: "0.75rem",
                              letterSpacing: "0.5px",
                            }}
                          >
                            <th className="fw-bold py-3 ps-4 border-0">
                              ORDER ID
                            </th>
                            <th className="fw-bold py-3 border-0">
                              CUSTOMER INFO
                            </th>
                            <th className="fw-bold py-3 border-0">LOCATION</th>
                            <th className="fw-bold py-3 border-0">AMOUNT</th>
                            <th className="fw-bold py-3 pe-4 border-0 text-start">
                              STATUS
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ordersList.slice(0, 5).map((order: any) => (
                            <tr
                              key={order.order_id}
                              className="border-bottom border-light"
                            >
                              <td className="ps-4 py-3 fw-bold text-dark">
                                {userProfile?.role !== "user" ? (
                                  <span
                                    className="text-primary text-decoration-underline cursor-pointer"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setSelectedOrderDetails(order)
                                    }
                                  >
                                    #{order.order_id}
                                  </span>
                                ) : (
                                  `#${order.order_id}`
                                )}
                              </td>
                              <td className="py-3">
                                {userProfile?.role !== "user" ? (
                                  <span
                                    className="fw-semibold text-dark d-block cursor-pointer text-decoration-underline"
                                    style={{ cursor: "pointer" }}
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
                                <span className="text-secondary small">
                                  <i className="bi bi-telephone-fill me-1 opacity-50"></i>
                                  {order.customer_phone}
                                </span>
                              </td>
                              <td className="py-3 text-secondary small">
                                <i className="bi bi-geo-alt-fill text-muted me-1"></i>
                                {order.location}
                              </td>
                              <td className="py-3 fw-bold text-dark">
                                ₹{order.total_amount || 0}
                              </td>
                              <td className="pe-4 py-3 text-start">
                                <span
                                  className={`badge rounded-pill px-3 py-2 fw-semibold ${getOrderStatusStyle(order.status)}`}
                                >
                                  {order.status}
                                </span>
                                {order.status === "Rejected" &&
                                  order.rejection_reason && (
                                    <div
                                      className="text-danger mt-1 fw-medium"
                                      style={{
                                        fontSize: "0.65rem",
                                        whiteSpace: "normal",
                                        maxWidth: "200px",
                                        lineHeight: "1.2",
                                      }}
                                    >
                                      <i className="bi bi-info-circle-fill me-1"></i>
                                      {order.rejection_reason}
                                    </div>
                                  )}
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

          {/* ================= ORDERS / BOOKING SECTION ================= */}
          {activeSection === "orders" && (
            <div className="fade-in">
              {userProfile?.role === "user" ? (
                /* CUSTOMER CLOTH CATALOG & CART CHECKOUT - PREMIUM UI */
                <div className="fade-in">
                  <div className="mb-4">
                    <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      Book a Laundry Service{" "}
                      <i className="bi bi-stars text-warning fs-5"></i>
                    </h4>
                    <p className="text-secondary small">
                      Select your garments and we'll take care of the rest.
                    </p>
                  </div>

                  <div className="row g-4">
                    {/* Left Side: Cloth Catalog */}
                    <div className="col-lg-7">
                      <div className="row g-3">
                        {clothCatalog.map((cloth) => (
                          <div className="col-sm-6" key={cloth.id}>
                            <div
                              className="card border border-light shadow-sm rounded-4 p-3 h-100 d-flex flex-row justify-content-between align-items-center bg-white premium-hover cursor-pointer"
                              style={{ transition: "all 0.3s ease" }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex justify-content-center align-items-center"
                                  style={{ width: "45px", height: "45px" }}
                                >
                                  <i
                                    className={`bi ${cloth.name.toLowerCase().includes("shirt") ? "bi-file-person" : cloth.name.toLowerCase().includes("bed") ? "bi-layout-text-window" : "bi-tag"} fs-5`}
                                  ></i>
                                </div>
                                <div>
                                  <h6
                                    className="fw-bold mb-1 text-dark"
                                    style={{ fontSize: "0.9rem" }}
                                  >
                                    {cloth.name}
                                  </h6>
                                  <p className="text-primary fw-bold mb-0 small">
                                    ₹{cloth.price}{" "}
                                    <span
                                      className="text-muted fw-normal"
                                      style={{ fontSize: "0.7rem" }}
                                    >
                                      / pc
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => addToCart(cloth)}
                                className="btn btn-light text-primary btn-sm rounded-circle shadow-sm d-flex justify-content-center align-items-center add-btn-hover"
                                style={{ width: "35px", height: "35px" }}
                                title="Add to Cart"
                              >
                                <i className="bi bi-plus-lg fw-bold"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Side: Cart Summary & Checkout */}
                    <div className="col-lg-5">
                      <div className="card border-0 shadow-lg rounded-4 p-4 bg-white position-relative overflow-hidden cart-card-premium">
                        <div
                          className="position-absolute top-0 end-0 bg-primary opacity-10 rounded-circle blur-effect"
                          style={{
                            width: "150px",
                            height: "150px",
                            marginRight: "-50px",
                            marginTop: "-50px",
                            filter: "blur(40px)",
                          }}
                        ></div>

                        <div className="d-flex justify-content-between align-items-center mb-4 position-relative z-1">
                          <h5 className="fw-bold text-dark mb-0">
                            Order Summary
                          </h5>
                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
                            {cart.length} Items
                          </span>
                        </div>

                        {cart.length === 0 ? (
                          <div className="text-center py-5 position-relative z-1">
                            <div
                              className="bg-light rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
                              style={{ width: "80px", height: "80px" }}
                            >
                              <i
                                className="bi bi-basket2 text-muted opacity-50"
                                style={{ fontSize: "2.5rem" }}
                              ></i>
                            </div>
                            <h6 className="fw-bold text-dark">
                              Your cart is empty
                            </h6>
                            <p className="text-muted small mb-0">
                              Select items from the catalog to get started.
                            </p>
                          </div>
                        ) : (
                          <div className="position-relative z-1">
                            <div
                              className="d-flex flex-column gap-3 mb-4 pe-2 custom-scrollbar"
                              style={{
                                maxHeight: "250px",
                                overflowY: "auto",
                                overflowX: "hidden",
                              }}
                            >
                              {cart.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="d-flex justify-content-between align-items-center p-3 border border-light rounded-3 bg-light bg-opacity-50 cart-item-anim shadow-sm"
                                >
                                  <div className="d-flex flex-column">
                                    <h6
                                      className="mb-1 fw-bold text-dark"
                                      style={{ fontSize: "0.85rem" }}
                                    >
                                      {item.name}
                                    </h6>
                                    <small className="text-secondary fw-medium">
                                      ₹{item.price}{" "}
                                      <span className="mx-1">x</span> {item.qty}
                                    </small>
                                  </div>
                                  <div className="d-flex align-items-center gap-3">
                                    <span className="fw-bold text-dark fs-6">
                                      ₹{item.price * item.qty}
                                    </span>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="btn btn-sm btn-white text-danger border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                                      style={{ width: "28px", height: "28px" }}
                                    >
                                      <i
                                        className="bi bi-trash3-fill"
                                        style={{ fontSize: "0.7rem" }}
                                      ></i>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-top border-dashed pt-3 mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="text-secondary fw-medium small">
                                  Subtotal
                                </span>
                                <span className="text-dark fw-bold">
                                  ₹{calculateCartTotal()}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-secondary fw-medium small">
                                  Delivery Fee
                                </span>
                                <span className="text-success fw-bold small">
                                  Free
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded-3">
                                <span className="text-primary fw-bold">
                                  Total Amount
                                </span>
                                <h4 className="fw-bold text-primary mb-0">
                                  ₹{calculateCartTotal()}
                                </h4>
                              </div>
                            </div>

                            <h6
                              className="fw-bold text-dark mb-3"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Payment Method
                            </h6>
                            <div className="d-flex flex-column gap-2 mb-4">
                              <div
                                className={`payment-card d-flex align-items-center p-3 rounded-3 cursor-pointer ${paymentMethod === "Cod" ? "active shadow-sm" : "border border-light bg-light opacity-75"}`}
                                onClick={() => setPaymentMethod("Cod")}
                              >
                                <div
                                  className={`rounded-circle d-flex justify-content-center align-items-center me-3 ${paymentMethod === "Cod" ? "bg-primary text-white" : "bg-white border text-muted"}`}
                                  style={{ width: "20px", height: "20px" }}
                                >
                                  {paymentMethod === "Cod" && (
                                    <i
                                      className="bi bi-check"
                                      style={{ fontSize: "12px" }}
                                    ></i>
                                  )}
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <i className="bi bi-cash-coin fs-5 text-success"></i>
                                  <span
                                    className={`fw-bold ${paymentMethod === "Cod" ? "text-dark" : "text-secondary"}`}
                                  >
                                    Pay on Delivery
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={handleCheckout}
                              className="btn btn-gradient w-100 fw-bold py-3 rounded-pill text-white shadow-lg d-flex justify-content-center align-items-center gap-2"
                            >
                              <span>Place Order Now</span>{" "}
                              <i className="bi bi-arrow-right-circle-fill fs-5"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ADMIN / MANAGER ORDER MANAGEMENT VIEW */
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-dark mb-0">Order Management</h4>
                  </div>
                  <div className="card border-0 shadow-sm rounded-4 bg-white">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                          <thead className="bg-light border-bottom">
                            <tr
                              className="text-secondary"
                              style={{
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              <th className="fw-bold py-3 ps-4 border-0">
                                ORDER ID
                              </th>
                              <th className="fw-bold py-3 border-0">
                                DATE & TIME
                              </th>
                              <th className="fw-bold py-3 border-0">
                                CUSTOMER INFO
                              </th>
                              <th className="fw-bold py-3 border-0">AMOUNT</th>
                              <th className="fw-bold py-3 border-0">STATUS</th>
                              <th className="fw-bold py-3 pe-4 border-0 text-end">
                                UPDATE STATUS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersList.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="text-center py-5 text-muted"
                                >
                                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>{" "}
                                  No orders found.
                                </td>
                              </tr>
                            ) : (
                              ordersList.map((order: any) => (
                                <tr
                                  key={order.order_id}
                                  className="border-bottom border-light"
                                >
                                  <td className="ps-4 py-3 fw-bold text-dark">
                                    <span
                                      className="text-primary text-decoration-underline cursor-pointer"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        setSelectedOrderDetails(order)
                                      }
                                    >
                                      #{order.order_id}
                                    </span>
                                  </td>
                                  <td className="py-3 text-secondary small">
                                    {order.created_at
                                      ? new Date(
                                          order.created_at,
                                        ).toLocaleString("en-IN", {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        })
                                      : "N/A"}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className="fw-semibold text-dark d-block cursor-pointer text-decoration-underline"
                                      style={{ cursor: "pointer" }}
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
                                      <i className="bi bi-telephone-fill me-1 opacity-50"></i>
                                      {order.customer_phone}
                                    </span>
                                  </td>
                                  <td className="py-3 fw-bold text-dark">
                                    ₹{order.total_amount || 0}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`badge rounded-pill px-3 py-2 fw-semibold ${getOrderStatusStyle(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                    {order.status === "Rejected" &&
                                      order.rejection_reason && (
                                        <div
                                          className="text-danger mt-1 fw-medium"
                                          style={{
                                            fontSize: "0.65rem",
                                            whiteSpace: "normal",
                                            maxWidth: "200px",
                                            lineHeight: "1.2",
                                          }}
                                        >
                                          <i className="bi bi-info-circle-fill me-1"></i>
                                          {order.rejection_reason}
                                        </div>
                                      )}
                                  </td>
                                  <td className="pe-4 py-3 text-end">
                                    <select
                                      className="form-select form-select-sm d-inline-block w-auto border rounded-3 bg-white text-secondary shadow-none cursor-pointer"
                                      value={order.status}
                                      onChange={(e: any) =>
                                        handleOrderStatusUpdate(
                                          order.order_id,
                                          e.target.value,
                                        )
                                      }
                                    >
                                      <option value="Pickup">Pickup</option>
                                      <option value="Received">Received</option>
                                      <option value="In Progress">
                                        In Progress
                                      </option>
                                      <option value="Finished">Finished</option>
                                      <option value="Out for Delivery">
                                        Out for Delivery
                                      </option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
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
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h4 className="fw-bold text-dark mb-0">Payroll Management</h4>
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="btn btn-primary btn-sm px-4 py-2 fw-medium rounded-3 shadow-sm d-flex align-items-center gap-2"
                >
                  <i className="bi bi-person-plus-fill"></i> Add Staff
                </button>
              </div>
              <div className="card border-0 shadow-sm rounded-4 bg-white">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light border-bottom">
                        <tr
                          className="text-secondary"
                          style={{
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <th className="fw-bold py-3 ps-4 border-0">
                            STAFF NAME
                          </th>
                          <th className="fw-bold py-3 border-0">DESIGNATION</th>
                          <th className="fw-bold py-3 border-0">
                            SALARY{" "}
                            <button
                              onClick={handleUnlockSalary}
                              className="btn btn-link text-muted p-0 ms-2 text-decoration-none border-0"
                            >
                              <i
                                className={`bi ${isSalaryVisible ? "bi-unlock-fill text-primary" : "bi-lock-fill"}`}
                              ></i>
                            </button>
                          </th>
                          <th className="fw-bold py-3 border-0">
                            PAYMENT STATUS
                          </th>
                          <th className="fw-bold py-3 pe-4 border-0 text-end">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-5 text-muted"
                            >
                              <i className="bi bi-people fs-3 d-block mb-2"></i>{" "}
                              No staff records found.
                            </td>
                          </tr>
                        ) : (
                          payrollList.map((staff: any) => (
                            <tr
                              key={staff.staff_id}
                              className="border-bottom border-light"
                            >
                              <td className="ps-4 py-3 fw-bold text-dark">
                                {staff.staff_name}
                              </td>
                              <td className="py-3 text-secondary">
                                {staff.designation}
                              </td>
                              <td className="py-3 fw-bold text-dark">
                                {isSalaryVisible
                                  ? `₹${staff.monthly_salary}`
                                  : "₹ * * * *"}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`badge rounded-pill px-3 py-2 fw-semibold ${getPayrollStatusStyle(staff.status)}`}
                                >
                                  {staff.status}
                                </span>
                              </td>
                              <td className="pe-4 py-3 text-end d-flex align-items-center justify-content-end gap-2">
                                <select
                                  className="form-select form-select-sm d-inline-block w-auto border rounded-3 bg-white text-secondary shadow-none cursor-pointer"
                                  defaultValue={staff.status}
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
                                    className="btn btn-sm btn-light border rounded-3 py-1 px-2"
                                    title="Edit Salary"
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

          {/* ================= REPORTS SECTION ================= */}
          {activeSection === "reports" && userProfile?.role !== "user" && (
            <div className="fade-in">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h4 className="fw-bold text-dark mb-0">Financial Reports</h4>
                <button
                  onClick={handleExportPDF}
                  className="btn btn-outline-primary btn-sm px-4 py-2 fw-medium rounded-3 bg-white shadow-sm d-flex align-items-center gap-2"
                >
                  <i className="bi bi-download"></i> Export PDF
                </button>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-row align-items-center justify-content-between premium-hover transition-all">
                    <div>
                      <h6
                        className="text-secondary fw-semibold mb-1 text-uppercase"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Total Revenue
                      </h6>
                      <h3 className="fw-bold text-success mb-0">
                        ₹{dashboardStats.revenue}
                      </h3>
                    </div>
                    <div
                      className="bg-success bg-opacity-10 text-success rounded-circle d-flex justify-content-center align-items-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-graph-up-arrow fs-3"></i>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-row align-items-center justify-content-between premium-hover transition-all">
                    <div>
                      <h6
                        className="text-secondary fw-semibold mb-1 text-uppercase"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Total Expenses
                      </h6>
                      <h3 className="fw-bold text-danger mb-0">
                        ₹{dashboardStats.totalExpenses}
                      </h3>
                    </div>
                    <div
                      className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex justify-content-center align-items-center"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <i className="bi bi-graph-down-arrow fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <h5 className="fw-bold text-dark mb-0">Expense Ledger</h5>
                  <button
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="btn btn-primary btn-sm px-3 fw-medium rounded-3"
                  >
                    <i className="bi bi-plus-lg me-1"></i> Add Expense
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light border-bottom">
                        <tr
                          className="text-secondary"
                          style={{
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <th className="fw-bold py-3 ps-4 border-0">DATE</th>
                          <th className="fw-bold py-3 border-0">CATEGORY</th>
                          <th className="fw-bold py-3 border-0">DESCRIPTION</th>
                          <th className="fw-bold py-3 pe-4 border-0 text-end">
                            AMOUNT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-5 text-muted"
                            >
                              <i className="bi bi-receipt fs-3 d-block mb-2"></i>{" "}
                              No expenses logged yet.
                            </td>
                          </tr>
                        ) : (
                          reportsList.map((expense: any) => (
                            <tr
                              key={expense.expense_id}
                              className="border-bottom border-light"
                            >
                              <td className="ps-4 py-3 fw-semibold text-dark small">
                                {new Date(
                                  expense.created_at ||
                                    expense.expense_date ||
                                    Date.now(),
                                ).toLocaleDateString("en-IN", {
                                  dateStyle: "medium",
                                })}
                              </td>
                              <td className="py-3 text-secondary">
                                {expense.category}
                              </td>
                              <td className="py-3 text-secondary">
                                {expense.description}
                              </td>
                              <td className="pe-4 py-3 text-end fw-bold text-danger">
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

      {/* Global CSS Inject for Premium Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .fade-in { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .hover-bg-dark:hover { background-color: rgba(255,255,255,0.05) !important; color: white !important; }
        body { background-color: #F8F9FB; }
        
        /* Premium UI Enhancements */
        .premium-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(13, 110, 253, 0.12) !important;
          border-color: rgba(13, 110, 253, 0.3) !important;
        }
        .add-btn-hover { transition: all 0.2s ease; }
        .premium-hover:hover .add-btn-hover {
          background-color: #0d6efd !important;
          color: white !important;
          transform: scale(1.1);
        }

        .cart-card-premium {
          border-top: 4px solid #0d6efd !important;
        }
        
        .cart-item-anim {
          animation: slideInRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .border-dashed { border-top-style: dashed !important; border-top-width: 2px !important; border-color: #dee2e6 !important; }

        .payment-card { transition: all 0.2s ease; border: 2px solid transparent; }
        .payment-card.active { border-color: #0d6efd; background-color: rgba(13, 110, 253, 0.05) !important; }
        .payment-card:hover:not(.active) { background-color: #f8f9fa !important; border-color: #dee2e6; }

        .btn-gradient {
          background: linear-gradient(135deg, #0d6efd, #6f42c1);
          border: none;
          background-size: 200% auto;
          transition: all 0.4s ease;
        }
        .btn-gradient:hover {
          background-position: right center;
          box-shadow: 0 10px 25px rgba(111, 66, 193, 0.4) !important;
          transform: translateY(-2px);
        }

        /* Custom Scrollbar for Cart */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #adb5bd; }
      `,
        }}
      />
    </div>
  );
}
