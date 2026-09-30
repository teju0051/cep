"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hash = window.location.hash;

      // 1. Handle PKCE Flow (Authorization Code in query parameters)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.location.href = "/dashboard";
          return;
        }
        console.error("Code exchange error:", error.message);
      }

      // 2. Handle Implicit Grant Flow (Tokens in URL hash fragment)
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace("#", "?"));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error) {
            window.location.href = "/dashboard";
            return;
          }
          console.error("Session set error:", error.message);
        }
      }

      // 3. Fallback: Check if an active session already exists in storage/cookies
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/dashboard";
        return;
      }

      // If all verification methods fail, redirect to login with error
      window.location.href = "/login?error=auth_failed";
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <div
        className="spinner-border text-primary mb-3"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <h4 className="fw-bold text-dark">Completing your login...</h4>
      <p className="text-secondary">
        Please wait while we set up your secure workspace session.
      </p>
    </div>
  );
}
