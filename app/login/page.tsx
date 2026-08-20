"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Swal.fire("Login Failed", error.message, "error");
        setLoading(false);
        return;
      }

      if (data?.session) {
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          showConfirmButton: false,
          timer: 800,
        });
        // Force hard navigation to ensure cookies sync properly and avoid getting stuck
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        Swal.fire("Registration Failed", error.message, "error");
      } else {
        Swal.fire("Account Created!", "You can now sign in.", "success");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex w-100 min-vh-100 align-items-center justify-content-center p-3"
      style={{ backgroundColor: "#f0f4f8" }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-row w-100"
        style={{
          maxWidth: "900px",
          minHeight: "500px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Left Side: Form */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center p-4 p-md-5 bg-white">
          <h2 className="fw-bold text-dark mb-1">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-secondary small mb-4">
            {isLogin
              ? "Sign in to access your dashboard."
              : "Register a new account."}
          </p>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control bg-light border-0 py-2"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control bg-light border-0 py-2"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
            </button>
          </form>

          <div className="text-center mt-3">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="btn btn-link text-primary text-decoration-none small fw-bold"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Right Side: Branding */}
        <div
          className="col-md-6 d-none d-md-flex flex-column justify-content-center p-5 text-white"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          }}
        >
          <h3 className="fw-bold mb-2">
            <i className="bi bi-droplet-half me-2"></i>MyDhobhiGhat
          </h3>
          <p className="text-white-50 small mb-0">
            Streamline your laundry workflow, orders, and business operations
            effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
}
