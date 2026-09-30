"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient"; // Fixed relative import path

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
      } else {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            router.replace("/dashboard");
          }
        });

        const timer = setTimeout(() => {
          if (!session) {
            router.replace("/login");
          }
        }, 3000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    };

    handleAuthSession();
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
