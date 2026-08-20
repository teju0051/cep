"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

export default function MyDhobhiGhatApp() {
  const [activeSection, setActiveSection] = useState("dashboard");

  // UI States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // Modal States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  // Form States
  const [onboardingData, setOnboardingData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [newStaff, setNewStaff] = useState({
    name: "",
    designation: "",
    salary: "",
  });
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
  });

  // Customer Cart State
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cod");

  const clothCatalog = [
    { id: 1, name: "Shirt / T-Shirt", price: 25 },
    { id: 2, name: "Trouser / Jeans", price: 35 },
    { id: 3, name: "Bedsheet (Single/Double)", price: 60 },
    { id: 4, name: "Suit / Blazer", price: 150 },
    { id: 5, name: "Saree / Traditional", price: 80 },
  ];

  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingPickups: 0,
    delivery: 0,
    totalExpenses: 0,
  });
  const [ordersList, setOrdersList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  // ================= BROWSER AUDIO UNLOCKER =================
  useEffect(() => {
    const unlockAudio = () => {
      const audioEl = document.getElementById("notificationSound");
      if (audioEl) {
        audioEl
          .play()
          .then(() => {
            audioEl.pause();
            audioEl.currentTime = 0;
          })
          .catch((err) =>
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
            (sum, exp) => sum + parseFloat(exp.amount),
            0,
          );
          setDashboardStats((prev) => ({ ...prev, totalExpenses: totalExp }));
        }
      }
    };

    initApp();
  }, []);

  const updateDashboardStats = (orders) => {
    const totalRev = orders.reduce(
      (sum, o) => sum + (parseFloat(o.total_amount) || 0),
      0,
    );
    setDashboardStats((prev) => ({
      ...prev,
      totalOrders: orders.length,
      revenue: totalRev,
      pendingPickups: orders.filter(
        (o) => o.status === "Pickup" || o.status === "Received",
      ).length,
      delivery: orders.filter((o) => o.status === "Out for Delivery").length,
    }));
  };

  // SOUND EFFECT FUNCTION
  const playNotificationSound = () => {
    const audioEl = document.getElementById("notificationSound");
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl
        .play()
        .catch((err) =>
          console.log(
            "Sound blocked by browser. Click anywhere on the dashboard first!",
            err,
          ),
        );
    }
  };

  const addNotification = (message) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
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
        (payload) => {
          setOrdersList((prev) => [payload.new, ...prev]);

          // ADMIN / MANAGER ALERTS
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
                
                <div class="d-flex justify-content-between align-items-center bg-white p-3 rounded border-start border-4 border-success shadow-sm">
                  <span class="text-muted fw-bold">AMOUNT:</span>
                  <h4 class="fw-bold text-success mb-0">₹${payload.new.total_amount}</h4>
                </div>
              </div>
            `,
              width: "600px",
              confirmButtonText:
                '<i class="bi bi-check2-circle me-1"></i> Acknowledge Order',
              confirmButtonColor: "#3b82f6",
              allowOutsideClick: false,
              backdrop: `rgba(0,0,0,0.85)`,
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "laundry_orders" },
        (payload) => {
          setOrdersList((prev) =>
            prev.map((o) =>
              o.order_id === payload.new.order_id ? payload.new : o,
            ),
          );

          // CUSTOMER ALERTS
          if (
            userProfile.role === "user" &&
            payload.new.customer_name === userProfile.full_name
          ) {
            if (payload.old.status !== payload.new.status) {
              playNotificationSound();
              const msg = `Your order id: #${payload.new.order_id} status has been updated to ${payload.new.status}!`;
              addNotification(msg);

              Swal.fire({
                title: "Order Update",
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
  }, [userProfile]);

  useEffect(() => {
    updateDashboardStats(ordersList);
  }, [ordersList]);

  // ================= UTILITY FUNCTIONS =================
  const handleExportPDF = () => {
    window.print();
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
      confirmButtonColor: "#4caf50",
    }).then((result) => {
      if (result.isConfirmed && result.value === "123456") {
        setIsSalaryVisible(true);
        Swal.fire({
          icon: "success",
          title: "Unlocked!",
          showConfirmButton: false,
          timer: 1000,
        });
      } else if (result.isConfirmed) {
        Swal.fire({
          icon: "error",
          title: "Incorrect Password",
          confirmButtonColor: "#2b2e3e",
        });
      }
    });
  };

  const handleUpdateSalary = async (staffId, currentSalary, staffName) => {
    const { value: newSalary } = await Swal.fire({
      title: `Update Salary for ${staffName}`,
      input: "number",
      inputValue: currentSalary,
      showCancelButton: true,
      confirmButtonText: "Save Salary",
      inputValidator: (value) => {
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
        setPayrollList(
          payrollList.map((s) =>
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

  const handleOnboardingSubmit = async (e) => {
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
      setUserProfile((prev) => ({
        ...prev,
        full_name: onboardingData.name,
        phone: onboardingData.phone,
        address: onboardingData.address,
        is_first_login: false,
      }));
      setIsOnboardingOpen(false);
      Swal.fire({
        icon: "success",
        title: "Profile Saved Successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleLogout = async () => {
    setIsProfilePopupOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const addToCart = (item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing)
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)),
      );
    else setCart([...cart, { ...item, qty: 1 }]);
  };
  const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id));
  const calculateCartTotal = () =>
    cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0)
      return Swal.fire(
        "Empty Cart",
        "Please add items before placing an order.",
        "warning",
      );
    const totalAmount = calculateCartTotal();
    const orderDetailsSummary = cart
      .map((c) => `${c.name} (x${c.qty})`)
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
        },
      ])
      .select();

    if (!error && data) {
      setCart([]);
      Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: `Your unique Order ID is #${data[0].order_id}`,
        timer: 2500,
        showConfirmButton: true,
      });
      setActiveSection("dashboard");
    } else {
      Swal.fire("Error", "Failed to place order: " + error?.message, "error");
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("laundry_orders")
      .update({ status: newStatus })
      .eq("order_id", orderId);
    if (error)
      Swal.fire(
        "Database Error",
        `Failed to update status: ${error.message}`,
        "error",
      );
  };

  const handleAddStaffSubmit = async (e) => {
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
    if (error)
      return Swal.fire(
        "Error",
        "Could not add staff: " + error.message,
        "error",
      );
    if (data) setPayrollList([data[0], ...payrollList]);
    setNewStaff({ name: "", designation: "", salary: "" });
    setIsAddStaffModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Staff Added!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleAddExpenseSubmit = async (e) => {
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
    if (error)
      return Swal.fire(
        "Error",
        "Could not log expense: " + error.message,
        "error",
      );
    if (data) setReportsList([data[0], ...reportsList]);
    setNewExpense({ category: "", description: "", amount: "" });
    setIsAddExpenseModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Expense Logged!",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setIsNotificationOpen(!isNotificationOpen);
  };
  const unreadCount = notifications.filter((n) => !n.read).length;

  const sidebarWidth = isSidebarCollapsed ? "80px" : "250px";
  const getOrderStatusStyle = (status) => {
    switch (status) {
      case "Pickup":
        return "bg-secondary bg-opacity-10 text-secondary border-secondary";
      case "Received":
        return "bg-info bg-opacity-10 text-info border-info";
      case "In Progress":
        return "bg-warning bg-opacity-10 text-warning border-warning";
      case "Finished":
        return "bg-success bg-opacity-10 text-success border-success";
      case "Out for Delivery":
        return "bg-primary bg-opacity-10 text-primary border-primary";
      default:
        return "bg-secondary bg-opacity-10 text-secondary border-secondary";
    }
  };

  const getPayrollStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-success bg-opacity-10 text-success border-success";
      case "Overdue":
        return "bg-danger bg-opacity-10 text-danger border-danger";
      case "Pending":
        return "bg-warning bg-opacity-10 text-warning border-warning";
      default:
        return "bg-secondary bg-opacity-10 text-secondary border-secondary";
    }
  };

  return (
    <div
      className="d-flex w-100 position-relative"
      style={{ minHeight: "100vh", backgroundColor: "#f4f5f7" }}
    >
      {/* HIDDEN AUDIO ELEMENT FOR NOTIFICATIONS */}
      <audio
        id="notificationSound"
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        preload="auto"
      ></audio>

      {/* ================= MODALS & POPUPS ================= */}

      {/* ADD EXPENSE MODAL */}
      {isAddExpenseModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-5 rounded-4 shadow-lg position-relative"
            style={{ width: "450px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0 text-dark">Log Business Expense</h5>
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
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="500"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2"
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
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-5 rounded-4 shadow-lg position-relative"
            style={{ width: "450px" }}
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
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, salary: e.target.value })
                  }
                  placeholder="15000"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2"
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
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}
        >
          <div
            className="bg-white p-5 rounded-4 shadow-lg position-relative"
            style={{ width: "450px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h3 className="fw-bold text-dark mb-2">Complete Your Profile</h3>
            <p className="text-secondary small mb-4">
              Please enter your name, phone number, and address.
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
                  onChange={(e) =>
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
                  onChange={(e) =>
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
                  rows="3"
                  value={onboardingData.address}
                  onChange={(e) =>
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
                  className="btn btn-primary w-100 fw-bold py-2"
                >
                  Save Profile Details
                </button>
                {userProfile?.full_name && (
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(false)}
                    className="btn btn-outline-secondary px-3"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LANDSCAPE PROFILE POPUP */}
      {isProfilePopupOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 d-flex flex-row gap-4 align-items-center position-relative"
            style={{ width: "580px", maxWidth: "95%" }}
          >
            <button
              onClick={() => setIsProfilePopupOpen(false)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>
            <div
              className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold fs-2 shadow-sm"
              style={{ width: "90px", height: "90px", flexShrink: 0 }}
            >
              {userProfile?.full_name
                ? userProfile.full_name[0].toUpperCase()
                : "U"}
            </div>
            <div className="flex-grow-1 pe-3">
              <h4 className="fw-bold text-dark mb-1">
                {userProfile?.full_name || "No Name Set"}
              </h4>
              <p
                className="text-muted small mb-2 text-uppercase fw-semibold"
                style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                Role: {userProfile?.role || "user"}
              </p>
              <div className="d-flex flex-column gap-1 mb-3 text-secondary small">
                <div>
                  <i className="bi bi-envelope me-2 text-primary"></i>
                  {currentUser?.email}
                </div>
                <div>
                  <i className="bi bi-telephone me-2 text-primary"></i>
                  {userProfile?.phone || "No phone number provided"}
                </div>
                <div>
                  <i className="bi bi-geo-alt me-2 text-primary"></i>
                  {userProfile?.address || "No address provided"}
                </div>
              </div>
              <div className="d-flex gap-2">
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
                  className="btn btn-outline-primary btn-sm px-3 fw-medium"
                >
                  <i className="bi bi-pencil me-1"></i> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm px-3 fw-medium"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className="d-flex flex-column bg-white shadow-sm transition-all"
        style={{
          width: sidebarWidth,
          position: "fixed",
          height: "100vh",
          zIndex: 1050,
          borderRight: "1px solid #eaeaea",
          transition: "width 0.3s ease",
        }}
      >
        <div
          className={`d-flex align-items-center ${isSidebarCollapsed ? "justify-content-center" : "px-4"}`}
          style={{ height: "60px", backgroundColor: "#2b2e3e" }}
        >
          <h5 className="text-white fw-bold mb-0 text-nowrap overflow-hidden d-flex align-items-center">
            <i className="bi bi-droplet-half text-primary fs-4"></i>{" "}
            {!isSidebarCollapsed && <span className="ms-2">MyDhobhiGhat</span>}
          </h5>
        </div>
        <div className="overflow-auto py-3">
          <nav className="nav flex-column gap-1 px-2">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`nav-link text-start w-100 fw-medium rounded d-flex align-items-center mb-1 border-0 ${activeSection === "dashboard" ? "text-primary shadow-sm" : "text-secondary hover-bg-light"} ${isSidebarCollapsed ? "justify-content-center" : ""}`}
              style={{
                backgroundColor:
                  activeSection === "dashboard" ? "#f4f6fb" : "transparent",
              }}
            >
              <i className="bi bi-house-door fs-5"></i>
              {!isSidebarCollapsed && <span className="ms-3">Dashboard</span>}
            </button>
            <button
              onClick={() => setActiveSection("orders")}
              className={`nav-link text-start w-100 fw-medium rounded d-flex align-items-center mb-1 border-0 ${activeSection === "orders" ? "text-primary shadow-sm" : "text-secondary hover-bg-light"} ${isSidebarCollapsed ? "justify-content-center" : ""}`}
              style={{
                backgroundColor:
                  activeSection === "orders" ? "#f4f6fb" : "transparent",
              }}
            >
              <i className="bi bi-box-seam fs-5"></i>
              {!isSidebarCollapsed && (
                <span className="ms-3">
                  {userProfile?.role === "user" ? "Book Order" : "Orders"}
                </span>
              )}
            </button>

            {userProfile?.role === "admin" && (
              <button
                onClick={() => setActiveSection("payroll")}
                className={`nav-link text-start w-100 fw-medium rounded d-flex align-items-center mb-1 border-0 ${activeSection === "payroll" ? "text-primary shadow-sm" : "text-secondary hover-bg-light"} ${isSidebarCollapsed ? "justify-content-center" : ""}`}
                style={{
                  backgroundColor:
                    activeSection === "payroll" ? "#f4f6fb" : "transparent",
                }}
              >
                <i className="bi bi-wallet2 fs-5"></i>
                {!isSidebarCollapsed && <span className="ms-3">Payroll</span>}
              </button>
            )}
            {userProfile?.role !== "user" && (
              <button
                onClick={() => setActiveSection("reports")}
                className={`nav-link text-start w-100 fw-medium rounded d-flex align-items-center mb-1 border-0 ${activeSection === "reports" ? "text-primary shadow-sm" : "text-secondary hover-bg-light"} ${isSidebarCollapsed ? "justify-content-center" : ""}`}
                style={{
                  backgroundColor:
                    activeSection === "reports" ? "#f4f6fb" : "transparent",
                }}
              >
                <i className="bi bi-bar-chart fs-5"></i>
                {!isSidebarCollapsed && <span className="ms-3">Reports</span>}
              </button>
            )}
          </nav>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        className="w-100 transition-all"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s ease",
        }}
      >
        <header
          className="bg-white d-flex justify-content-between align-items-center px-4 sticky-top shadow-sm"
          style={{ height: "60px", zIndex: 1040 }}
        >
          <div className="d-flex align-items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="btn btn-link text-muted p-0 border-0 text-decoration-none"
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            {currentTime && (
              <div
                className="text-muted fw-medium d-none d-md-block"
                style={{ fontSize: "0.9rem" }}
              >
                <i className="bi bi-calendar3 me-2"></i>{" "}
                {currentTime.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                <span className="mx-2">|</span>
                <i className="bi bi-clock me-2"></i>{" "}
                {currentTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            )}
          </div>
          <div className="d-flex align-items-center gap-4">
            {/* NOTIFICATION BELL */}
            <div className="position-relative">
              <button
                onClick={markAllNotificationsRead}
                className="btn btn-light rounded-circle position-relative p-2 border shadow-sm me-2"
              >
                <i className="bi bi-bell fs-5 text-dark"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.6rem" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div
                  className="dropdown-menu show position-absolute end-0 mt-3 shadow-lg border-0 rounded-4 py-0"
                  style={{ width: "320px", zIndex: 1050, overflow: "hidden" }}
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
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="list-group-item list-group-item-action px-4 py-3 bg-light border-bottom"
                        >
                          <div className="d-flex w-100 justify-content-between mb-1">
                            <h6 className="mb-0 fw-bold small text-dark">
                              <i className="bi bi-info-circle-fill text-primary me-2"></i>
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
              className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-light border cursor-pointer shadow-sm"
              onClick={() => setIsProfilePopupOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <div
                className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center fw-bold"
                style={{ width: "30px", height: "30px", fontSize: "0.8rem" }}
              >
                {userProfile?.full_name
                  ? userProfile.full_name[0].toUpperCase()
                  : "U"}
              </div>
              <span className="text-dark small fw-bold">
                {userProfile?.full_name || "User"}
              </span>
            </div>
          </div>
        </header>

        <div className="container-fluid p-4">
          {/* ================= DASHBOARD SECTION ================= */}
          {activeSection === "dashboard" && (
            <div>
              {userProfile?.role === "user" ? (
                <div>
                  <div className="bg-primary text-white rounded-4 p-4 mb-4 shadow">
                    <h2 className="fw-bold mb-1">
                      Welcome, {userProfile?.full_name || "Customer"}!
                    </h2>
                    <p className="mb-0 text-white-50">
                      Here are your active laundry orders with live tracking.
                    </p>
                  </div>
                  <h4 className="fw-bold text-dark mb-3">
                    Your Orders & Billing
                  </h4>
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                          <thead className="bg-light border-bottom">
                            <tr
                              className="text-muted"
                              style={{
                                fontSize: "0.8rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              <th className="fw-semibold py-3 ps-4">
                                ORDER ID
                              </th>
                              <th className="fw-semibold py-3">DATE & TIME</th>
                              <th className="fw-semibold py-3">DETAILS</th>
                              <th className="fw-semibold py-3">AMOUNT</th>
                              <th className="fw-semibold py-3 pe-4 text-end">
                                STATUS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersList.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="5"
                                  className="text-center py-5 text-muted"
                                >
                                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>{" "}
                                  You have no active orders.
                                </td>
                              </tr>
                            ) : (
                              ordersList.map((order) => (
                                <tr
                                  key={order.order_id}
                                  className="border-bottom"
                                >
                                  <td className="ps-4 py-3 fw-bold text-dark">
                                    #{order.order_id}
                                  </td>
                                  <td className="py-3 text-secondary">
                                    {order.created_at
                                      ? new Date(
                                          order.created_at,
                                        ).toLocaleString("en-IN", {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        })
                                      : "N/A"}
                                  </td>
                                  <td className="py-3 text-secondary">
                                    {order.service_type || "Laundry Service"}
                                  </td>
                                  <td className="py-3 fw-bold text-dark">
                                    ₹{order.total_amount || 0}
                                  </td>
                                  <td className="pe-4 py-3 text-end">
                                    <span
                                      className={`badge border rounded-pill px-3 py-2 fw-medium ${getOrderStatusStyle(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
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
              ) : (
                <div>
                  <h4 className="fw-bold text-dark mb-4">Dashboard Overview</h4>
                  <div className="row g-4 mb-4">
                    {[
                      {
                        title: "Total Orders",
                        value: dashboardStats.totalOrders,
                        color: "#4caf50",
                        icon: "bi-arrow-up-right",
                      },
                      {
                        title: "Revenue",
                        value: `₹${dashboardStats.revenue}`,
                        color: "#5c92e8",
                        icon: "bi-basket",
                      },
                      {
                        title: "Pending Pickups",
                        value: dashboardStats.pendingPickups,
                        color: "#e85c70",
                        icon: "bi-arrow-repeat",
                      },
                      {
                        title: "Delivery",
                        value: dashboardStats.delivery,
                        color: "#f4a137",
                        icon: "bi-truck",
                      },
                    ].map((stat, idx) => (
                      <div className="col-xl-3 col-md-6" key={idx}>
                        <div
                          className="card border-0 shadow-sm rounded-4 h-100"
                          style={{
                            backgroundColor: stat.color,
                            color: "white",
                          }}
                        >
                          <div className="card-body d-flex justify-content-between align-items-center p-4">
                            <div
                              className="bg-white rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                              style={{ width: "45px", height: "45px" }}
                            >
                              <i
                                className={`bi ${stat.icon} fs-5`}
                                style={{ color: stat.color }}
                              ></i>
                            </div>
                            <div className="text-end">
                              <p
                                className="mb-1 fw-medium opacity-75 text-uppercase"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {stat.title}
                              </p>
                              <h4 className="fw-bold mb-0">{stat.value}</h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADMIN RECENT ORDERS SUMMARY */}
                  <div className="card border-0 shadow-sm rounded-3 mt-4">
                    <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold text-dark mb-0">
                        Recent Live Orders
                      </h5>
                      <button
                        onClick={() => setActiveSection("orders")}
                        className="btn btn-outline-primary btn-sm px-4 py-2 fw-medium rounded-pill d-flex align-items-center gap-2"
                      >
                        Manage All Orders <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                          <thead className="bg-light border-bottom">
                            <tr
                              className="text-muted"
                              style={{
                                fontSize: "0.8rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              <th className="fw-semibold py-3 ps-4">
                                ORDER ID
                              </th>
                              <th className="fw-semibold py-3">
                                CUSTOMER INFO
                              </th>
                              <th className="fw-semibold py-3">LOCATION</th>
                              <th className="fw-semibold py-3">AMOUNT</th>
                              <th className="fw-semibold py-3 pe-4 text-end">
                                STATUS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersList.slice(0, 5).map((order) => (
                              <tr
                                key={order.order_id}
                                className="border-bottom"
                              >
                                <td className="ps-4 py-3 fw-bold text-dark">
                                  #{order.order_id}
                                </td>
                                <td className="py-3">
                                  <span className="fw-semibold text-dark d-block">
                                    {order.customer_name}
                                  </span>
                                  <span className="text-muted small">
                                    <i className="bi bi-telephone-fill me-1"></i>
                                    {order.customer_phone}
                                  </span>
                                </td>
                                <td className="py-3 text-secondary">
                                  <i className="bi bi-geo-alt-fill text-muted me-1"></i>
                                  {order.location}
                                </td>
                                <td className="py-3 fw-bold text-dark">
                                  ₹{order.total_amount || 0}
                                </td>
                                <td className="pe-4 py-3 text-end">
                                  <span
                                    className={`badge border rounded-pill px-3 py-2 fw-medium ${getOrderStatusStyle(order.status)}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ORDERS / BOOKING SECTION ================= */}
          {activeSection === "orders" && (
            <div>
              {userProfile?.role === "user" ? (
                /* CUSTOMER CLOTH CATALOG & CART CHECKOUT */
                <div>
                  <h4 className="fw-bold text-dark mb-4">
                    Book a Laundry Service
                  </h4>
                  <div className="row g-4">
                    {/* Left Side: Cloth Catalog */}
                    <div className="col-lg-7">
                      <div className="row g-3">
                        {clothCatalog.map((cloth) => (
                          <div className="col-md-6" key={cloth.id}>
                            <div className="card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-row justify-content-between align-items-center bg-white">
                              <div>
                                <h6 className="fw-bold mb-1 text-dark">
                                  {cloth.name}
                                </h6>
                                <p className="text-primary fw-semibold mb-0">
                                  ₹{cloth.price} / pc
                                </p>
                              </div>
                              <button
                                onClick={() => addToCart(cloth)}
                                className="btn btn-primary btn-sm rounded-pill px-3 fw-medium"
                              >
                                <i className="bi bi-plus"></i> Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Side: Cart Summary & Checkout */}
                    <div className="col-lg-5">
                      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h5 className="fw-bold text-dark mb-3">
                          Your Order Cart
                        </h5>
                        {cart.length === 0 ? (
                          <p className="text-muted small py-4 text-center">
                            Your cart is empty. Select items from the catalog.
                          </p>
                        ) : (
                          <div>
                            <div
                              className="d-flex flex-column gap-3 mb-4"
                              style={{ maxHeight: "250px", overflowY: "auto" }}
                            >
                              {cart.map((item) => (
                                <div
                                  key={item.id}
                                  className="d-flex justify-content-between align-items-center border-bottom pb-2"
                                >
                                  <div>
                                    <h6 className="mb-0 fw-semibold text-dark">
                                      {item.name}
                                    </h6>
                                    <small className="text-muted">
                                      ₹{item.price} x {item.qty}
                                    </small>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-bold text-dark">
                                      ₹{item.price * item.qty}
                                    </span>
                                    <button
                                      onClick={() => removeFromCart(item.id)}
                                      className="btn btn-sm text-danger p-0"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-top pt-3 mb-4">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted">Total Amount</span>
                                <h4 className="fw-bold text-dark mb-0">
                                  ₹{calculateCartTotal()}
                                </h4>
                              </div>
                            </div>

                            {/* Payment Options */}
                            <h6 className="fw-semibold text-dark mb-2">
                              Select Payment Method
                            </h6>
                            <div className="d-flex flex-column gap-2 mb-4">
                              <div className="form-check border rounded-3 p-3 cursor-pointer">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="payment"
                                  id="cod"
                                  checked={paymentMethod === "Cod"}
                                  onChange={() => setPaymentMethod("Cod")}
                                />
                                <label
                                  className="form-check-label fw-medium text-dark ms-2"
                                  htmlFor="cod"
                                >
                                  Pay on Delivery
                                </label>
                              </div>
                            </div>

                            <button
                              onClick={handleCheckout}
                              className="btn btn-primary w-100 fw-bold py-2 rounded-pill shadow-sm"
                            >
                              Place Order Now
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
                    <h4 className="fw-bold text-dark mb-0">
                      Order Management & Status Control
                    </h4>
                  </div>
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-nowrap">
                          <thead className="bg-light border-bottom">
                            <tr
                              className="text-muted"
                              style={{
                                fontSize: "0.8rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              <th className="fw-semibold py-3 ps-4">
                                ORDER ID
                              </th>
                              <th className="fw-semibold py-3">DATE & TIME</th>
                              <th className="fw-semibold py-3">
                                CUSTOMER INFO
                              </th>
                              <th className="fw-semibold py-3">AMOUNT</th>
                              <th className="fw-semibold py-3">STATUS</th>
                              <th className="fw-semibold py-3 pe-4 text-end">
                                UPDATE STATUS
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ordersList.length === 0 ? (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="text-center py-5 text-muted"
                                >
                                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>{" "}
                                  No orders found.
                                </td>
                              </tr>
                            ) : (
                              ordersList.map((order) => (
                                <tr
                                  key={order.order_id}
                                  className="border-bottom"
                                >
                                  <td className="ps-4 py-3 fw-bold text-dark">
                                    #{order.order_id}
                                  </td>
                                  <td className="py-3 text-secondary">
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
                                    <span className="fw-semibold text-dark d-block">
                                      {order.customer_name}
                                    </span>
                                    <span className="text-muted small">
                                      <i className="bi bi-telephone-fill me-1"></i>
                                      {order.customer_phone}
                                    </span>
                                  </td>
                                  <td className="py-3 fw-bold text-dark">
                                    ₹{order.total_amount || 0}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`badge border rounded-pill px-3 py-2 fw-medium ${getOrderStatusStyle(order.status)}`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="pe-4 py-3 text-end">
                                    <select
                                      className="form-select form-select-sm d-inline-block w-auto border-light bg-light text-secondary shadow-none cursor-pointer"
                                      value={order.status}
                                      onChange={(e) =>
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
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Payroll Management</h4>
                <button
                  onClick={() => setIsAddStaffModalOpen(true)}
                  className="btn btn-primary btn-sm px-4 py-2 fw-medium shadow-sm d-flex align-items-center gap-2"
                >
                  <i className="bi bi-person-plus-fill"></i> Add Staff
                </button>
              </div>
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light border-bottom">
                        <tr
                          className="text-muted"
                          style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                        >
                          <th className="fw-semibold py-3 ps-4">STAFF NAME</th>
                          <th className="fw-semibold py-3">DESIGNATION</th>
                          <th className="fw-semibold py-3">
                            SALARY{" "}
                            <button
                              onClick={handleUnlockSalary}
                              className="btn btn-link text-muted p-0 ms-2 text-decoration-none border-0"
                            >
                              <i
                                className={`bi ${isSalaryVisible ? "bi-unlock-fill" : "bi-lock-fill"}`}
                              ></i>
                            </button>
                          </th>
                          <th className="fw-semibold py-3">PAYMENT STATUS</th>
                          <th className="fw-semibold py-3 pe-4 text-end">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollList.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-5 text-muted"
                            >
                              <i className="bi bi-wallet2 fs-3 d-block mb-2"></i>{" "}
                              No payroll records found.
                            </td>
                          </tr>
                        ) : (
                          payrollList.map((staff) => (
                            <tr key={staff.staff_id} className="border-bottom">
                              <td className="ps-4 py-3 fw-bold text-dark">
                                {staff.staff_name}
                              </td>
                              <td className="py-3 text-secondary">
                                {staff.designation}
                              </td>
                              <td className="py-3 fw-medium text-dark">
                                {isSalaryVisible
                                  ? `₹${staff.monthly_salary}`
                                  : "₹ * * * *"}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`badge border rounded-pill px-3 py-2 fw-medium ${getPayrollStatusStyle(staff.status)}`}
                                >
                                  {staff.status}
                                </span>
                              </td>
                              <td className="pe-4 py-3 text-end d-flex align-items-center justify-content-end gap-2">
                                <select
                                  className="form-select form-select-sm d-inline-block w-auto border-light bg-light text-secondary shadow-none cursor-pointer"
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
                                    className="btn btn-sm btn-outline-primary py-1 px-2 border-0"
                                    title="Edit Salary"
                                  >
                                    <i className="bi bi-pencil-square"></i>
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
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0">Financial Reports</h4>
                <button
                  onClick={handleExportPDF}
                  className="btn btn-outline-primary btn-sm px-4 py-2 fw-medium bg-white shadow-sm d-flex align-items-center gap-2"
                >
                  <i className="bi bi-download"></i> Export PDF
                </button>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-row align-items-center justify-content-between">
                    <div>
                      <h6
                        className="text-muted fw-semibold mb-1 text-uppercase"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Total Revenue
                      </h6>
                      <h3 className="fw-bold text-success mb-0 d-flex align-items-center gap-2">
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
                  <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-row align-items-center justify-content-between">
                    <div>
                      <h6
                        className="text-muted fw-semibold mb-1 text-uppercase"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Total Expenses
                      </h6>
                      <h3 className="fw-bold text-danger mb-0 d-flex align-items-center gap-2">
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

              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-dark mb-0">Expense Ledger</h5>
                  <button
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="btn btn-primary btn-sm px-3 fw-medium"
                  >
                    <i className="bi bi-plus-lg me-1"></i> Add Expense
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap">
                      <thead className="bg-light border-bottom">
                        <tr
                          className="text-muted"
                          style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                        >
                          <th className="fw-semibold py-3 ps-4">DATE</th>
                          <th className="fw-semibold py-3">CATEGORY</th>
                          <th className="fw-semibold py-3">DESCRIPTION</th>
                          <th className="fw-semibold py-3 pe-4 text-end">
                            AMOUNT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-5 text-muted"
                            >
                              <i className="bi bi-receipt fs-3 d-block mb-2"></i>{" "}
                              No expenses logged yet.
                            </td>
                          </tr>
                        ) : (
                          reportsList.map((expense) => (
                            <tr
                              key={expense.expense_id}
                              className="border-bottom"
                            >
                              <td className="ps-4 py-3 fw-bold text-dark">
                                {new Date(
                                  expense.created_at ||
                                    expense.expense_date ||
                                    Date.now(),
                                ).toLocaleDateString()}
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
    </div>
  );
}
