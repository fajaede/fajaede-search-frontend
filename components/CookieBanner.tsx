"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given.
    // We check on the client-side only.
    if (!localStorage.getItem("cookie_consent")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (consent: boolean) => {
    // For now, we just store that a choice has been made.
    // In the future, you could store 'true' or 'false' and act on it.
    localStorage.setItem("cookie_consent", consent ? "accepted" : "rejected");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20px",
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
        maxWidth: "500px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "#1e293b", fontWeight: 600 }}>
        Deze website gebruikt cookies
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#475569", lineHeight: 1.6 }}>
        Wij gebruiken cookies om de basisfunctionaliteit van de site te waarborgen en uw online ervaring te verbeteren. Voor meer details, zie ons{" "}
        <Link href="/cookie-policy" style={{ color: "#0f172a", textDecoration: "underline" }}>
          cookiebeleid
        </Link>.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => handleConsent(true)}
          style={{
            flex: 1,
            padding: "10px 20px",
            borderRadius: "12px",
            border: "none",
            background: "#0f172a",
            color: "white",
            fontWeight: 500,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Accepteren
        </button>
        <button
          onClick={() => handleConsent(false)}
          style={{
            flex: 1,
            padding: "10px 20px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#334155",
            fontWeight: 500,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Weigeren
        </button>
      </div>
    </div>
  );
}