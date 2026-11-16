"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import {
  FaCheck,
  FaTimes,
  FaWhatsapp,
  FaPhoneAlt,
  FaStore,
  FaBuilding,
  FaChartLine,
  FaShieldAlt,
  FaStar,
  FaPlus,
  FaMinus,
  FaSignInAlt,
  FaFileInvoiceDollar,
  FaBoxes,
  FaUserLock,
  FaTruck,
  FaMicrophoneAlt,
  FaCalculator,
  FaBolt,
} from "react-icons/fa";

const ZENTECH_WHATSAPP = "917738342274";
const ZENTECH_DISPLAY_PHONE = "+91 7738342274";
const RAZORPAY_KEY_ID = "rzp_live_TTaH03kARMoEdZ";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Profit Calculator States
  const [dailyOrders, setDailyOrders] = useState<number>(35);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(260);

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

  const handleCheckoutPlan = async (planName: string, amount: number) => {
    setLoadingTier(planName);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setLoadingTier(null);
      Swal.fire("Error", "Payment gateway failed to load.", "error");
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: "INR",
      name: "Zen-Tech International",
      description: `WashNora Laundry ERP — ${planName} (${billingCycle.toUpperCase()})`,
      handler: async function (response: any) {
        setLoadingTier(null);
        Swal.fire({
          icon: "success",
          title: "Subscription Activated",
          html: `Payment ID: <strong>${response.razorpay_payment_id}</strong><br/>Redirecting to your store login...`,
          confirmButtonColor: "#0284c7",
        }).then(() => {
          window.location.href = "/login";
        });
      },
      theme: { color: "#0284c7" },
      modal: {
        ondismiss: () => setLoadingTier(null),
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleWhatsAppTrial = (planName: string = "7-Day Free Trial") => {
    const msg = `Hello Zen-Tech Team,\n\nI want to start my *7 Days Free Trial (No Credit Card Required)* for the WashNora Laundry ERP Software.\n\n*Selected Plan:* ${planName}\nPlease set up my laundry store account.`;
    window.open(
      `https://wa.me/${ZENTECH_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  // ROI Calculator Math
  const monthlyTotalSales = dailyOrders * avgOrderValue * 30;
  const savedUnpaidBills = Math.round(monthlyTotalSales * 0.08);
  const extraOnlineOrders = Math.round(monthlyTotalSales * 0.15);
  const savedDetergentWaste = 3200;
  const totalExtraMoney =
    savedUnpaidBills + extraOnlineOrders + savedDetergentWaste;

  const FAQS = [
    {
      q: "1. Can I test the software in my laundry shop for free before paying?",
      a: "Yes. Every laundry owner gets a full 7-Day Free Trial with no credit card and no advance payment required. Send a WhatsApp message or call +91 7738342274, and our engineers will configure your store name and rate card within 30 minutes.",
    },
    {
      q: "2. What daily shop problems does WashNora ERP solve compared to a paper register?",
      a: "In a paper notebook, bills get lost, calculation errors happen at the counter, staff can forget to record cash, and customers constantly call asking for their clothes. WashNora ERP stores every order, customer phone number, unpaid balance, and detergent count securely on your phone and computer.",
    },
    {
      q: "3. How does this software increase my shop's monthly sales and profit?",
      a: "First, customers get a mobile booking page to schedule pickups from home 24/7. Second, the built-in 'Fast 24-Hour Express Delivery (+₹50)' option adds pure profit to urgent orders. Third, the 'Partially Paid' and 'Unpaid' filters ensure you never forget to collect pending money.",
    },
    {
      q: "4. I own multiple laundry branches. Can another shop owner see my stores or customers?",
      a: "No, never. Your business data is 100% isolated and private. If you own 3 branches, your top header dropdown shows only your 3 branches. Another laundry owner on our platform can only see their own shop.",
    },
    {
      q: "5. Is there any per-message charge for sending WhatsApp invoices?",
      a: "No. Sending WhatsApp bills is 100% free and unlimited. With one click, a structured bill with cloth items, quantities, rate, total amount, paid amount, and balance due opens directly in WhatsApp for your customer.",
    },
    {
      q: "6. Can I hide staff salaries from my counter manager?",
      a: "Yes. Inside the Payroll tab, all staff salaries are masked (₹ * * * *) and protected by an Admin PIN. Counter staff can use the billing screen without ever seeing staff salaries.",
    },
    {
      q: "7. How does the Detergent & Chemical Stock tracker stop wastage?",
      a: "Whenever you buy detergent, liquid chemical, hangers, or packaging covers, you log the quantity and unit price. When stock drops below 10 units, the dashboard alerts you. Every restock automatically logs an expense in your Expense Ledger so you see your true Net Profit.",
    },
    {
      q: "8. What if a customer is away from home on the delivery day?",
      a: "Customers can tap 'Change Delivery Schedule' on their phone and select their preferred date and time slot (Morning, Afternoon, Evening, or Night). Your delivery staff never wastes fuel visiting a locked house.",
    },
    {
      q: "9. How does the Arya Voice AI Assistant work?",
      a: "During busy counter hours, you can speak commands in English such as 'Hey Arya, update order 105 to Finished' or 'Hey Arya, add stock', and the software performs the action hands-free.",
    },
    {
      q: "10. Do I need to buy new computers or thermal printers?",
      a: "No. WashNora ERP runs smoothly on any smartphone, tablet, laptop, or desktop PC. It supports both standard A4 printers and thermal receipt printers with clean zero-margin printouts.",
    },
    {
      q: "11. How do subscription reminders and renewals work?",
      a: "Starting 7 days before your plan expires, the dashboard displays a daily reminder at 8:00 AM. When your subscription ends, you can scan the UPI QR code or pay via Razorpay directly on the login screen to reactivate your store in 10 seconds.",
    },
    {
      q: "12. How fast can we start using the software in our shop?",
      a: "Within 30 minutes. Click any WhatsApp button on this page or call +91 7738342274, send us your shop name and cloth price list, and we will hand over your ready-to-use login.",
    },
  ];

  return (
    <div
      className="min-vh-100 bg-white"
      style={{
        color: "#0F172A",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ================= TOP ANNOUNCEMENT BAR ================= */}
      <div
        className="py-2 px-3 text-white"
        style={{
          backgroundColor: "#0F172A",
          borderBottom: "2px solid #0284C7",
          fontSize: "0.8rem",
        }}
      >
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 fw-bold">
            <span
              className="px-2 py-0 text-dark fw-bolder text-uppercase"
              style={{
                backgroundColor: "#38BDF8",
                borderRadius: "2px",
                fontSize: "0.7rem",
              }}
            >
              7-DAY FREE TRIAL
            </span>
            <span>NO CREDIT CARD REQUIRED — SETUP IN 30 MINUTES</span>
          </div>
          <div className="fw-bold">
            <span className="text-warning me-2">WHATSAPP / CALL:</span>
            <a
              href={`tel:${ZENTECH_DISPLAY_PHONE.replace(/\s+/g, "")}`}
              className="text-info text-decoration-none fw-bolder"
            >
              {ZENTECH_DISPLAY_PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* ================= STICKY CORPORATE NAVBAR ================= */}
      <nav
        className="bg-white py-3 sticky-top"
        style={{
          borderBottom: "2px solid #0F172A",
          zIndex: 1030,
        }}
      >
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Link
            href="/"
            className="d-flex align-items-center gap-3 text-decoration-none"
          >
            <img
              src="/logo.png"
              alt="WashNora ERP"
              style={{ height: "40px", objectFit: "contain" }}
            />
            <div className="border-start border-2 border-dark ps-3">
              <span
                className="fw-bolder fs-5 text-dark d-block"
                style={{ letterSpacing: "-0.4px", lineHeight: 0.95 }}
              >
                WASH<span style={{ color: "#0284C7" }}>NORA</span>
              </span>
              <span
                className="fw-bolder text-uppercase d-block mt-1"
                style={{
                  fontSize: "0.62rem",
                  color: "#0284C7",
                  letterSpacing: "1.2px",
                }}
              >
                CLOUD LAUNDRY ERP • BY ZEN-TECH
              </span>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link
              href="/login"
              className="btn fw-bolder text-dark px-3 py-2 d-flex align-items-center gap-2 neo-btn-white"
              style={{ fontSize: "0.82rem" }}
            >
              <FaSignInAlt style={{ color: "#0284C7" }} />
              <span>STORE LOGIN</span>
            </Link>
            <button
              onClick={() => handleWhatsAppTrial("Navbar 7-Day Free Trial")}
              className="btn fw-bolder text-white px-3 py-2 d-flex align-items-center gap-2 neo-btn-green"
              style={{ fontSize: "0.82rem" }}
            >
              <FaWhatsapp size={16} />
              <span>7-DAY FREE TRIAL</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= PRICING HEADER & BILLING TOGGLE ================= */}
      <section
        className="py-5 text-center border-bottom"
        style={{
          backgroundColor: "#F0F7FF",
          backgroundImage:
            "linear-gradient(to right, rgba(2, 132, 199, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          borderColor: "#0F172A",
        }}
      >
        <div className="container py-2">
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 fw-bolder text-uppercase bg-white"
            style={{
              border: "2px solid #0F172A",
              boxShadow: "4px 4px 0px #0284C7",
              fontSize: "0.72rem",
              letterSpacing: "0.8px",
            }}
          >
            <FaShieldAlt style={{ color: "#0284C7" }} />
            <span>TRANSPARENT B2B SAAS PRICING • NO HIDDEN FEES</span>
          </div>

          <h1
            className="fw-bolder display-6 text-dark mb-2"
            style={{ letterSpacing: "-0.5px" }}
          >
            Software Investment That Pays For Itself in 3 Days
          </h1>
          <p
            className="text-secondary mx-auto mb-4 fw-medium"
            style={{ maxWidth: "620px" }}
          >
            Every subscription includes unlimited daily orders, free WhatsApp
            billing, customer booking portal, and a{" "}
            <strong className="text-dark">
              7-Day Free Trial (No Credit Card Required)
            </strong>
            .
          </p>

          <div
            className="d-inline-flex align-items-center bg-white p-1"
            style={{
              border: "2px solid #0F172A",
              boxShadow: "4px 4px 0px #0F172A",
            }}
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`btn btn-sm rounded-0 px-4 py-2 fw-bolder border-0 ${
                billingCycle === "monthly"
                  ? "bg-dark text-white"
                  : "text-secondary bg-white"
              }`}
            >
              MONTHLY BILLING
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`btn btn-sm rounded-0 px-4 py-2 fw-bolder border-0 ${
                billingCycle === "annual"
                  ? "bg-dark text-white"
                  : "text-secondary bg-white"
              }`}
            >
              YEARLY BILLING{" "}
              <span className="badge bg-warning text-dark ms-1 rounded-0 fw-bold">
                SAVE 35%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= 3 EXECUTIVE PRICING CARDS ================= */}
      <section className="container py-5">
        <div className="row g-4 align-items-stretch">
          {/* TIER 1: BASIC BILLING */}
          <div className="col-lg-4">
            <div className="p-4 bg-white h-100 neo-card d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span
                  className="badge rounded-0 px-2 py-1 fw-bolder text-uppercase"
                  style={{
                    backgroundColor: "#F1F5F9",
                    color: "#475569",
                    border: "1px solid #CBD5E1",
                  }}
                >
                  SINGLE LAUNDRY SHOP
                </span>
                <FaStore className="text-secondary" size={20} />
              </div>

              <h4 className="fw-bolder text-dark mb-1">
                1. Basic Billing Plan
              </h4>
              <p className="text-secondary small mb-3 fw-medium">
                For a single neighborhood laundry or steam press shop moving
                from paper bill books to computer/mobile billing.
              </p>

              <div
                className="p-3 mb-3 bg-white"
                style={{ border: "2px solid #0F172A" }}
              >
                <div className="d-flex align-items-baseline gap-1">
                  <h2 className="fw-bolder display-6 text-dark mb-0">
                    {billingCycle === "annual" ? "₹1,499" : "₹1,999"}
                  </h2>
                  <span className="text-secondary small fw-bold">/ month</span>
                </div>
                <small className="text-success fw-bold d-block mt-1">
                  {billingCycle === "annual"
                    ? "Billed ₹17,988 yearly (You save ₹6,000)"
                    : "Just ₹66 per day • Unlimited Daily Orders"}
                </small>
              </div>

              <div
                className="p-3 rounded-0 bg-light border-start border-4 border-secondary mb-3"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div className="fw-bolder text-dark small mb-1">
                  Problem Solved in This Price:
                </div>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.5 }}
                >
                  Stops lost paper slips and calculation mistakes. Send official
                  WhatsApp bills in 1 click and see a clear list of customers
                  who haven&apos;t paid yet.
                </p>
              </div>

              <h6 className="fw-bolder text-dark small text-uppercase mb-3">
                What Is Included:
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-4 small fw-medium flex-grow-1">
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>1 Store Branch License</strong> (Unlimited Orders)
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Fast Counter POS &amp; Custom Price List</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>1-Click Free WhatsApp Invoice Sender</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Clean A4 &amp; Thermal PDF Bill Printing</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Full Payment Status</strong> (Fully Paid, Half Paid,
                    Unpaid)
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Customer Mobile Booking App</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2 text-muted">
                  <FaTimes className="text-muted mt-1 flex-shrink-0" />
                  <span>Detergent &amp; Chemical Stock Tracker</span>
                </li>
                <li className="d-flex align-items-start gap-2 text-muted">
                  <FaTimes className="text-muted mt-1 flex-shrink-0" />
                  <span>Shop Expense Ledger &amp; Net Profit Charts</span>
                </li>
                <li className="d-flex align-items-start gap-2 text-muted">
                  <FaTimes className="text-muted mt-1 flex-shrink-0" />
                  <span>Multi-Branch Switcher &amp; Payroll PIN Lock</span>
                </li>
              </ul>

              <div className="mt-auto d-flex flex-column gap-2">
                <button
                  onClick={() =>
                    handleWhatsAppTrial("Basic Billing Plan (₹1,999)")
                  }
                  className="btn fw-bolder text-white py-2 d-flex justify-content-center align-items-center gap-2 neo-btn-green"
                >
                  <FaWhatsapp size={16} />
                  <span>Start 7-Day Free Trial</span>
                </button>
                <button
                  onClick={() =>
                    handleCheckoutPlan(
                      "Basic Billing Plan",
                      billingCycle === "annual" ? 17988 : 1999,
                    )
                  }
                  disabled={loadingTier === "Basic Billing Plan"}
                  className="btn fw-bolder text-dark py-2 neo-btn-white"
                  style={{ fontSize: "0.85rem" }}
                >
                  {loadingTier === "Basic Billing Plan"
                    ? "Opening Razorpay..."
                    : `Subscribe Now (${billingCycle === "annual" ? "₹17,988/yr" : "₹1,999/mo"})`}
                </button>
              </div>
            </div>
          </div>

          {/* TIER 2: SMART SHOP + STOCK (DARK NAVY EXECUTIVE CARD) */}
          <div className="col-lg-4">
            <div
              className="p-4 h-100 d-flex flex-column position-relative text-white"
              style={{
                backgroundColor: "#0B132B",
                border: "2px solid #0F172A",
                boxShadow: "8px 8px 0px #0284C7",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-warning text-dark rounded-0 px-2 py-1 fw-bold">
                  MOST POPULAR — BEST ROI
                </span>
                <FaChartLine className="text-info" size={20} />
              </div>

              <h4 className="fw-bolder text-white mb-1">
                2. Smart Shop + Stock Plan
              </h4>
              <p className="small mb-3 fw-medium" style={{ color: "#94A3B8" }}>
                Complete automation for busy laundries that want to stop
                detergent waste, track expenses, and earn express delivery fees.
              </p>

              <div
                className="p-3 mb-3 bg-white text-dark"
                style={{ border: "2px solid #0284C7" }}
              >
                <div className="d-flex align-items-baseline gap-1">
                  <h2 className="fw-bolder display-6 text-primary mb-0">
                    {billingCycle === "annual" ? "₹1,999" : "₹2,999"}
                  </h2>
                  <span className="small fw-bold text-secondary">/ month</span>
                </div>
                <small className="text-success fw-bold d-block mt-1">
                  {billingCycle === "annual"
                    ? "Billed ₹23,988 yearly (You save ₹12,000!)"
                    : "Recovers its entire monthly fee in 3 days"}
                </small>
              </div>

              <div
                className="p-3 rounded-0 mb-3 border-start border-4 border-info"
                style={{ backgroundColor: "#16203D" }}
              >
                <div className="fw-bold text-info small mb-1">
                  Problem Solved in This Price:
                </div>
                <p
                  className="small mb-0 text-white fw-medium"
                  style={{ lineHeight: 1.5 }}
                >
                  Stops staff from wasting detergent, calculates exact Net
                  Profit after electricity/chemical bills, and adds{" "}
                  <strong>+₹50 Fast 24-Hr Delivery</strong> income.
                </p>
              </div>

              <h6 className="fw-bold text-info small text-uppercase mb-3">
                Everything in Basic, Plus:
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-4 small fw-medium flex-grow-1">
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>Detergent &amp; Chemical Stock Tracker</strong>{" "}
                    (With Low-Stock Badges)
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>Auto-Logged Restock Expenses</strong> in Expense
                    Ledger
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>
                      Daily, Monthly &amp; Yearly Revenue &amp; Profit Charts
                    </strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>
                      Customer Delivery Date &amp; Time Slot Picker
                    </strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>
                      Fast 24-Hr Express Delivery (+₹50 Extra Profit)
                    </strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>Online Razorpay Payment + Cash on Delivery</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-info mt-1 flex-shrink-0" />
                  <span>
                    <strong>Loud Ringing Chime</strong> on New Customer Orders
                  </span>
                </li>
              </ul>

              <div className="mt-auto d-flex flex-column gap-2">
                <button
                  onClick={() =>
                    handleWhatsAppTrial("Smart Shop + Stock Plan (₹2,999)")
                  }
                  className="btn fw-bolder text-white py-2 d-flex justify-content-center align-items-center gap-2 neo-btn-green"
                >
                  <FaWhatsapp size={16} />
                  <span>Start 7-Day Free Trial</span>
                </button>
                <button
                  onClick={() =>
                    handleCheckoutPlan(
                      "Smart Shop + Stock Plan",
                      billingCycle === "annual" ? 23988 : 2999,
                    )
                  }
                  disabled={loadingTier === "Smart Shop + Stock Plan"}
                  className="btn fw-bolder text-dark py-2"
                  style={{
                    backgroundColor: "#38BDF8",
                    border: "2px solid #0F172A",
                    borderRadius: "0px",
                    fontSize: "0.85rem",
                  }}
                >
                  {loadingTier === "Smart Shop + Stock Plan"
                    ? "Opening Razorpay..."
                    : `Subscribe Now (${billingCycle === "annual" ? "₹23,988/yr" : "₹2,999/mo"})`}
                </button>
              </div>
            </div>
          </div>

          {/* TIER 3: MULTI-BRANCH ENTERPRISE */}
          <div className="col-lg-4">
            <div className="p-4 bg-white h-100 neo-card d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span
                  className="badge rounded-0 px-2 py-1 fw-bolder text-uppercase"
                  style={{
                    backgroundColor: "#ECFDF5",
                    color: "#047857",
                    border: "1px solid #059669",
                  }}
                >
                  FOR 2 TO 10+ BRANCHES
                </span>
                <FaBuilding className="text-success" size={20} />
              </div>

              <h4 className="fw-bolder text-dark mb-1">
                3. Multi-Branch Owner Plan
              </h4>
              <p className="text-secondary small mb-3 fw-medium">
                For chain owners running multiple laundry branches or franchises
                who want to monitor all shops from one login.
              </p>

              <div
                className="p-3 mb-3 bg-white"
                style={{ border: "2px solid #0F172A" }}
              >
                <div className="d-flex align-items-baseline gap-1">
                  <h2 className="fw-bolder display-6 text-dark mb-0">
                    {billingCycle === "annual" ? "₹3,749" : "₹4,999"}
                  </h2>
                  <span className="text-secondary small fw-bold">
                    / month (3 Shops)
                  </span>
                </div>
                <small className="text-success fw-bold d-block mt-1">
                  {billingCycle === "annual"
                    ? "Billed ₹44,988 yearly (Only ₹1,249 per shop!)"
                    : "Includes 3 Shops • +₹1,499/mo per extra shop"}
                </small>
              </div>

              <div
                className="p-3 rounded-0 bg-light border-start border-4 border-success mb-3"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div className="fw-bolder text-dark small mb-1">
                  Problem Solved in This Price:
                </div>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.5 }}
                >
                  Watch all your shops without leaving home. Switch between Shop
                  A, Shop B, and Shop C in 1 click, lock staff salaries with a
                  PIN, and use Voice AI.
                </p>
              </div>

              <h6 className="fw-bolder text-dark small text-uppercase mb-3">
                Everything in Smart Plan, Plus:
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-4 small fw-medium flex-grow-1">
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>3 Laundry Branches Included</strong> in 1 Owner
                    Login
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>1-Click Header Branch Switcher Dropdown</strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>100% Owner Privacy</strong> (Other owners cannot see
                    your shops)
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>
                      Password-Locked Staff Payroll &amp; Salary Tracker
                    </strong>
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Arya Voice AI Assistant</strong> (Hands-free voice
                    control)
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <FaCheck className="text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>
                      Dedicated Zen-Tech Setup Engineer &amp; VIP Support
                    </strong>
                  </span>
                </li>
              </ul>

              <div className="mt-auto d-flex flex-column gap-2">
                <button
                  onClick={() =>
                    handleWhatsAppTrial("Multi-Branch Owner Plan (₹4,999)")
                  }
                  className="btn fw-bolder text-white py-2 d-flex justify-content-center align-items-center gap-2 neo-btn-green"
                >
                  <FaWhatsapp size={16} />
                  <span>Start 7-Day Free Trial</span>
                </button>
                <button
                  onClick={() =>
                    handleCheckoutPlan(
                      "Multi-Branch Owner Plan",
                      billingCycle === "annual" ? 44988 : 4999,
                    )
                  }
                  disabled={loadingTier === "Multi-Branch Owner Plan"}
                  className="btn fw-bolder text-dark py-2 neo-btn-white"
                  style={{ fontSize: "0.85rem" }}
                >
                  {loadingTier === "Multi-Branch Owner Plan"
                    ? "Opening Razorpay..."
                    : `Subscribe Now (${billingCycle === "annual" ? "₹44,988/yr" : "₹4,999/mo"})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE PROFIT & SAVINGS CALCULATOR ================= */}
      <section className="container py-5">
        <div
          className="card rounded-0 bg-white p-4 p-md-5"
          style={{
            border: "2px solid #0F172A",
            boxShadow: "8px 8px 0px #0F172A",
          }}
        >
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="d-inline-flex align-items-center gap-2 text-primary fw-bold small mb-2">
                <FaCalculator />
                <span>LAUNDRY PROFIT &amp; SAVINGS SIMULATOR</span>
              </div>
              <h3 className="fw-bolder text-dark mb-2">
                See How Much Extra Money Your Shop Will Make Every Month
              </h3>
              <p className="text-secondary small mb-4 fw-medium">
                Move the two sliders below according to your laundry shop&apos;s
                daily orders:
              </p>

              <div className="mb-4">
                <div className="d-flex justify-content-between fw-bolder small mb-2 text-dark">
                  <span>Daily Orders in Your Shop:</span>
                  <span className="badge bg-primary text-white px-3 py-1 rounded-0">
                    {dailyOrders} Orders / Day
                  </span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min={10}
                  max={150}
                  step={5}
                  value={dailyOrders}
                  onChange={(e) => setDailyOrders(Number(e.target.value))}
                />
              </div>

              <div className="mb-2">
                <div className="d-flex justify-content-between fw-bolder small mb-2 text-dark">
                  <span>Average Bill Amount per Order (₹):</span>
                  <span className="badge bg-primary text-white px-3 py-1 rounded-0">
                    ₹{avgOrderValue} / Order
                  </span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min={100}
                  max={800}
                  step={20}
                  value={avgOrderValue}
                  onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div
                className="p-4 rounded-0 text-white"
                style={{
                  backgroundColor: "#0B132B",
                  border: "2px solid #0F172A",
                }}
              >
                <h6 className="text-info fw-bold text-uppercase mb-3">
                  Your Estimated Monthly Financial Gain
                </h6>

                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-2">
                  <span
                    className="small fw-medium"
                    style={{ color: "#CBD5E1" }}
                  >
                    1. Unpaid / Forgotten Bills Recovered (8%):
                  </span>
                  <strong className="text-white">
                    + ₹{savedUnpaidBills.toLocaleString("en-IN")}/mo
                  </strong>
                </div>

                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-2">
                  <span
                    className="small fw-medium"
                    style={{ color: "#CBD5E1" }}
                  >
                    2. Customer Booking App &amp; Fast Delivery (+15%):
                  </span>
                  <strong className="text-white">
                    + ₹{extraOnlineOrders.toLocaleString("en-IN")}/mo
                  </strong>
                </div>

                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-2 mb-3">
                  <span
                    className="small fw-medium"
                    style={{ color: "#CBD5E1" }}
                  >
                    3. Saved Detergent &amp; Liquid Stock Waste:
                  </span>
                  <strong className="text-white">
                    + ₹{savedDetergentWaste.toLocaleString("en-IN")}/mo
                  </strong>
                </div>

                <div
                  className="p-3 rounded-0"
                  style={{
                    backgroundColor: "#16203D",
                    border: "1px solid #0284C7",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span className="d-block small text-warning fw-bold">
                      TOTAL EXTRA MONTHLY PROFIT
                    </span>
                    <small style={{ color: "#94A3B8" }}>
                      Software costs only ₹1,999 – ₹2,999/mo
                    </small>
                  </div>
                  <h3 className="fw-bolder text-warning mb-0">
                    + ₹{totalExtraMoney.toLocaleString("en-IN")}/mo
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FULL FEATURE COMPARISON TABLE ================= */}
      <section className="container py-4">
        <div className="text-center mb-4">
          <h3 className="fw-bolder text-dark mb-1">
            Complete Feature Comparison
          </h3>
          <p className="text-secondary small fw-medium">
            Every tool built to make your laundry shop faster, cleaner, and more
            profitable
          </p>
        </div>

        <div
          className="card rounded-0 overflow-hidden bg-white shadow-sm"
          style={{ border: "2px solid #0F172A" }}
        >
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: "#0B132B", color: "#FFFFFF" }}>
                <tr>
                  <th className="py-3 ps-4">SOFTWARE FEATURE</th>
                  <th className="text-center py-3">Basic (₹1,999)</th>
                  <th
                    className="text-center py-3"
                    style={{ backgroundColor: "#0284C7" }}
                  >
                    Smart Stock (₹2,999)
                  </th>
                  <th className="text-center py-3 pe-4">
                    Multi-Branch (₹4,999)
                  </th>
                </tr>
              </thead>
              <tbody className="small fw-medium">
                <tr>
                  <td className="ps-4 fw-bold">
                    Number of Laundry Branches Included
                  </td>
                  <td className="text-center">1 Shop</td>
                  <td className="text-center fw-bold text-primary">1 Shop</td>
                  <td className="text-center pe-4 fw-bold text-success">
                    3 Shops (+₹1,499/extra)
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    7-Day Free Trial (No Credit Card Required)
                  </td>
                  <td className="text-center text-success fw-bold">Included</td>
                  <td className="text-center text-primary fw-bold">Included</td>
                  <td className="text-center pe-4 text-success fw-bold">
                    Included
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    1-Click WhatsApp Bill Sender (₹0 per message)
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-success" />
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-primary" />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    Clean A4 &amp; Thermal PDF Invoice Printing
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-success" />
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-primary" />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    Unpaid &amp; Partially Paid Balance Tracker
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-success" />
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-primary" />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">Customer Mobile Booking App</td>
                  <td className="text-center">
                    <FaCheck className="text-success" />
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-primary" />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    Customer Delivery Date &amp; Time Slot Rescheduling
                  </td>
                  <td className="text-center text-muted">Standard Only</td>
                  <td className="text-center fw-bold text-primary">
                    Custom Date + Fast 24h
                  </td>
                  <td className="text-center pe-4 fw-bold text-success">
                    Custom Date + Fast 24h
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    Detergent &amp; Chemical Stock Tracker + Low Stock Alert
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-primary" />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    Expense Ledger &amp; Net Profit Charts
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center">
                    <FaCheck className="text-primary" />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    1-Click Multi-Branch Switcher (Owner Isolated)
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    PIN-Locked Staff Payroll &amp; Salary Management
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
                <tr>
                  <td className="ps-4 fw-bold">
                    Arya AI Hands-Free Voice Assistant
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center text-muted">
                    <FaTimes />
                  </td>
                  <td className="text-center pe-4">
                    <FaCheck className="text-success" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ================= CLIENT FEEDBACK & RESULTS ================= */}
      <section
        className="py-5 bg-white border-top border-bottom mt-4"
        style={{ borderColor: "#0F172A" }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <span
              className="badge rounded-0 px-3 py-1 fw-bold mb-2"
              style={{
                backgroundColor: "#ECFDF5",
                color: "#047857",
                border: "1px solid #059669",
              }}
            >
              PROVEN IN REAL LAUNDRY STORES
            </span>
            <h3 className="fw-bolder text-dark mb-1">
              What Laundry Owners Say After Switching to WashNora ERP
            </h3>
            <p className="text-secondary small fw-medium">
              Real feedback from store owners across Mumbai, Navi Mumbai, and
              Thane
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div
                className="p-4 h-100 neo-card bg-white"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "6px 6px 0px #0F172A",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-1 text-warning">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <span className="badge bg-success text-white rounded-0">
                    +32% Sales Increase
                  </span>
                </div>
                <p
                  className="text-dark small mb-3 fw-medium"
                  style={{ lineHeight: 1.65 }}
                >
                  &ldquo;I run 3 branches in Andheri West, Kamothe, and Thane
                  West. Earlier I had to call my managers every night to ask for
                  cash totals. Now I check all 3 shops from one dropdown on my
                  phone. Customers get instant WhatsApp bills, and we recovered
                  all our pending unpaid bills.&rdquo;
                </p>
                <div className="mt-auto pt-3 border-top border-dark">
                  <h6 className="fw-bold text-dark mb-0">Avinash Hirwale</h6>
                  <small className="text-secondary fw-semibold">
                    Owner of 3 Branches (Andheri West, Kamothe &amp; Thane)
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="p-4 h-100 neo-card bg-white"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "6px 6px 0px #0F172A",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-1 text-warning">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <span className="badge bg-primary text-white rounded-0">
                    Saved ₹6,500/mo in Stock
                  </span>
                </div>
                <p
                  className="text-dark small mb-3 fw-medium"
                  style={{ lineHeight: 1.65 }}
                >
                  &ldquo;My biggest worry was detergent and liquid stock
                  finishing too fast. With WashNora ERP, every bottle is counted
                  and expenses are logged automatically. Also, my shop account
                  is 100% private to my login—nobody else can see my store or my
                  customers.&rdquo;
                </p>
                <div className="mt-auto pt-3 border-top border-dark">
                  <h6 className="fw-bold text-dark mb-0">Manohar</h6>
                  <small className="text-secondary fw-semibold">
                    Laundry Store Owner • Maharashtra
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="p-4 h-100 neo-card bg-white"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "6px 6px 0px #0F172A",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex gap-1 text-warning">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <span className="badge bg-dark text-white rounded-0">
                    +₹9,000 Express Delivery
                  </span>
                </div>
                <p
                  className="text-dark small mb-3 fw-medium"
                  style={{ lineHeight: 1.65 }}
                >
                  &ldquo;Customers book orders from their mobile phone and pick
                  their own delivery date and time slot. Many customers choose
                  the Fast 24-Hr Delivery (+₹50) option, which easily pays for
                  our monthly software fee, and our delivery boy never visits a
                  locked flat.&rdquo;
                </p>
                <div className="mt-auto pt-3 border-top border-dark">
                  <h6 className="fw-bold text-dark mb-0">
                    Rajesh Dry Cleaners
                  </h6>
                  <small className="text-secondary fw-semibold">
                    Steam Press &amp; Dry Clean Shop • Navi Mumbai
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 12 SIMPLE FAQs ================= */}
      <section className="container py-5">
        <div className="text-center mb-4">
          <h3 className="fw-bolder text-dark mb-1">
            12 Frequently Asked Questions
          </h3>
          <p className="text-secondary small fw-medium">
            Clear answers in simple words about our 7-day free trial, security,
            and billing
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            {FAQS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="card rounded-0 mb-2 bg-white shadow-sm"
                  style={{ border: "2px solid #0F172A" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="btn text-start w-100 p-3 fw-bold text-dark d-flex justify-content-between align-items-center border-0 bg-white"
                  >
                    <span>{item.q}</span>
                    <span className="text-primary ms-2 flex-shrink-0">
                      {isOpen ? <FaMinus size={14} /> : <FaPlus size={14} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 pt-2 text-secondary small fw-medium border-top border-dark bg-light">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CALL TO ACTION BANNER ================= */}
      <section className="container mb-5">
        <div
          className="rounded-0 p-4 p-md-5 text-center text-white shadow"
          style={{
            backgroundColor: "#0B132B",
            border: "3px solid #0F172A",
            boxShadow: "10px 10px 0px #0284C7",
          }}
        >
          <span className="badge bg-warning text-dark rounded-0 px-3 py-1 fw-bold mb-2">
            7 DAYS FREE TRIAL — NO CREDIT CARD REQUIRED
          </span>
          <h2 className="fw-bolder mb-2 text-white">
            Try WashNora ERP in Your Laundry Shop Today
          </h2>
          <p
            className="mx-auto mb-4 small fw-medium"
            style={{ maxWidth: "600px", color: "#CBD5E1" }}
          >
            Send a message on WhatsApp or call us directly at{" "}
            <strong className="text-white">{ZENTECH_DISPLAY_PHONE}</strong>. Our
            team will set up your shop name, address, and cloth price list in 30
            minutes.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <button
              onClick={() => handleWhatsAppTrial("7-Day Free Trial")}
              className="btn fw-bolder text-white px-4 py-3 d-flex align-items-center gap-2 neo-btn-green"
              style={{ fontSize: "1rem" }}
            >
              <FaWhatsapp size={20} />
              <span>WhatsApp Trial: {ZENTECH_DISPLAY_PHONE}</span>
            </button>
            <a
              href={`tel:${ZENTECH_DISPLAY_PHONE.replace(/\s+/g, "")}`}
              className="btn fw-bolder text-dark px-4 py-3 d-flex align-items-center gap-2 neo-btn-white"
              style={{ fontSize: "1rem" }}
            >
              <FaPhoneAlt size={16} />
              <span>Call Now: {ZENTECH_DISPLAY_PHONE}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= STICKY BOTTOM TRIAL BAR ================= */}
      <div
        className="position-fixed bottom-0 start-0 end-0 bg-white text-dark py-2 px-3 shadow-lg border-top border-dark d-flex justify-content-between align-items-center flex-wrap gap-2"
        style={{ zIndex: 1050 }}
      >
        <div className="small fw-bolder d-flex align-items-center gap-2">
          <span className="badge bg-success text-white rounded-0">
            FREE TRIAL
          </span>
          <span>
            7 Days Free Trial (No Credit Card Required) — Call or WhatsApp{" "}
            <strong className="text-primary">{ZENTECH_DISPLAY_PHONE}</strong>
          </span>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => handleWhatsAppTrial("7-Day Free Trial")}
            className="btn fw-bolder text-white px-3 py-1 neo-btn-green"
            style={{ fontSize: "0.8rem" }}
          >
            <FaWhatsapp size={14} className="me-1" />
            <span>WhatsApp Us</span>
          </button>
          <a
            href={`tel:${ZENTECH_DISPLAY_PHONE.replace(/\s+/g, "")}`}
            className="btn fw-bolder text-dark px-3 py-1 neo-btn-white"
            style={{ fontSize: "0.8rem" }}
          >
            <FaPhoneAlt size={11} className="me-1" />
            <span>Call Now</span>
          </a>
        </div>
      </div>

      {/* ================= NEO-BRUTALIST STYLES ================= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .neo-card {
          border: 2px solid #0F172A;
          box-shadow: 6px 6px 0px #0F172A;
          border-radius: 0px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .neo-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: 9px 9px 0px #0284C7;
        }
        .neo-btn-blue {
          background-color: #0284C7;
          border: 2px solid #0F172A;
          box-shadow: 4px 4px 0px #0F172A;
          border-radius: 0px;
          transition: all 0.15s ease;
        }
        .neo-btn-blue:hover {
          background-color: #0369A1;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #0F172A;
        }
        .neo-btn-green {
          background-color: #059669;
          border: 2px solid #0F172A;
          box-shadow: 4px 4px 0px #0F172A;
          border-radius: 0px;
          transition: all 0.15s ease;
        }
        .neo-btn-green:hover {
          background-color: #047857;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #0F172A;
        }
        .neo-btn-white {
          background-color: #FFFFFF;
          border: 2px solid #0F172A;
          box-shadow: 4px 4px 0px #0F172A;
          border-radius: 0px;
          transition: all 0.15s ease;
        }
        .neo-btn-white:hover {
          background-color: #F0F9FF;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #0284C7;
        }
      `,
        }}
      />
    </div>
  );
}
