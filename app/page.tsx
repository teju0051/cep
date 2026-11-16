"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  FaSignInAlt,
  FaArrowRight,
  FaWhatsapp,
  FaPhoneAlt,
  FaStore,
  FaFileInvoiceDollar,
  FaBoxes,
  FaBuilding,
  FaUserLock,
  FaMicrophoneAlt,
  FaMobileAlt,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaChartLine,
  FaBolt,
  FaTint,
  FaStar,
  FaPrint,
  FaRupeeSign,
  FaLayerGroup,
} from "react-icons/fa";

const ZENTECH_WHATSAPP = "917738342274";
const ZENTECH_DISPLAY_PHONE = "+91 7738342274";

const LIVE_STORE_DATA: Record<string, any> = {
  "SHOP-A": {
    code: "SHOP-A",
    branch: "WashNora — Main Branch (Andheri West)",
    owner: "Avinash Hirwale",
    todayCash: "₹14,850",
    monthRev: "₹3,42,600",
    pendingDues: "₹1,150",
    expressOrders: "11 Express (+₹550)",
    stockName: "Surf Excel Commercial 5L",
    stockCount: "24 Pcs (Optimal)",
    stockLow: false,
    orders: [
      {
        id: "INV-2091",
        client: "Rohan Deshmukh",
        garment: "4x Shirt Steam, 1x 2pc Suit Dry Clean",
        bill: "₹640",
        payStatus: "PAID",
        stage: "READY",
      },
      {
        id: "INV-2090",
        client: "Priya Nair",
        garment: "2x Silk Saree Polish, 3x Trouser",
        bill: "₹890",
        payStatus: "PARTIAL (Due ₹390)",
        stage: "WASHING",
      },
      {
        id: "INV-2089",
        client: "Vikram Mehta",
        garment: "6kg Wash & Fold + 24Hr Express",
        bill: "₹530",
        payStatus: "PAID",
        stage: "OUT FOR DELIVERY",
      },
    ],
  },
  "SHOP-B": {
    code: "SHOP-B",
    branch: "WashNora — Branch 02 (Kamothe, Navi Mumbai)",
    owner: "Avinash Hirwale",
    todayCash: "₹9,620",
    monthRev: "₹2,18,400",
    pendingDues: "₹680",
    expressOrders: "7 Express (+₹350)",
    stockName: "Comfort Fabric Conditioner",
    stockCount: "04 Pcs (LOW STOCK ALERT)",
    stockLow: true,
    orders: [
      {
        id: "INV-1104",
        client: "Sandeep Kulkarni",
        garment: "2x Heavy Blanket Dry Clean",
        bill: "₹750",
        payStatus: "UNPAID (COD)",
        stage: "RECEIVED",
      },
      {
        id: "INV-1103",
        client: "Neha Patil",
        garment: "5x Office Shirt, 2x Jeans Wash",
        bill: "₹340",
        payStatus: "PAID",
        stage: "READY",
      },
      {
        id: "INV-1102",
        client: "Amit Shinde",
        garment: "1x Designer Sherwani Dry Clean",
        bill: "₹650",
        payStatus: "PAID",
        stage: "STEAM PRESS",
      },
    ],
  },
  "SHOP-C": {
    code: "SHOP-C",
    branch: "WashNora — Branch 03 (Thane West)",
    owner: "Avinash Hirwale",
    todayCash: "₹11,290",
    monthRev: "₹2,74,900",
    pendingDues: "₹0 (All Clear)",
    expressOrders: "9 Express (+₹450)",
    stockName: "Dry Clean Solvent Chemical",
    stockCount: "19 Pcs (Optimal)",
    stockLow: false,
    orders: [
      {
        id: "INV-3041",
        client: "Karan Joshi",
        garment: "4x Window Curtain Dry Clean",
        bill: "₹920",
        payStatus: "PAID",
        stage: "OUT FOR DELIVERY",
      },
      {
        id: "INV-3040",
        client: "Sneha Joshi",
        garment: "3x Dress Steam Press (24Hr Fast)",
        bill: "₹410",
        payStatus: "PAID",
        stage: "READY",
      },
      {
        id: "INV-3039",
        client: "Rahul Verma",
        garment: "8x Daily Wear Wash & Iron",
        bill: "₹360",
        payStatus: "PAID",
        stage: "WASHING",
      },
    ],
  },
};

