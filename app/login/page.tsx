"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/dashboard";
      }
    };
    checkSession();
  }, []);

  const handleEmailAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Authentication Failed",
          text: error.message,
          confirmButtonColor: "#0d6efd",
        });
        setLoading(false);
        return;
      }

      if (data?.session) {
        Swal.fire({
          icon: "success",
          title: "Welcome back.",
          showConfirmButton: false,
          timer: 1000,
        });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
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
        redirectTo: `${window.location.origin}/auth/callback`,
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

  return (
    <div className="d-flex w-100 vh-100 overflow-hidden bg-white">
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
                    ? "Access Dashboard"
                    : "Create Account"}
              </span>
              {!loading && (
                <i
                  className="bi bi-arrow-right"
                  style={{ fontSize: "16px" }}
                ></i>
              )}
            </button>
          </form>

          <div className="mt-4 text-start">
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
        .fade-in-anim { animation: fadeIn 1s ease forwards; }
        
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
