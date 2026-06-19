import Link from "next/link";

export default function CookiePolicy() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 20px",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.7,
        color: "#334155",
      }}
    >
      <Link href="/" style={{ color: "#0f172a", textDecoration: "none", fontWeight: 500, display: 'inline-block', marginBottom: '24px' }}>
        &larr; Terug naar de zoekmachine
      </Link>
      <h1 style={{ fontSize: 32, margin: "0 0 12px", color: "#1e293b" }}>
        Cookiebeleid voor fajaede.eu
      </h1>
      <p style={{ color: "#64748b", marginTop: 0 }}>
        <strong>Laatst bijgewerkt:</strong> 19 juni 2026
      </p>

      <h2 style={{ fontSize: 24, marginTop: 40, color: "#1e293b", borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        1. 100% Cookie-vrij
      </h2>
      <p>
        Bij fajaedeAI+ geloven we in een internet zonder tracking, profilering en onnodige inbreuk op uw privacy. Daarom is onze zoekmachine **volledig cookie-vrij**. 
      </p>
      <p>
        Wanneer u onze website bezoekt of gebruikt, worden er **geen cookies** op uw computer, telefoon of tablet geplaatst.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 40, color: "#1e293b", borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        2. Waarom gebruiken wij geen cookies?
      </h2>
      <p>
        Traditionele zoekmachines en websites gebruiken cookies om uw surfgedrag te volgen, zoekprofielen op te bouwen en gepersonaliseerde advertenties te tonen. 
      </p>
      <p>
        Omdat fajaedeAI+ uw privacy respecteert:
      </p>
      <ul>
        <li>Bouwen wij geen profielen van onze gebruikers op.</li>
        <li>Volgen wij uw surfgedrag niet over het web.</li>
        <li>Tonen wij geen gepersonaliseerde advertenties.</li>
      </ul>
      <p>
        Hierdoor hebben we simpelweg geen tracking-, analytische- of advertentiecookies nodig.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 40, color: "#1e293b", borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        3. Geen cookies van derden (Third-Party Cookies)
      </h2>
      <p>
        Omdat wij geen gebruik maken van advertentienetwerken van derden of externe analytische diensten (zoals Google Analytics of Facebook-pixels), kunnen derden via onze website ook geen cookies op uw apparaat plaatsen.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 40, color: "#1e293b", borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        4. Tijdelijke sessiegegevens
      </h2>
      <p>
        Wij maken uitsluitend gebruik van tijdelijke variabelen in het werkgeheugen (React state) om uw actieve zoekopdracht en de geselecteerde tabbladen (zoals Nieuws, Afbeeldingen of Video's) tijdens uw bezoek te onthouden. Zodra u de website of het browsertabblad sluit, worden deze gegevens direct en definitief gewist. Er wordt niks opgeslagen op uw harde schijf.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 40, color: "#1e293b", borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        5. Vragen?
      </h2>
      <p>
        Heeft u vragen over ons cookiebeleid of de manier waarop wij uw privacy waarborgen? Raadpleeg dan ons <Link href="/privacy-policy" style={{ color: "#2563eb", textDecoration: "underline" }}>Privacybeleid</Link> of neem contact met ons op via de contactgegevens die daarin staan vermeld.
      </p>
    </main>
  );
}