export default function WhiteAggressiveLaundryLanding() {
  const [activeShopKey, setActiveShopKey] = useState<string>("SHOP-A");
  const currentDemo = LIVE_STORE_DATA[activeShopKey];

  const handleWhatsAppTrial = (source: string = "7-Day Free Trial") => {
    const msg = `*WASHNORA LAUNDRY ERP — 7-DAY FREE TRIAL*\n-----------------------------------------\nHello Zen-Tech Team,\nI want to activate the *7-Day Free Trial (No Credit Card Required)* for my laundry business.\n\n*Selected Option:* ${source}\nPlease set up my store account and rate card.`;
    window.open(
      `https://wa.me/${ZENTECH_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div
      className="min-vh-100 bg-white"
      style={{
        color: "#0F172A",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ================= TOP HIGH-IMPACT ANNOUNCEMENT BAR ================= */}
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
              INDIA&apos;S #1 LAUNDRY ERP
            </span>
            <span>
              BUILT FOR DRY CLEANERS, LAUNDROMATS &amp; MULTI-STORE CHAINS
            </span>
          </div>
          <div className="fw-bold">
            <span className="text-warning me-2">
              7 DAYS FREE TRIAL (NO CREDIT CARD)
            </span>
            <span>WHATSAPP / CALL: </span>
            <a
              href={`tel:${ZENTECH_DISPLAY_PHONE.replace(/\s+/g, "")}`}
              className="text-info text-decoration-none fw-bolder"
            >
              {ZENTECH_DISPLAY_PHONE}
            </a>
          </div>
        </div>
      </div>

      {/* ================= 1. BOLD ARCHITECTURAL NAVBAR ================= */}
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
              alt="WashNora ERP Logo"
              style={{ height: "44px", objectFit: "contain" }}
            />
            <div className="border-start border-2 border-dark ps-3">
              <span
                className="fw-bolder fs-4 text-dark d-block"
                style={{ letterSpacing: "-0.6px", lineHeight: 0.95 }}
              >
                WASH<span style={{ color: "#0284C7" }}>NORA</span>
              </span>
              <span
                className="fw-bolder text-uppercase d-block mt-1"
                style={{
                  fontSize: "0.62rem",
                  color: "#0284C7",
                  letterSpacing: "1.4px",
                }}
              >
                CLOUD LAUNDRY ERP • BY ZEN-TECH
              </span>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            <Link
              href="/pricing"
              className="btn fw-bolder text-dark px-3 py-2 d-flex align-items-center gap-2 neo-btn-white"
              style={{ fontSize: "0.84rem" }}
            >
              <FaStore style={{ color: "#0284C7" }} />
              <span>PRICING &amp; PLANS</span>
            </Link>

            <button
              onClick={() => handleWhatsAppTrial("Navbar 7-Day Free Trial")}
              className="btn fw-bolder text-white px-3 py-2 d-none d-md-flex align-items-center gap-2 neo-btn-green"
              style={{ fontSize: "0.84rem" }}
            >
              <FaWhatsapp size={16} />
              <span>7-DAY FREE TRIAL</span>
            </button>

            <Link
              href="/login"
              className="btn fw-bolder text-white px-4 py-2 d-flex align-items-center gap-2 neo-btn-blue"
              style={{ fontSize: "0.84rem" }}
            >
              <span>STORE LOGIN</span>
              <FaSignInAlt />
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= 2. AGGRESSIVE WHITE & COBALT LAUNDRY HERO ================= */}
      <section
        className="py-5 position-relative"
        style={{
          backgroundColor: "#F0F7FF",
          backgroundImage:
            "linear-gradient(to right, rgba(2, 132, 199, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          borderBottom: "2px solid #0F172A",
        }}
      >
        <div className="container py-3">
          <div className="row g-5 align-items-center">
            {/* Left Column: Direct, High-Converting Sales Pitch */}
            <div className="col-lg-5">
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 fw-bolder text-uppercase bg-white"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "4px 4px 0px #0284C7",
                  fontSize: "0.72rem",
                  letterSpacing: "0.8px",
                }}
              >
                <FaTint style={{ color: "#0284C7" }} />
                <span>
                  BUILT FOR LAUNDRY, DRY CLEAN &amp; STEAM PRESS OWNERS
                </span>
              </div>

              <h1
                className="fw-bolder text-dark mb-3"
                style={{
                  fontSize: "clamp(2.25rem, 4.2vw, 3.35rem)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                }}
              >
                KILL PAPER BILL BOOKS.{" "}
                <span
                  className="px-2 text-white d-inline-block mt-1"
                  style={{ backgroundColor: "#0284C7" }}
                >
                  AUTOMATE YOUR LAUNDRY.
                </span>
              </h1>

              <p
                className="fw-medium mb-4"
                style={{
                  color: "#334155",
                  fontSize: "1.05rem",
                  lineHeight: 1.6,
                }}
              >
                Stop losing daily cash to forgotten unpaid bills, manual
                calculation mistakes, and staff detergent wastage. Generate{" "}
                <strong>1-Click WhatsApp Invoices</strong>, track chemical
                inventory, and control{" "}
                <strong>1 to 10+ laundry branches</strong> live from your phone
                or counter PC.
              </p>

              {/* High-Contrast Trial Box */}
              <div
                className="bg-white p-4 mb-4"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "6px 6px 0px #0F172A",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bolder text-dark small text-uppercase">
                    START YOUR 7-DAY FREE TRIAL TODAY
                  </span>
                  <span
                    className="badge rounded-0 fw-bolder"
                    style={{
                      backgroundColor: "#DCFCE7",
                      color: "#15803D",
                      border: "1px solid #15803D",
                    }}
                  >
                    NO CREDIT CARD NEEDED
                  </span>
                </div>
                <p className="small text-secondary mb-3 fw-medium">
                  Send a message on WhatsApp or call{" "}
                  <strong className="text-dark">{ZENTECH_DISPLAY_PHONE}</strong>
                  . We set up your shop name, address, and custom cloth rate
                  card in 30 minutes.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    onClick={() => handleWhatsAppTrial("Hero 7-Day Free Trial")}
                    className="btn fw-bolder text-white px-4 py-2 d-flex align-items-center gap-2 neo-btn-green"
                  >
                    <FaWhatsapp size={18} />
                    <span>WHATSAPP: {ZENTECH_DISPLAY_PHONE}</span>
                  </button>
                  <Link
                    href="/pricing"
                    className="btn fw-bolder text-dark px-3 py-2 d-flex align-items-center gap-2 neo-btn-white"
                  >
                    <span>SEE PLANS (₹1,999/MO)</span>
                    <FaArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* 3 Hard Stats */}
              <div className="row g-2">
                <div className="col-4">
                  <div
                    className="bg-white p-2 text-center"
                    style={{ border: "2px solid #0F172A" }}
                  >
                    <div
                      className="fw-bolder fs-5"
                      style={{ color: "#0284C7" }}
                    >
                      15 SEC
                    </div>
                    <small
                      className="fw-bold text-uppercase d-block"
                      style={{ fontSize: "0.65rem" }}
                    >
                      COUNTER BILLING
                    </small>
                  </div>
                </div>
                <div className="col-4">
                  <div
                    className="bg-white p-2 text-center"
                    style={{ border: "2px solid #0F172A" }}
                  >
                    <div className="fw-bolder fs-5 text-success">₹0 COST</div>
                    <small
                      className="fw-bold text-uppercase d-block"
                      style={{ fontSize: "0.65rem" }}
                    >
                      WHATSAPP BILLS
                    </small>
                  </div>
                </div>
                <div className="col-4">
                  <div
                    className="bg-white p-2 text-center"
                    style={{ border: "2px solid #0F172A" }}
                  >
                    <div className="fw-bolder fs-5 text-dark">100%</div>
                    <small
                      className="fw-bold text-uppercase d-block"
                      style={{ fontSize: "0.65rem" }}
                    >
                      OWNER PRIVACY
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive White & Cobalt Live ERP Counter Board */}
            <div className="col-lg-7">
              <div
                className="bg-white"
                style={{
                  border: "3px solid #0F172A",
                  boxShadow: "10px 10px 0px #0284C7",
                }}
              >
                {/* Top Header Bar of the Live ERP Board */}
                <div
                  className="px-3 py-2 d-flex justify-content-between align-items-center flex-wrap gap-2 text-white"
                  style={{
                    backgroundColor: "#0F172A",
                    borderBottom: "2px solid #0F172A",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="px-2 py-1 fw-bolder text-dark"
                      style={{ backgroundColor: "#38BDF8", fontSize: "0.7rem" }}
                    >
                      LIVE ERP DEMO
                    </span>
                    <span className="fw-bold small">
                      CLICK ANY BRANCH BELOW TO TEST MULTI-STORE SWITCHING
                    </span>
                  </div>
                  <span className="small fw-bold text-info">
                    ● REALTIME SYNC
                  </span>
                </div>

                {/* Interactive Branch Switcher Tabs */}
                <div
                  className="p-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                  style={{
                    backgroundColor: "#E0F2FE",
                    borderBottom: "2px solid #0F172A",
                  }}
                >
                  <div className="fw-bolder small text-dark d-flex align-items-center gap-2">
                    <FaBuilding style={{ color: "#0284C7" }} />
                    <span>OWNER BRANCH SWITCHER:</span>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.keys(LIVE_STORE_DATA).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveShopKey(key)}
                        className="btn btn-sm fw-bolder px-3 py-1 rounded-0"
                        style={{
                          backgroundColor:
                            activeShopKey === key ? "#0F172A" : "#FFFFFF",
                          color: activeShopKey === key ? "#FFFFFF" : "#0F172A",
                          border: "2px solid #0F172A",
                          fontSize: "0.75rem",
                        }}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main ERP Preview Body */}
                <div className="p-3 p-md-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 pb-2 border-bottom border-2 border-dark">
                    <div>
                      <h5 className="fw-bolder text-dark mb-0">
                        {currentDemo.branch}
                      </h5>
                      <small className="fw-bold text-secondary">
                        Licensed Owner:{" "}
                        <span className="text-dark">{currentDemo.owner}</span>{" "}
                        (100% Isolated)
                      </small>
                    </div>
                    <span
                      className="px-2 py-1 fw-bolder small"
                      style={{
                        backgroundColor: "#DCFCE7",
                        color: "#15803D",
                        border: "2px solid #15803D",
                      }}
                    >
                      STORE ACTIVE
                    </span>
                  </div>

                  {/* 4 High-Contrast Laundry Counter KPIs */}
                  <div className="row g-2 mb-3">
                    <div className="col-6 col-sm-3">
                      <div
                        className="p-2 px-3"
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "2px solid #0F172A",
                        }}
                      >
                        <small
                          className="fw-bolder text-secondary d-block"
                          style={{ fontSize: "0.64rem" }}
                        >
                          TODAY&apos;S PAID CASH
                        </small>
                        <span className="fw-bolder fs-5 text-dark">
                          {currentDemo.todayCash}
                        </span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div
                        className="p-2 px-3"
                        style={{
                          backgroundColor: "#F0F9FF",
                          border: "2px solid #0F172A",
                        }}
                      >
                        <small
                          className="fw-bolder text-secondary d-block"
                          style={{ fontSize: "0.64rem" }}
                        >
                          MONTHLY REVENUE
                        </small>
                        <span
                          className="fw-bolder fs-5"
                          style={{ color: "#0284C7" }}
                        >
                          {currentDemo.monthRev}
                        </span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div
                        className="p-2 px-3"
                        style={{
                          backgroundColor: "#FEF2F2",
                          border: "2px solid #0F172A",
                        }}
                      >
                        <small
                          className="fw-bolder text-secondary d-block"
                          style={{ fontSize: "0.64rem" }}
                        >
                          UNPAID CUSTOMER DUES
                        </small>
                        <span className="fw-bolder fs-5 text-danger">
                          {currentDemo.pendingDues}
                        </span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-3">
                      <div
                        className="p-2 px-3"
                        style={{
                          backgroundColor: "#FFFBEB",
                          border: "2px solid #0F172A",
                        }}
                      >
                        <small
                          className="fw-bolder text-secondary d-block"
                          style={{ fontSize: "0.64rem" }}
                        >
                          24HR EXPRESS UPSELL
                        </small>
                        <span
                          className="fw-bolder text-dark"
                          style={{ fontSize: "0.88rem" }}
                        >
                          {currentDemo.expressOrders}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Order Table */}
                  <div
                    className="table-responsive mb-3"
                    style={{ border: "2px solid #0F172A" }}
                  >
                    <table
                      className="table table-sm align-middle mb-0"
                      style={{ fontSize: "0.78rem" }}
                    >
                      <thead
                        className="text-white"
                        style={{ backgroundColor: "#0F172A" }}
                      >
                        <tr>
                          <th className="ps-3 py-2">BILL NO</th>
                          <th className="py-2">CUSTOMER &amp; GARMENTS</th>
                          <th className="py-2">AMOUNT</th>
                          <th className="py-2">PAYMENT</th>
                          <th className="pe-3 py-2 text-end">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDemo.orders.map((ord: any, idx: number) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #CBD5E1" }}
                          >
                            <td
                              className="ps-3 fw-bolder"
                              style={{ color: "#0284C7" }}
                            >
                              #{ord.id}
                            </td>
                            <td>
                              <div className="fw-bolder text-dark">
                                {ord.client}
                              </div>
                              <small className="text-secondary fw-medium">
                                {ord.garment}
                              </small>
                            </td>
                            <td className="fw-bolder text-dark">{ord.bill}</td>
                            <td>
                              <span
                                className="px-2 py-0 fw-bolder"
                                style={{
                                  fontSize: "0.68rem",
                                  backgroundColor:
                                    ord.payStatus === "PAID"
                                      ? "#DCFCE7"
                                      : "#FEF3C7",
                                  color:
                                    ord.payStatus === "PAID"
                                      ? "#15803D"
                                      : "#B45309",
                                  border: "1px solid #0F172A",
                                }}
                              >
                                {ord.payStatus}
                              </span>
                            </td>
                            <td className="pe-3 text-end">
                              <span
                                className="px-2 py-0 fw-bolder text-white"
                                style={{
                                  backgroundColor: "#0F172A",
                                  fontSize: "0.66rem",
                                }}
                              >
                                {ord.stage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Detergent Stock & WhatsApp Action Bar */}
                  <div
                    className="p-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                    style={{
                      backgroundColor: currentDemo.stockLow
                        ? "#FEF2F2"
                        : "#F8FAFC",
                      border: "2px solid #0F172A",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div className="fw-bold">
                      <FaBoxes
                        className="me-2"
                        style={{
                          color: currentDemo.stockLow ? "#DC2626" : "#0284C7",
                        }}
                      />
                      <span>STOCK MONITOR: {currentDemo.stockName} — </span>
                      <strong
                        className={
                          currentDemo.stockLow ? "text-danger" : "text-success"
                        }
                      >
                        {currentDemo.stockCount}
                      </strong>
                    </div>
                    <span className="fw-bolder text-success d-flex align-items-center gap-1">
                      <FaWhatsapp /> 1-Click WhatsApp Bill Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. 6 CORE LAUNDRY ERP WEAPONS (BOLD WHITE GRID) ================= */}
      <section
        className="py-5 bg-white"
        style={{ borderBottom: "2px solid #0F172A" }}
      >
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 pb-3 border-bottom border-2 border-dark">
            <div>
              <span
                className="px-2 py-1 fw-bolder text-uppercase text-white"
                style={{ backgroundColor: "#0284C7", fontSize: "0.72rem" }}
              >
                COMPLETE LAUNDRY COMMAND SUITE
              </span>
              <h2 className="display-6 fw-bolder text-dark mt-2 mb-0">
                Everything Your Laundry Needs to Dominate
              </h2>
            </div>
            <Link
              href="/pricing"
              className="btn fw-bolder text-dark px-4 py-2 mt-3 mt-md-0 neo-btn-white d-inline-flex align-items-center gap-2"
            >
              <span>COMPARE ALL PLANS</span>
              <FaArrowRight size={13} />
            </Link>
          </div>

          <div className="row g-4">
            {/* Weapon 1 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#0284C7",
                      border: "2px solid #0F172A",
                    }}
                  >
                    <FaWhatsapp size={24} />
                  </div>
                  <span className="fw-bolder text-secondary small">
                    01 // BILLING
                  </span>
                </div>
                <h5 className="fw-bolder text-dark mb-2">
                  1-Click Free WhatsApp &amp; A4 Thermal Invoices
                </h5>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.6 }}
                >
                  Never pay ₹0.80 per WhatsApp message again. Send itemized
                  bills with cloth names, rates, delivery charges, paid amount,
                  and balance due directly to customer WhatsApp for ₹0, or print
                  zero-margin A4/Thermal bills.
                </p>
              </div>
            </div>

            {/* Weapon 2 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#0F172A",
                      border: "2px solid #0F172A",
                    }}
                  >
                    <FaBuilding size={22} />
                  </div>
                  <span className="fw-bolder text-secondary small">
                    02 // MULTI-STORE
                  </span>
                </div>
                <h5 className="fw-bolder text-dark mb-2">
                  Multi-Branch Switcher with 100% Owner Privacy
                </h5>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.6 }}
                >
                  Run 2, 3, or 10 branches? Switch between Shop A, Shop B, and
                  Shop C from one dropdown at the top. Strict owner isolation
                  ensures other store owners on the software can never see your
                  shops or customers.
                </p>
              </div>
            </div>

            {/* Weapon 3 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#059669",
                      border: "2px solid #0F172A",
                    }}
                  >
                    <FaBoxes size={22} />
                  </div>
                  <span className="fw-bolder text-secondary small">
                    03 // INVENTORY
                  </span>
                </div>
                <h5 className="fw-bolder text-dark mb-2">
                  Detergent &amp; Chemical Stock + Auto Expense Ledger
                </h5>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.6 }}
                >
                  Stop staff from wasting liquid detergent, stain removers, and
                  packaging covers. Get low-stock warnings at 10 units, and
                  automatically log every restock purchase into your Business
                  Expense Ledger.
                </p>
              </div>
            </div>

            {/* Weapon 4 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="d-flex justify-content-center align-items-center text-dark fw-bold"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#FACC15",
                      border: "2px solid #0F172A",
                    }}
                  >
                    <FaMobileAlt size={22} />
                  </div>
                  <span className="fw-bolder text-secondary small">
                    04 // CUSTOMER APP
                  </span>
                </div>
                <h5 className="fw-bolder text-dark mb-2">
                  Customer Mobile Booking &amp; Delivery Slot Picker
                </h5>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.6 }}
                >
                  Customers get an Instagram-style mobile web app to book
                  pickups, select Fast 24-Hr Express Delivery (+₹50 extra profit
                  for you), or reschedule their delivery date &amp; time slot if
                  they are away from home.
                </p>
              </div>
            </div>

            {/* Weapon 5 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#DC2626",
                      border: "2px solid #0F172A",
                    }}
                  >
                    <FaUserLock size={22} />
                  </div>
                  <span className="fw-bolder text-secondary small">
                    05 // PAYROLL LOCK
                  </span>
                </div>
                <h5 className="fw-bolder text-dark mb-2">
                  PIN-Locked Staff Salaries &amp; Unpaid Bill Recovery
                </h5>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.6 }}
                >
                  Hide staff salaries (`₹ * * * *`) behind an Owner PIN so
                  counter managers cannot see what others earn. Plus, filter all
                  Partially Paid and Unpaid customer bills in 1 click so zero
                  cash slips away.
                </p>
              </div>
            </div>

            {/* Weapon 6 */}
            <div className="col-md-6 col-lg-4">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="d-flex justify-content-center align-items-center text-white fw-bold"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#7C3AED",
                      border: "2px solid #0F172A",
                    }}
                  >
                    <FaMicrophoneAlt size={22} />
                  </div>
                  <span className="fw-bolder text-secondary small">
                    06 // ARYA VOICE AI
                  </span>
                </div>
                <h5 className="fw-bolder text-dark mb-2">
                  Arya AI Hands-Free Voice Commands
                </h5>
                <p
                  className="text-secondary small mb-0 fw-medium"
                  style={{ lineHeight: 1.6 }}
                >
                  Hands busy sorting clothes during rush hour? Just say
                  &ldquo;Hey Arya, update order 105 to Finished&rdquo; or
                  &ldquo;Hey Arya, add stock&rdquo; in Indian English and watch
                  the ERP execute it hands-free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. PAPER NOTEBOOK VS. WASHNORA ERP (AGGRESSIVE CONTRAST) ================= */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#F8FAFC",
          borderBottom: "2px solid #0F172A",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <span
              className="px-3 py-1 fw-bolder text-uppercase bg-white"
              style={{ border: "2px solid #0F172A", fontSize: "0.75rem" }}
            >
              STOP THE PROFIT LEAKAGE
            </span>
            <h2 className="display-6 fw-bolder text-dark mt-2">
              Why Old Paper Registers Cost You ₹15,000+ Every Month
            </h2>
          </div>

          <div className="row g-4">
            {/* Old Register */}
            <div className="col-lg-6">
              <div
                className="p-4 bg-white h-100"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "6px 6px 0px #DC2626",
                }}
              >
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-2 border-dark">
                  <h5 className="fw-bolder text-danger mb-0">
                    OLD PAPER REGISTER / BASIC BILLING
                  </h5>
                  <span className="badge bg-danger text-white rounded-0">
                    LOSING MONEY
                  </span>
                </div>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0 small fw-medium text-secondary">
                  <li className="d-flex gap-2">
                    <FaTimes className="text-danger mt-1 flex-shrink-0" />
                    <span>
                      Customer says &ldquo;I will pay next time&rdquo; and the
                      unpaid bill gets lost inside old notebook pages.
                    </span>
                  </li>
                  <li className="d-flex gap-2">
                    <FaTimes className="text-danger mt-1 flex-shrink-0" />
                    <span>
                      20 liters of detergent finishes in 10 days with zero proof
                      of where it went.
                    </span>
                  </li>
                  <li className="d-flex gap-2">
                    <FaTimes className="text-danger mt-1 flex-shrink-0" />
                    <span>
                      Delivery boy wastes petrol going to locked flats because
                      the customer wasn&apos;t home.
                    </span>
                  </li>
                  <li className="d-flex gap-2">
                    <FaTimes className="text-danger mt-1 flex-shrink-0" />
                    <span>
                      Owner has to physically sit at the shop counter all day or
                      call managers at night.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* WashNora ERP */}
            <div className="col-lg-6">
              <div
                className="p-4 bg-white h-100"
                style={{
                  border: "2px solid #0F172A",
                  boxShadow: "6px 6px 0px #059669",
                }}
              >
                <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-2 border-dark">
                  <h5 className="fw-bolder text-success mb-0">
                    WASHNORA CLOUD LAUNDRY ERP
                  </h5>
                  <span className="badge bg-success text-white rounded-0">
                    +32% MORE PROFIT
                  </span>
                </div>
                <ul className="list-unstyled d-flex flex-column gap-3 mb-0 small fw-medium text-dark">
                  <li className="d-flex gap-2">
                    <FaCheck className="text-success mt-1 flex-shrink-0" />
                    <span>
                      <strong>1-Click Unpaid &amp; Partial Paid Filter</strong>{" "}
                      shows every pending rupee + sends instant WhatsApp bill
                      reminders.
                    </span>
                  </li>
                  <li className="d-flex gap-2">
                    <FaCheck className="text-success mt-1 flex-shrink-0" />
                    <span>
                      <strong>Live Stock Counter</strong> tracks every unit of
                      detergent and auto-logs costs into your Expense Ledger.
                    </span>
                  </li>
                  <li className="d-flex gap-2">
                    <FaCheck className="text-success mt-1 flex-shrink-0" />
                    <span>
                      <strong>Customer Time-Slot Picker</strong> lets customers
                      choose Morning/Evening delivery +{" "}
                      <strong>₹50 Fast 24-Hr Express upsell</strong>.
                    </span>
                  </li>
                  <li className="d-flex gap-2">
                    <FaCheck className="text-success mt-1 flex-shrink-0" />
                    <span>
                      <strong>Live Multi-Branch Dropdown</strong> lets you
                      monitor Shop A, Shop B, and Shop C from anywhere on your
                      phone.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. REAL LAUNDRY OWNER PROOF ================= */}
      <section
        className="py-5 bg-white"
        style={{ borderBottom: "2px solid #0F172A" }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <span
              className="px-3 py-1 fw-bolder text-uppercase text-white"
              style={{ backgroundColor: "#0F172A", fontSize: "0.72rem" }}
            >
              PROVEN IN LIVE LAUNDRY SHOPS
            </span>
            <h2 className="display-6 fw-bolder text-dark mt-2">
              Trusted by Multi-Branch &amp; Independent Store Owners
            </h2>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-2 border-dark">
                  <div>
                    <h5 className="fw-bolder text-dark mb-0">
                      Avinash Hirwale
                    </h5>
                    <small className="fw-bold text-secondary">
                      Owner of 3 Branches: Andheri West, Kamothe &amp; Thane
                      West
                    </small>
                  </div>
                  <span
                    className="px-2 py-1 fw-bolder small"
                    style={{
                      backgroundColor: "#DCFCE7",
                      color: "#15803D",
                      border: "1px solid #15803D",
                    }}
                  >
                    +32% SALES GROWTH
                  </span>
                </div>
                <div className="d-flex gap-1 text-warning mb-2">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p
                  className="text-dark small mb-0 fw-medium"
                  style={{ lineHeight: 1.65 }}
                >
                  &ldquo;Managing 3 laundry branches used to mean calling each
                  manager every night to check cash totals. With WashNora ERP, I
                  switch between Shop A, Shop B, and Shop C from one dropdown on
                  my phone. Customers get instant WhatsApp bills, and our
                  pending unpaid bills dropped to almost zero.&rdquo;
                </p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-4 bg-white h-100 neo-card">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-2 border-dark">
                  <div>
                    <h5 className="fw-bolder text-dark mb-0">
                      Manohar Laundry Services
                    </h5>
                    <small className="fw-bold text-secondary">
                      Independent Store Owner • Maharashtra
                    </small>
                  </div>
                  <span
                    className="px-2 py-1 fw-bolder small"
                    style={{
                      backgroundColor: "#E0F2FE",
                      color: "#0369A1",
                      border: "1px solid #0369A1",
                    }}
                  >
                    SAVED ₹6,500/MO IN STOCK
                  </span>
                </div>
                <div className="d-flex gap-1 text-warning mb-2">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p
                  className="text-dark small mb-0 fw-medium"
                  style={{ lineHeight: 1.65 }}
                >
                  &ldquo;Detergent and chemical stock finishing too fast was my
                  biggest headache. Now every bottle is counted and expenses are
                  calculated automatically. Best of all, my shop account is 100%
                  private to me—no other owner on the platform can see my store
                  or my customers.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. FINAL AGGRESSIVE TRIAL CTA BLOCK ================= */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0284C7",
          borderBottom: "2px solid #0F172A",
        }}
      >
        <div className="container py-3">
          <div
            className="bg-white p-4 p-md-5"
            style={{
              border: "3px solid #0F172A",
              boxShadow: "10px 10px 0px #0F172A",
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span
                  className="px-2 py-1 fw-bolder text-uppercase text-dark mb-2 d-inline-block"
                  style={{
                    backgroundColor: "#FACC15",
                    border: "2px solid #0F172A",
                    fontSize: "0.75rem",
                  }}
                >
                  7 DAYS FREE TRIAL — NO CREDIT CARD REQUIRED
                </span>
                <h2 className="fw-bolder text-dark mb-2">
                  Put WashNora ERP in Your Laundry Shop Today.
                </h2>
                <p className="text-secondary fw-medium mb-0">
                  Send a message on WhatsApp or call us at{" "}
                  <strong className="text-dark">{ZENTECH_DISPLAY_PHONE}</strong>
                  . Our engineers will set up your store name, address, and
                  cloth price list in 30 minutes so you can test it live at your
                  counter for 7 days free.
                </p>
              </div>

              <div className="col-lg-4 d-flex flex-column gap-2">
                <button
                  onClick={() =>
                    handleWhatsAppTrial("Bottom Banner 7-Day Free Trial")
                  }
                  className="btn fw-bolder text-white py-3 d-flex justify-content-center align-items-center gap-2 neo-btn-green"
                >
                  <FaWhatsapp size={20} />
                  <span>WHATSAPP TRIAL: {ZENTECH_DISPLAY_PHONE}</span>
                </button>
                <div className="d-flex gap-2">
                  <a
                    href={`tel:${ZENTECH_DISPLAY_PHONE.replace(/\s+/g, "")}`}
                    className="btn fw-bolder text-dark flex-fill py-2 d-flex justify-content-center align-items-center gap-2 neo-btn-white"
                  >
                    <FaPhoneAlt size={13} />
                    <span>CALL NOW</span>
                  </a>
                  <Link
                    href="/pricing"
                    className="btn fw-bolder text-white flex-fill py-2 d-flex justify-content-center align-items-center gap-2 neo-btn-blue"
                  >
                    <span>SEE PRICING</span>
                    <FaArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-4 bg-white">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 small fw-bold">
          <div className="text-secondary">
            © 2026 <strong className="text-dark">WashNora Laundry ERP</strong> —
            Powered by{" "}
            <strong style={{ color: "#0284C7" }}>Zen-Tech Systems</strong>{" "}
            (MSME: UDYAM-MH-27-0214642).
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-4">
            <Link href="/pricing" className="text-dark text-decoration-none">
              PRICING &amp; PLANS
            </Link>
            <button
              onClick={() => handleWhatsAppTrial("Footer Trial Link")}
              className="btn btn-link p-0 text-success text-decoration-none fw-bolder small"
            >
              7-DAY FREE TRIAL ({ZENTECH_DISPLAY_PHONE})
            </button>
            <Link
              href="/login"
              style={{ color: "#0284C7" }}
              className="text-decoration-none"
            >
              STORE LOGIN
            </Link>
          </div>
        </div>
      </footer>

      {/* ================= NEO-BRUTALIST ENTERPRISE STYLES ================= */}
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
