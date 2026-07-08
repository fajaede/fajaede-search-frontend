import { NextRequest, NextResponse } from "next/server";

const MEILI_HOST = process.env.MEILI_HOST!;
const MEILI_SEARCH_KEY = process.env.MEILI_SEARCH_KEY!;
const MEILI_INDEX = process.env.MEILI_INDEX || "pages";

/**
 * Handles search requests. Supports both GET (query parameters) and POST (JSON body).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const limit = Number(searchParams.get("limit")) || 10;

    if (!q) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const res = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_SEARCH_KEY}`,
      },
      body: JSON.stringify({ q, limit }),
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Search API GET error:", error);
    return NextResponse.json({ error: "Search request failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { q, limit = 10 } = await req.json();
    if (!q || typeof q !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const res = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_SEARCH_KEY}`,
      },
      body: JSON.stringify({ q, limit }),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Search API POST error:", error);
    return NextResponse.json({ error: "Search request failed" }, { status: 500 });
  }
}
