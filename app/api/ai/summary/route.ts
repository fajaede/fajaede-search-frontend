// app/api/ai/summary/route.ts
import { NextRequest, NextResponse } from "next/server";

// ---- REQUIRED ENVIRONMENT VARIABLES -------------------------------------------------
const MEILI_HOST = process.env.MEILI_HOST;
const MEILI_SEARCH_KEY = process.env.MEILI_SEARCH_KEY;
const MEILI_INDEX = process.env.MEILI_INDEX || "pages";



// Gebruik hier expliciet localhost, want we weten dat dat werkt
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3:mini";

export async function POST(req: NextRequest) {
  try {
    const { q, limit = 5, conversationId } = await req.json();

if (!MEILI_HOST || !MEILI_SEARCH_KEY) {
  console.error("Missing required MEILI environment variables");
  return NextResponse.json(
    { error: "Server mis-configuration: MEILI_HOST / MEILI_SEARCH_KEY missing" },
    { status: 500 }
  );
}

    if (!q || typeof q !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // 1. Zoek in Meilisearch
    const searchRes = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_SEARCH_KEY}`,
      },
      body: JSON.stringify({ q, limit }),
      cache: "no-store",
    });

    if (!searchRes.ok) {
      const text = await searchRes.text();
      console.error("Meili error:", text);
      return NextResponse.json(
        { error: "Search failed", message: text },
        { status: 500 },
      );
    }

    const searchData = await searchRes.json();
    const hits = (searchData.hits || []) as any[];

    const docsText = hits
      .map((h: any, i: number) => {
        return `Resultaat ${i + 1}:
Titel: ${h.title ?? ""}
Samenvatting: ${h.summary ?? h.content?.slice(0, 300) ?? ""}
URL: ${h.url ?? ""}`;
      })
      .join("\n\n");

    const historyText = conversationId
      ? `Eerdere conversatie ID: ${conversationId}.`
      : "Geen eerdere conversatie.";

    const systemPrompt = `
Je bent een Nederlandse AI-assistent bovenop een Europese zoekmachine.
Je taak:
- Geef een korte, duidelijke samenvatting (max. 4 zinnen) op basis van de zoekresultaten.
- Schrijf informeel maar professioneel.
- Verwijs naar titels of thema's uit de resultaten als dat helpt.
- Eindig ALTIJD met één expliciete vervolgvraag in het Nederlands, bijvoorbeeld:
  - "Wat wil je nog meer vragen of weten?"
  - "Waar wil je nu dieper op ingaan?"
Gebruik de context van de eerdere conversatie als die er is.
`.trim();

    const userPrompt = `
Eerdere conversatie:
${historyText}

Nieuwe zoekopdracht: "${q}"

Relevante zoekresultaten:
${docsText}

Maak nu:
1) Een korte samenvatting in maximaal 4 zinnen.
2) Sluit af met één duidelijke vervolgvraag in het Nederlands.
`.trim();

    // 2. Call naar Ollama with network error handling
    let llmRes: Response;
    try {
      llmRes = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: false,
        }),
      });
    } catch (err) {
      console.error("LLM request failed (network):", err);
      return NextResponse.json({ error: "LLM request failed", message: String(err) }, { status: 500 });
    }

    if (!llmRes.ok) {
      const text = await llmRes.text();
      console.error("LLM error:", text);
      return NextResponse.json({ error: "LLM request failed", message: text }, { status: 500 });
    }

    // Verify content type before parsing JSON
    const llmContentType = llmRes.headers.get("content-type") || "";
    let llmJson: any;
    if (llmContentType.includes("application/json")) {
      llmJson = await llmRes.json();
    } else {
      const text = await llmRes.text();
      console.error("LLM returned non‑JSON response:", text);
      return NextResponse.json({ error: "LLM response not JSON", raw: text }, { status: 502 });
    }

    // Ollama chat-response: message.content bevat de tekst
    const fullText: string =
      llmJson.message?.content ||
      llmJson.choices?.[0]?.message?.content ||
      "";

    if (!fullText) {
      console.error("Empty LLM response:", llmJson);
      return NextResponse.json(
        { error: "Empty LLM response" },
        { status: 500 },
      );
    }

    // 3. Samenvatting en vraag uit elkaar trekken
    const lastQuestionMatch = fullText.lastIndexOf("?");
    let summary = fullText.trim();
    let followUpQuestion = "Wat wil je nog meer vragen of weten?";

    if (lastQuestionMatch !== -1) {
      const upToQuestion = fullText.slice(0, lastQuestionMatch + 1).trim();
      const parts = upToQuestion.split(/(?<=\?)\s+/);
      if (parts.length > 1) {
        followUpQuestion = parts[parts.length - 1].trim();
        summary = parts.slice(0, -1).join(" ").trim();
      } else {
        summary = upToQuestion;
      }
    }

    const newConversationId = conversationId || crypto.randomUUID();

    return NextResponse.json(
      {
        summary,
        followUpQuestion,
        conversationId: newConversationId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("AI summary API error (server-side):", error);
    return NextResponse.json(
      { error: "AI summary request failed" },
      { status: 500 },
    );
  }
}