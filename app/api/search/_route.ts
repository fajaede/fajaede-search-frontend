import { NextRequest, NextResponse } from "next/server";

const MEILI_HOST = process.env.MEILI_HOST!;
const MEILI_SEARCH_KEY = process.env.MEILI_SEARCH_KEY!;
const MEILI_INDEX = process.env.MEILI_INDEX || "pages";

/**
 * Perform a Meilisearch request with timeout, flag, and response validation.
 */
async function performSearch(q: string, limit: number) {
  // Validate required environment variables
  if (!MEILI_HOST) {
    console.error('MEILI_HOST is not configured');
    return NextResponse.json({ error: 'Search service not configured' }, { status: 500 });
  }
  if (!MEILI_SEARCH_KEY) {
    console.error('MEILI_SEARCH_KEY is not configured');
    return NextResponse.json({ error: 'Search service not configured' }, { status: 500 });
  }
  // Skip Meilisearch during static generation if the flag is set.
  const disableMeili = process.env.MEILI_DISABLE_ON_BUILD === "true";
  if (disableMeili) {
    console.log("MEILI_DISABLE_ON_BUILD is true – skipping Meilisearch search.");
    return NextResponse.json({ error: "Meili disabled in build" }, { status: 503 });
  }
  // ... rest of function unchanged


  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  let res: Response;
  try {
    res = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_SEARCH_KEY}`,
      },
      body: JSON.stringify({ q, limit }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err) {
    console.error("Search fetch error:", err);
    clearTimeout(timeoutId);
    return NextResponse.json({ error: "Search request failed", message: String(err) }, { status: 502 });
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    const errText = await res.text();
    console.error("Search proxy error:", errText);
    return NextResponse.json({ error: "Search failed", details: errText }, { status: res.status });
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const txt = await res.text();
    console.error("Search proxy returned non‑JSON:", txt);
    return NextResponse.json({ error: "Invalid response format", raw: txt }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const limitStr = searchParams.get("limit");
  const limit = limitStr ? parseInt(limitStr, 10) : 10;

  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }
  return performSearch(q, limit);
}

export async function POST(req: NextRequest) {
  try {
    const { q, limit = 10 } = await req.json();
    if (!q || typeof q !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const limitNum = typeof limit === "number" ? limit : parseInt(limit as any, 10) || 10;
    return performSearch(q, limitNum);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search request failed" }, { status: 500 });
  }
}
