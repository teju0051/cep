"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // Dynamically load Bootstrap JS only on the client side
    import("bootstrap/dist/js/bootstrap.bundle.min.js" as any);
  }, []);

  return null;
}
