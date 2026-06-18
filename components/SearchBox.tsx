"use client";

import { useState } from "react";

type Hit = {
  id?: string;
  title?: string;
  url?: string;
  summary?: string;
  content?: string;
  source?: string;
  language?: string;
  country?: string;
  category?: string;
};

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSummary, setAiSummary] = useState("");

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setAiSummary(""); // Wis de vorige samenvatting bij een nieuwe zoekopdracht
    setHits([]); // Wis ook de vorige resultaten voor een schone start

    try {
      // De Python API verwacht een GET request met query parameters
      const params = new URLSearchParams({ q, limit: '10' });
      const res = await fetch(`/api/search?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Search failed");
      }

      setHits(data.results || []);
      setAiSummary(data.ai || ""); // Sla de AI-samenvatting op in de state
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", position: "relative" }}>
        <div style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#64748b", display: "flex" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Doorzoek de Europese index en AI-inzichten..."
          style={{
            flex: 1,
            padding: "16px 20px 16px 48px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            fontSize: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            outline: "none",
            transition: "all 0.2s ease"
          }}
          onFocus={(e) => e.target.style.boxShadow = "0 0 0 3px rgba(15, 23, 42, 0.05)"}
          onBlur={(e) => e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)"}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: "0 32px",
            borderRadius: "16px",
            border: "none",
            background: loading ? "#94a3b8" : "#0f172a",
            color: "white",
            fontWeight: 500,
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s ease"
          }}
        >
          {loading ? "Zoeken..." : "Zoeken"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#b42318", marginBottom: 16 }}>{error}</p>
      )}

      {/* Toon de AI samenvatting als die bestaat en we niet aan het laden zijn */}
      {!loading && aiSummary && (
        <div
          style={{
            padding: "24px",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            background: "linear-gradient(145deg, #f8fafc, #eff6ff)",
            marginBottom: "32px",
            boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Fajaede Intelligence Layer
            </h3>
          </div>
          <p style={{ margin: 0, color: "#334155", lineHeight: 1.7, fontSize: "15.5px" }}>{aiSummary}</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {hits.map((hit, i) => (
          <article
            key={hit.id || hit.url || i}
            style={{
              padding: "20px",
              border: "1px solid #f1f5f9",
              borderRadius: "16px",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              transition: "box-shadow 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)"}
          >
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px", fontWeight: 500 }}>
              {[hit.source, hit.language, hit.country, hit.category]
                .filter(Boolean)
                .join(" · ")}
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 600 }}>
              <a
                href={hit.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0f172a", textDecoration: "none" }}
              >
                {hit.title || hit.url || "Ongetiteld resultaat"}
              </a>
            </h3>

            <p style={{ margin: 0, color: "#475569", lineHeight: 1.6, fontSize: "15px" }}>
              {hit.summary ||
                hit.content?.slice(0, 260) ||
                "Geen snippet beschikbaar."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}