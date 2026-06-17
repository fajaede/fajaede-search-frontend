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
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search request failed" }, { status: 500 });
  }
}
