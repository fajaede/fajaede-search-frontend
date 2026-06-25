// app/api/builder/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Pas de URL aan als je FastAPI elders draait
    const backendUrl = process.env.BACKEND_URL || 'http://116.203.39.166:18000';
    const res = await fetch(`${backendUrl}/api/builder/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Verify response is OK and JSON
    if (!res.ok) {
      // Try to read error text for debugging
      const errText = await res.text();
      console.error('Builder proxy error (non‑OK):', errText);
      return NextResponse.json({ error: 'Builder API error', details: errText }, { status: res.status });
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const txt = await res.text();
      console.error('Builder proxy returned non‑JSON:', txt);
      return NextResponse.json({ error: 'Invalid response format', raw: txt }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Builder proxy error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Internal error' },
      { status: 500 },
    );
  }
}