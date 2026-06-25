import { NextRequest, NextResponse } from "next/server";

const MEILI_HOST = process.env.MEILI_HOST!;
const MEILI_SEARCH_KEY = process.env.MEILI_SEARCH_KEY!;
const MEILI_INDEX = process.env.MEILI_INDEX || "pages";

export async function POST(req: NextRequest) {
  try {
    const { q, limit = 10 } = await req.json();

    if (!q || typeof q !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // Respect build-time flag to skip Meili during static generation
    const disableMeili = process.env.MEILI_DISABLE_ON_BUILD === "true";
    if (disableMeili) {
      console.log("MEILI_DISABLE_ON_BUILD is true – skipping Meilisearch search.");
      return NextResponse.json({ error: "Meili disabled in build" }, { status: 503 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_SEARCH_KEY}`,
      },
      body: JSON.stringify({ q, limit }),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Handle non‑OK responses
    if (!res.ok) {
      const errText = await res.text();
      console.error("Search proxy error:", errText);
      return NextResponse.json({ error: "Search failed", details: errText }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      console.error("Search proxy returned non‑JSON:", text);
      return NextResponse.json({ error: "Invalid response format", raw: text }, { status: 502 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search request failed" }, { status: 500 });
  }
}
