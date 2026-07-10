// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = "http://116.203.39.166:18000";

/**
 * Deze functie fungeert als een robuuste proxy naar de FastAPI backend.
 * Het vangt verzoeken op die naar /api/search komen en stuurt ze door.
 * Dit is betrouwbaarder dan `next.config.js` rewrites in de dev-modus.
 */
async function proxyRequest(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const backendUrl = `${BACKEND_URL}/search?${searchParams.toString()}`;

  console.log(`Proxying search request to: ${backendUrl}`);

  try {
    // Stuur het verzoek door naar de backend.
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Belangrijk: cache 'no-store' om te zorgen dat we altijd verse resultaten krijgen.
      cache: 'no-store',
    });

    // Lees de response body als tekst.
    const body = await res.text();

    // Controleer of de backend een succesvolle response gaf.
    if (!res.ok) {
      console.error(`Backend error (${res.status}):`, body);
      // Probeer de foutmelding van de backend door te geven.
      try {
        const errorJson = JSON.parse(body);
        return NextResponse.json(errorJson, { status: res.status });
      } catch {
        // Als de body geen JSON is, stuur de ruwe tekst terug.
        return new NextResponse(body, { status: res.status });
      }
    }

    // Probeer de body te parsen als JSON.
    try {
      const data = JSON.parse(body);
      return NextResponse.json(data);
    } catch {
      console.error("Failed to parse JSON from backend:", body);
      return NextResponse.json(
        { detail: "Backend gaf een ongeldig antwoord." },
        { status: 502 } // 502 Bad Gateway
      );
    }

  } catch (error) {
    // Vang netwerkfouten op (bijv. als de backend niet draait).
    console.error("Network error during proxy:", error);
    const message = error instanceof Error ? error.message : "Onbekende netwerkfout";
    return NextResponse.json(
      { detail: `Kon niet verbinden met de backend service: ${message}` },
      { status: 503 } // 503 Service Unavailable
    );
  }
}

// Exporteer de proxy functie voor zowel GET als POST requests.
export const GET = proxyRequest;
export const POST = proxyRequest;