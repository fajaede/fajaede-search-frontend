import Link from "next/link";

export default function Home() {
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
        <form className="w-full max-w-3xl flex items-center bg-white rounded-full shadow-lg border border-slate-200 p-2 mb-16 focus-within:ring-2 focus-within:ring-orange-500 transition-all hover:shadow-xl">
          <input
            type="text"
            name="q"
            placeholder="Zoek met fajaedeAI+..."
            className="w-full px-6 py-4 rounded-full focus:outline-none text-xl text-slate-700 bg-transparent"
            required
          />
          <button
            type="submit"
            className="bg-slate-800 text-white px-10 py-4 rounded-full font-bold hover:bg-slate-700 transition-colors shadow-sm text-lg"
          >
            Zoeken
          </button>
        </form>

        {/* Fajaede Intelligence Layer / Features */}
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