// app/api/builder/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Pas de URL aan als je FastAPI elders draait
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error('BACKEND_URL is not set in the environment variables.');
    }

    const res = await fetch(`${backendUrl}/api/builder/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? 'Builder API error' },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('Builder proxy error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}