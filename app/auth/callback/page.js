"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthHash = async () => {
      const hash = window.location.hash;

      // If the URL contains the access token hash from Supabase/Google
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace("#", "?"));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          // Explicitly set the session using the tokens parsed from the URL
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (!error) {
            router.replace("/dashboard");
            return;
          }
        }
      }

      // Fallback: check if session already exists natively
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        // If all else fails, bounce back to login
        router.replace("/login");
      }
    };

    handleAuthHash();
  }, [router]);

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