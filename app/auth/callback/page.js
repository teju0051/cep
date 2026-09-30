"use client";

import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleDirectTokenInjection = () => {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace("#", "?"));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const expires_at = params.get("expires_at");

        if (access_token && refresh_token) {
          // Construct the standard Supabase session storage object layout
          const supabaseStorageKey = `sb-ooxgzjwtsxepzqtgfcjn-auth-token`;

          const sessionData = {
            access_token,
            refresh_token,
            expires_at: expires_at
              ? Number(expires_at)
              : Math.floor(Date.now() / 1000) + 3600,
            token_type: "bearer",
            user: null, // Will be fetched lazily by the client on the dashboard
          };

          // Manually save to local storage so Supabase detects it instantly on the next page
          try {
            localStorage.setItem(
              supabaseStorageKey,
              JSON.stringify(sessionData),
            );
          } catch (e) {
            console.error("Storage error", e);
          }

          // Hard redirect to dashboard immediately via window.location to force a full reload with the session active
          window.location.href = "/dashboard";
          return;
        }
      }

      // Fallback if no hash tokens are present
      window.location.href = "/login";
    };

    handleDirectTokenInjection();
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
        Please wait while we set up your session.
      </p>
    </div>
  );
}
