"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
  image_url?: string;
  video_url?: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Conversatiegeschiedenis voor Fajaede Intelligence Layer
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [followUpQuery, setFollowUpQuery] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Tab beheer voor Afbeeldingen, Video's, Nieuws & Financieel
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos" | "news" | "finance">("all");

  // Ref en effect voor automatisch scrollen binnen de chatbox (zonder de hele pagina te verschuiven)
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [chatHistory, followUpLoading]);

  // Algemene zoekfunctie die tabs en categorieën ondersteunt
  async function performSearch(searchQuery: string, tab: "all" | "images" | "videos" | "news" | "finance", historyList: Message[] = []) {
    setLoading(true);
    setError("");
    
    try {
      const params = new URLSearchParams({ 
        q: searchQuery, 
        limit: '12' 
      });

      // Stuur de juiste categorie mee naar de backend voor Nieuws of Financieel
      if (tab === "news") {
        params.append("category", "news");
      } else if (tab === "finance") {
        params.append("category", "finance");
      }

      if (historyList.length > 0) {
        params.append("history", JSON.stringify(historyList.slice(-5)));
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Search failed");

      setHits(data.results || []);
      const newAi = data.ai || "";
      setAiSummary(newAi);

      if (newAi) {
        if (historyList.length === 0) {
          setChatHistory([{ role: "assistant", content: newAi }]);
        } else {
          setChatHistory([...historyList, { role: "assistant", content: newAi }]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    
    setLoading(true);
    setError("");
    setAiSummary("");
    setHits([]);
    setHasSearched(true);
    setChatHistory([]); // Reset chatgeschiedenis
    setActiveTab("all"); // Reset tab naar 'Alle'

    await performSearch(q, "all");
  }

  async function handleFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!followUpQuery.trim() || followUpLoading) return;

    setFollowUpLoading(true);
    setError("");

    const userMsg: Message = { role: "user", content: followUpQuery };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    
    const currentQuery = followUpQuery;
    setFollowUpQuery("");

    try {
      // Stuur de laatste 5 berichten mee als context
      const historyParam = JSON.stringify(updatedHistory.slice(-5));
      const params = new URLSearchParams({
        q: currentQuery,
        limit: '12',
        history: historyParam,
      });

      // Filteren op categorie indien we in Nieuws of Financieel tab zitten
      if (activeTab === "news") {
        params.append("category", "news");
      } else if (activeTab === "finance") {
        params.append("category", "finance");
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Follow-up failed");

      setHits(data.results || []);
      const newAi = data.ai || "";
      setChatHistory(prev => [...prev, { role: "assistant", content: newAi }]);
      setAiSummary(newAi);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFollowUpLoading(false);
    }
  }

  async function handleTabClick(tab: "all" | "images" | "videos" | "news" | "finance") {
    setActiveTab(tab);
    if (q.trim()) {
      // Als we veranderen van tab, herladen we de resultaten voor de tabs die backend filters hebben
      if (tab === "news" || tab === "finance" || tab === "all") {
        await performSearch(q, tab);
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center text-center">
        {/* Logo / Header */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-slate-800 mb-6 tracking-tight">
          fajaede<span className="text-orange-500">AI+</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl font-medium">
          De onafhankelijke Europese zoekmachine. Veilig, neutraal en zonder profilering of tracking het web doorzoeken.
        </p>

        {/* Zoekbalk */}
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-3xl flex items-center bg-white rounded-full shadow-lg border border-slate-200 p-2 mb-8 focus-within:ring-2 focus-within:ring-orange-500 transition-all hover:shadow-xl"
        >
          <input
            type="text"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek met fajaedeAI+..."
            className="w-full px-6 py-4 rounded-full focus:outline-none text-xl text-slate-700 bg-transparent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-800 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-700 transition-colors shadow-sm text-lg disabled:bg-slate-400"
          >
            {loading ? "Laden..." : "Zoeken"}
          </button>
        </form>

        {error && <p className="text-red-600 mb-6">{error}</p>}

        {/* Categorie Tabs (Direct onder de zoekbalk) */}
        {hasSearched && (
          <div className="w-full max-w-3xl flex justify-start gap-4 md:gap-6 border-b border-slate-200 pb-0 mb-6 text-sm font-semibold text-slate-500 overflow-x-auto">
            <button 
              onClick={() => handleTabClick("all")}
              className={`hover:text-orange-500 transition-colors pb-3 -mb-[2px] border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "all" ? "text-orange-500 border-orange-500 font-bold" : "border-transparent text-slate-500"
              }`}
            >
              🔍 Alle
            </button>
            <button 
              onClick={() => handleTabClick("images")}
              className={`hover:text-orange-500 transition-colors pb-3 -mb-[2px] border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "images" ? "text-orange-500 border-orange-500 font-bold" : "border-transparent text-slate-500"
              }`}
            >
              🖼️ Afbeeldingen
            </button>
            <button 
              onClick={() => handleTabClick("videos")}
              className={`hover:text-orange-500 transition-colors pb-3 -mb-[2px] border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "videos" ? "text-orange-500 border-orange-500 font-bold" : "border-transparent text-slate-500"
              }`}
            >
              🎥 Video's
            </button>
            <button 
              onClick={() => handleTabClick("news")}
              className={`hover:text-orange-500 transition-colors pb-3 -mb-[2px] border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "news" ? "text-orange-500 border-orange-500 font-bold" : "border-transparent text-slate-500"
              }`}
            >
              📰 Nieuws
            </button>
            <button 
              onClick={() => handleTabClick("finance")}
              className={`hover:text-orange-500 transition-colors pb-3 -mb-[2px] border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "finance" ? "text-orange-500 border-orange-500 font-bold" : "border-transparent text-slate-500"
              }`}
            >
              💼 Financieel
            </button>
          </div>
        )}

        {hasSearched ? (
          <div className="w-full max-w-3xl text-left mb-12 flex flex-col gap-6">
            {!loading && chatHistory.length > 0 && (
              <div className="p-6 border border-slate-200 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <h3 className="m-0 text-sm font-bold text-slate-800 tracking-wide uppercase">
                    Fajaede Intelligence Layer
                  </h3>
                </div>

                {/* Chat Geschiedenis */}
                <div ref={chatContainerRef} className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        {msg.role === "user" ? "Jij" : "fajaedeAI+"}
                      </span>
                      <div 
                        className={`p-4 rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                          msg.role === "user" 
                            ? "bg-slate-800 text-white rounded-tr-none" 
                            : "bg-white border border-slate-150 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  
                  {followUpLoading && (
                    <div className="flex flex-col items-start self-start max-w-[85%]">
                      <span className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        fajaedeAI+
                      </span>
                      <div className="p-4 rounded-2xl text-slate-500 text-sm bg-white/50 border border-dashed border-slate-200 rounded-tl-none animate-pulse">
                        Aan het typen...
                      </div>
                    </div>
                  )}
                </div>

                {/* Vervolgvraag Invoerveld */}
                <div className="pt-2 border-t border-slate-200/60 mt-2">
                  <span className="text-sm font-bold text-slate-700 block mb-2">
                    Wat is je volgende vraag?
                  </span>
                  <form onSubmit={handleFollowUp} className="flex gap-2">
                    <input
                      type="text"
                      value={followUpQuery}
                      onChange={(e) => setFollowUpQuery(e.target.value)}
                      placeholder="Stel een vervolgvraag of vraag om verduidelijking..."
                      className="flex-1 px-5 py-3 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 shadow-sm text-sm"
                      disabled={followUpLoading}
                      required
                    />
                    <button
                      type="submit"
                      disabled={followUpLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-colors shadow-sm text-sm disabled:bg-slate-400"
                    >
                      {followUpLoading ? "Laden..." : "Stuur"}
                    </button>
                  </form>
                </div>

                {/* Footer met disclaimer en feedback-acties */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium mt-1">
                  <div>
                    AI kan fouten maken, controleer dus de reacties.
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Delen op FB */}
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Deel op Facebook"
                      className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100/80 cursor-pointer flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>

                    {/* Delen op X */}
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent("Bekijk deze AI zoekresultaten op fajaedeAI+!")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Deel op X"
                      className="hover:text-black transition-colors p-1 rounded hover:bg-slate-100/80 cursor-pointer flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                      </svg>
                    </a>

                    {/* Delen op WhatsApp */}
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Bekijk deze AI zoekresultaten op fajaedeAI+: " + (typeof window !== "undefined" ? window.location.href : ""))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Deel via WhatsApp"
                      className="hover:text-green-500 transition-colors p-1 rounded hover:bg-slate-100/80 cursor-pointer flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                    </a>

                    {/* Kopieer Link (Ketting-icoon) */}
                    <button 
                      title="Kopieer link" 
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link gekopieerd naar klembord!");
                        }
                      }}
                      className="hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100/80 cursor-pointer flex items-center justify-center"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                    </button>

                    {/* Visuele Scheider */}
                    <span className="h-4 w-[1px] bg-slate-200" />

                    {/* Duim Omhoog (Thumbs Up) */}
                    <button 
                      title="Nuttig"
                      onClick={() => alert("Bedankt voor je positieve feedback!")}
                      className="hover:text-green-600 transition-colors p-1 rounded hover:bg-slate-100/80 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                    </button>

                    {/* Duim Omlaag (Thumbs Down) */}
                    <button 
                      title="Niet nuttig"
                      onClick={() => alert("Bedankt voor je feedback! We gaan hiermee aan de slag om de reacties te verbeteren.")}
                      className="hover:text-red-600 transition-colors p-1 rounded hover:bg-slate-100/80 cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Tekstuele resultaten (Alle / Nieuws / Financieel) */}
            {(activeTab === "all" || activeTab === "news" || activeTab === "finance") && (
              <div className="flex flex-col gap-4">
                {hits.map((hit, i) => (
                  <article key={hit.id || i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="text-xs text-slate-500 mb-2 font-medium">
                      {[hit.source, hit.language, hit.country, hit.category].filter(Boolean).join(" · ")}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href={hit.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        {hit.title || hit.url || "Ongetiteld resultaat"}
                      </a>
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {hit.summary || (hit.content ? hit.content.slice(0, 260) + "..." : "Geen snippet beschikbaar.")}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {/* Afbeeldingen Resultaten Grid */}
            {activeTab === "images" && (() => {
              const imageHits = hits.filter(hit => hit.image_url);
              if (imageHits.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-500 bg-white rounded-3xl border border-slate-200 p-6">
                    Geen afbeeldingen gevonden voor deze zoekopdracht.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                  {imageHits.map((hit, i) => (
                    <div key={hit.id || i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img 
                          src={hit.image_url} 
                          alt={hit.title || "Afbeelding"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop";
                          }}
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h4 className="text-xs font-semibold text-slate-700 line-clamp-2 mb-1">
                          {hit.title || "Naamloze afbeelding"}
                        </h4>
                        <a 
                          href={hit.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-blue-600 hover:underline truncate block"
                        >
                          {hit.source || hit.url}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Video's Resultaten Grid */}
            {activeTab === "videos" && (() => {
              const videoHits = hits.filter(hit => hit.video_url);
              if (videoHits.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-500 bg-white rounded-3xl border border-slate-200 p-6">
                    Geen video's gevonden voor deze zoekopdracht.
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {videoHits.map((hit, i) => {
                    const isYoutube = hit.video_url?.includes("youtube.com") || hit.video_url?.includes("youtu.be");
                    let embedUrl = hit.video_url || "";
                    if (isYoutube && embedUrl.includes("watch?v=")) {
                      embedUrl = embedUrl.replace("watch?v=", "embed/");
                    }
                    return (
                      <div key={hit.id || i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="aspect-video w-full bg-slate-900">
                          {isYoutube ? (
                            <iframe 
                              src={embedUrl}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white relative">
                              <span className="text-3xl">🎥</span>
                              <a 
                                href={hit.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors text-white font-bold text-sm"
                              >
                                Bekijk Video ▶
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                              {hit.source || "Video bron"}
                            </div>
                            <h4 className="text-sm font-semibold text-slate-800 line-clamp-2">
                              {hit.title}
                            </h4>
                          </div>
                          <a 
                            href={hit.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-600 hover:underline mt-2 block"
                          >
                            Bronpagina openen
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : (

        /* Fajaede Intelligence Layer / Features */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:border-slate-300 transition-colors">
            <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-5 text-2xl">
              🛡️
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3">Privacy Eerst</h2>
            <p className="text-slate-600 leading-relaxed">Geen tracking, geen opgeslagen profielen. Jouw data blijft van jou, beschermd onder strikte Europese wetgeving.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:border-slate-300 transition-colors">
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-5 text-2xl">
              ✨
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3">AI Generator</h2>
            <p className="text-slate-600 leading-relaxed">Ontwerp direct complete HTML-websites met onze ingebouwde intelligente <span className="font-semibold">Fajaede Layer</span>.</p>
          </div>
        </div>
        )}

        {/* Footer / Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 mt-8 font-semibold">
          <Link href="/privacy-policy" className="hover:text-orange-600 transition-colors">
            Privacybeleid
          </Link>
          <a href="#" className="hover:text-orange-600 transition-colors">
            Website Generator
          </a>
        </div>
      </div>
    </main>
  );
}