"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check for PKCE authorization code in query params (?code=...)
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace("/dashboard");
          return;
        }
      }

      // 2. Fallback: Check if session is already active or available via hash
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        // Give it one brief moment to catch up if running async state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            router.replace("/dashboard");
          }
        });

        // Safety fallback timer
        const timer = setTimeout(() => {
          router.replace("/login");
        }, 3000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    };

    handleAuth();
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
