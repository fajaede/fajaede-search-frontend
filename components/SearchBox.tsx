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

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    setError("");

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
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Zoek naar ECB, rijksoverheid, privacy..."
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid #d0d7de",
            fontSize: 16,
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: "14px 20px",
            borderRadius: 12,
            border: "none",
            background: "#01696f",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Zoeken..." : "Zoeken"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#b42318", marginBottom: 16 }}>{error}</p>
      )}

      <div style={{ display: "grid", gap: 16 }}>
        {hits.map((hit, i) => (
          <article
            key={hit.id || hit.url || i}
            style={{
              padding: 18,
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              {[hit.source, hit.language, hit.country, hit.category]
                .filter(Boolean)
                .join(" · ")}
            </div>

            <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>
              <a
                href={hit.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#01696f", textDecoration: "none" }}
              >
                {hit.title || hit.url || "Ongetiteld resultaat"}
              </a>
            </h3>

            <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
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