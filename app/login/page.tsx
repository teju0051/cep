"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";
import {
  FaShieldAlt,
  FaWhatsapp,
  FaPhoneAlt,
  FaBolt,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa";

const ZENTECH_SUPPORT_PHONE = "917738342274"; // +91 7738342274
const ZENTECH_DISPLAY_PHONE = "+91 7738342274";
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

// Strictly whitelisted Super Admin emails (in addition to profile.role === 'superadmin')
const SUPERADMIN_EMAILS = ["tejasshinde021@gmail.com"];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // B2B Suspension & Renewal Modal States (shown only when subscription ends / store is suspended)
  const [suspendedMsg, setSuspendedMsg] = useState<string | null>(null);
  const [suspendedShop, setSuspendedShop] = useState<any>(null);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState<boolean>(false);
  const [isPayingRenewal, setIsPayingRenewal] = useState<boolean>(false);

  // Load Razorpay Checkout Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper: Verify User Role & Redirect Super Admin Straight to /sys-telemetry
  const verifyStoreSubscription = async (
    userId: string,
    userEmail?: string,
  ) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, shop_id, full_name, phone")
      .eq("id", userId)
      .maybeSingle();

    const cleanEmail = (userEmail || "").toLowerCase().trim();

    // 1. SUPER ADMIN CHECK -> Always redirect to /sys-telemetry (NEVER /dashboard)
    const isSuperAdmin =
      profile?.role === "superadmin" ||
      SUPERADMIN_EMAILS.includes(cleanEmail) ||
      cleanEmail.includes("zentech");

    if (isSuperAdmin) {
      return {
        allowed: true,
        isSuperAdmin: true,
        redirectUrl: "/sys-telemetry",
        shop: null,
      };
    }

    // 2. STORE ADMIN / MANAGER SUBSCRIPTION CHECK
    if (profile?.role === "admin" || profile?.role === "manager") {
      const assignedShopId = profile.shop_id || "SHOP-A";

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("shop_id", assignedShopId)
        .maybeSingle();

      const isSubExpired =
        shopData?.subscription_end &&
        new Date(shopData.subscription_end).getTime() <= Date.now();

      if (shopData?.status === "Suspended" || isSubExpired) {
        const msg =
          shopData?.suspension_reason ||
          "Your subscription has been ended. Please renew to continue the service.";
        return {
          allowed: false,
          isSuperAdmin: false,
          message: msg,
          redirectUrl: "/login",
          shop: shopData || {
            shop_id: assignedShopId,
            shop_name: `WashNora (${assignedShopId})`,
            owner_name: profile?.full_name || "Store Admin",
            owner_phone: profile?.phone || "",
            last_invoice_amount: 4999,
          },
        };
      }
    }

    // 3. ACTIVE STORE ADMIN OR REGULAR CUSTOMER -> Redirect to /dashboard
    return {
      allowed: true,
      isSuperAdmin: false,
      redirectUrl: "/dashboard",
      shop: null,
    };
  };

  useEffect(() => {
    // 1. Check URL query params for ?suspended=1 or ?suspended=true
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isSusp =
        params.get("suspended") === "1" || params.get("suspended") === "true";

      if (isSusp) {
        const customMsg =
          params.get("msg") ||
          "Your subscription has been ended. Please renew to continue the service.";
        const paramShopId = params.get("shop_id") || "SHOP-A";

        setSuspendedMsg(customMsg);

        supabase
          .from("shops")
          .select("*")
          .eq("shop_id", paramShopId)
          .maybeSingle()
          .then(({ data }) => {
            setSuspendedShop(
              data || {
                shop_id: paramShopId,
                shop_name: "WashNora Laundry Store",
                owner_name: "Store Partner",
                last_invoice_amount: 4999,
              },
            );
            setIsRenewalModalOpen(true);
          });
      }
    }

    // 2. Check existing session or Google OAuth return
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const check = await verifyStoreSubscription(
          session.user.id,
          session.user.email,
        );

        if (!check.allowed) {
          await supabase.auth.signOut();
          setSuspendedMsg(check.message || null);
          setSuspendedShop(check.shop);
          setIsRenewalModalOpen(true);
          return;
        }

        // Redirects to /sys-telemetry for Super Admin, or /dashboard for others
        window.location.replace(check.redirectUrl);
      }
    };
    checkSession();
  }, []);

  // ================= INSTANT ONLINE RENEWAL VIA RAZORPAY =================
  const handleInstantRazorpayRenewal = async () => {
    if (!RAZORPAY_KEY_ID) {
      Swal.fire(
        "Configuration Error",
        "Razorpay API key is missing in environment variables.",
        "error",
      );
      return;
    }

    const targetShop = suspendedShop || {
      shop_id: "SHOP-A",
      shop_name: "WashNora Store",
      owner_name: email || "Store Owner",
      last_invoice_amount: 4999,
    };
    const renewalAmount = parseFloat(targetShop.last_invoice_amount) || 4999;

    setIsPayingRenewal(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setIsPayingRenewal(false);
      Swal.fire("Error", "Failed to load Razorpay payment gateway.", "error");
      return;
    }

    const logoUrl =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? `${window.location.origin}/zentech-logo.png`
        : undefined;

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(renewalAmount * 100),
      currency: "INR",
      name: "Zen-Tech International",
      description: `30-Day ERP Subscription Renewal — ${targetShop.shop_name}`,
      ...(logoUrl ? { image: logoUrl } : {}),
      handler: async function (response: any) {
        const newEnd = new Date();
        newEnd.setDate(newEnd.getDate() + 30);
        const nowIso = new Date().toISOString();

        // 1. Reactivate Store in Supabase & Extend by +30 Days
        await supabase
          .from("shops")
          .update({
            status: "Active",
            suspension_reason: null,
            subscription_end: newEnd.toISOString(),
            last_paid_at: nowIso,
          })
          .eq("shop_id", targetShop.shop_id);

        // 2. Log Paid B2B Invoice in saas_invoices
        await supabase.from("saas_invoices").insert([
          {
            shop_id: targetShop.shop_id,
            shop_name: targetShop.shop_name,
            owner_name: targetShop.owner_name || "Store Partner",
            owner_phone: targetShop.owner_phone || "",
            amount: renewalAmount,
            billing_period: `Online Renewal [Razorpay: ${response.razorpay_payment_id}]`,
            payment_status: "Paid",
            paid_at: nowIso,
          },
        ]);

        setIsPayingRenewal(false);
        setIsRenewalModalOpen(false);
        setSuspendedMsg(null);

        await Swal.fire({
          icon: "success",
          title: "Subscription Renewed & Activated",
          html: `Payment ID: <strong>${response.razorpay_payment_id}</strong><br/>Your store <strong>${targetShop.shop_name}</strong> is now Active for the next 30 days. Please sign in below.`,
          confirmButtonColor: "#198754",
        });
      },
      prefill: {
        name: targetShop.owner_name || "",
        email: targetShop.owner_email || email || "",
        contact: targetShop.owner_phone || "",
      },
      notes: {
        provider: "Zen-Tech International",
        shop_id: targetShop.shop_id,
        shop_name: targetShop.shop_name,
      },
      theme: { color: "#0d6efd" },
      modal: {
        ondismiss: () => setIsPayingRenewal(false),
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // ================= MANUAL RENEWAL VIA WHATSAPP (+91 7738342274) =================
  const handleWhatsAppManualRenewal = () => {
    const shopId = suspendedShop?.shop_id || "SHOP-A";
    const shopName = suspendedShop?.shop_name || "WashNora Store";
    const amount = suspendedShop?.last_invoice_amount || 4999;

    const message = `*ZEN-TECH ERP — SUBSCRIPTION RENEWAL REQUEST*\n-----------------------------------------\nHello Zen-Tech Support Team,\nI would like to renew my Laundry ERP software subscription.\n\n*Store ID:* ${shopId}\n*Store Name:* ${shopName}\n*Admin Email:* ${email || suspendedShop?.owner_email || "N/A"}\n*Renewal Amount:* ₹${amount}\n-----------------------------------------\nPlease share the payment confirmation or activate my store subscription. Thank you!`;

    const waUrl = `https://wa.me/${ZENTECH_SUPPORT_PHONE}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(waUrl, "_blank");
  };

  const handleEmailAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 1. Handle wrong email/password FIRST
      if (error || !data?.user) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: error?.message || "Invalid login credentials.",
          confirmButtonColor: "#0d6efd",
        });
        setLoading(false);
        return;
      }

      // 2. Check role & subscription status
      const subCheck = await verifyStoreSubscription(
        data.user.id,
        data.user.email,
      );

      if (!subCheck.allowed) {
        await supabase.auth.signOut();
        setSuspendedMsg(subCheck.message || null);
        setSuspendedShop(subCheck.shop);
        setLoading(false);
        setIsRenewalModalOpen(true);
        return;
      }

      // 3. Login allowed -> Route Super Admin to /sys-telemetry, others to /dashboard
      if (data?.session) {
        Swal.fire({
          icon: "success",
          title: subCheck.isSuperAdmin
            ? "Welcome, Super Admin"
            : "Welcome back.",
          text: subCheck.isSuperAdmin
            ? "Redirecting to Zen-Tech Telemetry Control Center..."
            : undefined,
          showConfirmButton: false,
          timer: 900,
        });
        setTimeout(() => {
          window.location.replace(subCheck.redirectUrl);
        }, 900);
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: error.message,
          confirmButtonColor: "#0d6efd",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Account Active",
          text: "You can now sign in to your workspace.",
          confirmButtonColor: "#0d6efd",
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Returning to /login ensures verifyStoreSubscription runs and routes Super Admin to /sys-telemetry
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Google Auth Failed",
        text: error.message,
        confirmButtonColor: "#0d6efd",
      });
      setLoading(false);
    }
  };

  const renewalAmount = suspendedShop?.last_invoice_amount || 4999;

  return (
    <div className="d-flex w-100 vh-100 overflow-hidden bg-white position-relative">
      {/* ================= B2B SUBSCRIPTION RENEWAL MODAL (RAZORPAY GATEWAY) ================= */}
      {isRenewalModalOpen && suspendedMsg && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center fade-in-anim"
          style={{
            backgroundColor: "rgba(10, 17, 40, 0.82)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg p-4 position-relative"
            style={{
              width: "92%",
              maxWidth: "460px",
              maxHeight: "92vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setIsRenewalModalOpen(false)}
              className="btn-close position-absolute top-0 end-0 m-3"
            ></button>

            <div className="text-center mb-3">
              <div
                className="rounded-circle bg-danger bg-opacity-10 text-danger d-flex justify-content-center align-items-center mx-auto mb-2 border border-danger border-opacity-25"
                style={{ width: "54px", height: "54px" }}
              >
                <FaShieldAlt size={24} />
              </div>
              <span className="badge bg-danger text-white rounded-pill px-3 py-1 mb-1">
                SUBSCRIPTION ENDED / STORE SUSPENDED
              </span>
              <h5 className="fw-bold text-dark mb-1">
                Renew Your Zen-Tech ERP License
              </h5>
              <p className="text-danger small fw-semibold mb-0 px-2">
                {suspendedMsg}
              </p>
            </div>

            {/* Store & Plan Summary */}
            <div className="bg-light p-3 rounded-3 border mb-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted fw-bold text-uppercase d-block">
                  Store Branch
                </small>
                <span className="fw-bold text-dark small">
                  {suspendedShop?.shop_name || "WashNora Store"} (
                  {suspendedShop?.shop_id || "SHOP-A"})
                </span>
              </div>
              <div className="text-end">
                <small className="text-muted fw-bold text-uppercase d-block">
                  Renewal Fee
                </small>
                <span className="fw-bolder text-primary fs-5">
                  ₹{renewalAmount}
                </span>
              </div>
            </div>

            {/* Action Buttons: Razorpay Payment Gateway + WhatsApp / Call Support */}
            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                onClick={handleInstantRazorpayRenewal}
                disabled={isPayingRenewal}
                className="btn btn-primary w-100 fw-bold py-2 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2"
              >
                <FaBolt className="text-warning" />
                <span>
                  {isPayingRenewal
                    ? "Opening Razorpay..."
                    : `Pay ₹${renewalAmount} via Razorpay`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppManualRenewal}
                className="btn btn-success w-100 fw-bold py-2 rounded-3 shadow-sm d-flex justify-content-center align-items-center gap-2"
              >
                <FaWhatsapp size={18} />
                <span>Renew on WhatsApp ({ZENTECH_DISPLAY_PHONE})</span>
              </button>

              <a
                href={`tel:${ZENTECH_DISPLAY_PHONE.replace(/\s+/g, "")}`}
                className="btn btn-outline-dark btn-sm w-100 fw-semibold py-2 rounded-3 mt-1 d-flex justify-content-center align-items-center gap-2"
              >
                <FaPhoneAlt className="text-primary" size={13} />
                <span>Call Zen-Tech Support: {ZENTECH_DISPLAY_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* LEFT PANEL: Edge-to-Edge Flexible Auth Form */}
      <div
        className="d-flex flex-column justify-content-center position-relative auth-panel slide-up-anim"
        style={{ flex: "1 1 40%", zIndex: 10 }}
      >
        <div
          className="w-100 px-4 px-md-5 mx-auto"
          style={{ maxWidth: "420px" }}
        >
          <div className="mb-4">
            <h2
              className="fw-bolder mb-1 tracking-tight text-brand-dark"
              style={{ letterSpacing: "-0.02em" }}
            >
              {isLogin ? "Sign In" : "Join Us"}
            </h2>
            <p className="small fw-medium text-brand-muted mb-0">
              {isLogin
                ? "Access your clean laundry workspace."
                : "Create an account to streamline operations."}
            </p>

            {/* Persistent Suspension Alert (Shown ONLY when subscription ended/suspended) */}
            {suspendedMsg && (
              <div className="alert alert-danger border-0 shadow-sm rounded-3 p-3 mt-3 mb-0">
                <div className="d-flex align-items-start gap-2 mb-2">
                  <FaExclamationTriangle className="text-danger mt-1 flex-shrink-0" />
                  <span className="small fw-semibold">{suspendedMsg}</span>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsRenewalModalOpen(true)}
                    className="btn btn-danger btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                  >
                    <FaBolt />
                    <span>Pay via Razorpay</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppManualRenewal}
                    className="btn btn-success btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                  >
                    <FaWhatsapp />
                    <span>{ZENTECH_DISPLAY_PHONE}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-100 btn-google-premium d-flex align-items-center justify-content-center gap-2 mb-4"
          >
            <FcGoogle size={20} />
            <span className="fw-bold text-brand-dark small">
              Continue with Google
            </span>
          </button>

          <div className="d-flex align-items-center mb-4 opacity-75">
            <hr className="flex-grow-1 border-primary opacity-25" />
            <span
              className="mx-3 fw-bold text-uppercase text-primary"
              style={{ letterSpacing: "1px", fontSize: "0.65rem" }}
            >
              Or use email
            </span>
            <hr className="flex-grow-1 border-primary opacity-25" />
          </div>

          <form onSubmit={handleEmailAuth} className="d-flex flex-column gap-3">
            {!isLogin && (
              <div className="position-relative input-group-premium">
                <input
                  type="text"
                  className="form-control shadow-none bg-transparent"
                  placeholder=" "
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  id="fullName"
                />
                <label
                  htmlFor="fullName"
                  className="floating-label fw-semibold"
                >
                  Full Name
                </label>
              </div>
            )}

            <div className="position-relative input-group-premium">
              <input
                type="email"
                className="form-control shadow-none bg-transparent"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                id="email"
              />
              <label htmlFor="email" className="floating-label fw-semibold">
                Email Address
              </label>
            </div>

            <div className="position-relative input-group-premium">
              <input
                type="password"
                className="form-control shadow-none bg-transparent"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                id="password"
              />
              <label htmlFor="password" className="floating-label fw-semibold">
                Password
              </label>
              {isLogin && (
                <a
                  href="#"
                  className="position-absolute end-0 top-50 translate-middle-y text-primary text-decoration-none fw-bold hover-opacity"
                  style={{ fontSize: "0.75rem" }}
                >
                  Forgot?
                </a>
              )}
            </div>

            <button
              type="submit"
              className="btn-blue-solid w-100 d-flex justify-content-center align-items-center mt-2 gap-2"
              disabled={loading}
            >
              <span className="fw-bold small">
                {loading
                  ? "Processing..."
                  : isLogin
                    ? "Access Workspace"
                    : "Create Account"}
              </span>
              {!loading && <FaArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setFullName("");
              }}
              className="bg-transparent border-0 p-0 text-primary fw-bold hover-opacity"
              style={{ fontSize: "0.8rem" }}
            >
              {isLogin
                ? "New to the platform? Create an account."
                : "Already have an account? Sign in."}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Fresh Laundry Blue/Water Visual with Bubbles */}
      <div
        className="d-none d-lg-flex position-relative align-items-center justify-content-center fade-in-anim laundry-bg"
        style={{ flex: "1 1 60%", padding: "2rem", overflow: "hidden" }}
      >
        {/* CSS Animated Bubbles */}
        <div className="bubbles-container">
          <div
            className="bubble"
            style={{
              left: "10%",
              animationDuration: "8s",
              width: "40px",
              height: "40px",
            }}
          ></div>
          <div
            className="bubble"
            style={{
              left: "25%",
              animationDuration: "12s",
              width: "20px",
              height: "20px",
              animationDelay: "2s",
            }}
          ></div>
          <div
            className="bubble"
            style={{
              left: "40%",
              animationDuration: "10s",
              width: "60px",
              height: "60px",
              animationDelay: "1s",
            }}
          ></div>
          <div
            className="bubble"
            style={{
              left: "60%",
              animationDuration: "15s",
              width: "30px",
              height: "30px",
              animationDelay: "4s",
            }}
          ></div>
          <div
            className="bubble"
            style={{
              left: "75%",
              animationDuration: "9s",
              width: "50px",
              height: "50px",
              animationDelay: "3s",
            }}
          ></div>
          <div
            className="bubble"
            style={{
              left: "85%",
              animationDuration: "11s",
              width: "25px",
              height: "25px",
              animationDelay: "5s",
            }}
          ></div>
        </div>

        {/* Abstract Wave Shapes */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="position-absolute bg-white rounded-circle opacity-10"
            style={{
              width: "600px",
              height: "600px",
              top: "-100px",
              right: "-100px",
              filter: "blur(60px)",
            }}
          ></div>
          <div
            className="position-absolute bg-info rounded-circle opacity-25"
            style={{
              width: "400px",
              height: "400px",
              bottom: "-50px",
              left: "-100px",
              filter: "blur(80px)",
            }}
          ></div>
        </div>

        {/* Floating Logo Size Adjusted to 75% */}
        <div className="position-relative z-2 d-flex justify-content-center align-items-center w-100">
          <img
            src="/logo.png"
            alt="WashNora Logo"
            className="img-fluid"
            style={{
              width: "75%",
              maxWidth: "400px",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.2))",
            }}
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* COLOR PALETTE VARIABLES */
        :root {
          --brand-primary: #0d6efd;
          --brand-primary-hover: #0b5ed7;
          --brand-dark: #0f172a;
          --brand-muted: #64748b;
          --brand-light: #f0f9ff;
        }

        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #ffffff; }
        
        .auth-panel { background: #ffffff; }
        .text-brand-dark { color: var(--brand-dark) !important; }
        .text-brand-muted { color: var(--brand-muted) !important; }

        /* Compact Minimalist Input Styling */
        .input-group-premium input {
          border: none !important;
          border-bottom: 2px solid #cbd5e1 !important;
          border-radius: 0 !important;
          padding: 1.25rem 0 0.35rem 0 !important;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--brand-dark);
          transition: border-color 0.3s ease;
        }
        
        .input-group-premium input:focus {
          border-bottom: 2px solid var(--brand-primary) !important;
          box-shadow: none !important;
        }

        /* Floating Label Logic */
        .floating-label {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.9rem;
          color: var(--brand-muted);
        }
        
        .input-group-premium input:focus ~ .floating-label,
        .input-group-premium input:not(:placeholder-shown) ~ .floating-label {
          top: 0;
          font-size: 0.7rem;
          color: var(--brand-primary) !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Compact Blue Theme Button */
        .btn-blue-solid {
          background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 0.9rem 1.2rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .btn-blue-solid:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
        }
        .btn-blue-solid:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-blue-solid:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-google-premium {
          background: #ffffff;
          border: 2px solid var(--brand-light);
          border-radius: 12px;
          padding: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-google-premium:hover {
          border-color: #bae6fd;
          background: var(--brand-light);
          transform: translateY(-2px);
          box-shadow: 0 8px 15px -8px rgba(13, 110, 253, 0.15);
        }

        .hover-opacity { transition: opacity 0.2s ease; opacity: 0.8; }
        .hover-opacity:hover { opacity: 1; }

        /* RIGHT PANEL: Laundry Theme Background */
        .laundry-bg {
          background: linear-gradient(135deg, #38bdf8 0%, #1d4ed8 100%);
        }

        /* Bubbles Animation */
        .bubbles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .bubble {
          position: absolute;
          bottom: -100px;
          background-color: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
        }

        /* General Animations */
        .slide-up-anim { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-in-anim { animation: fadeIn 0.35s ease forwards; }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `,
        }}
      />
    </div>
  );
}
