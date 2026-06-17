import SearchBox from "./components/SearchBox";

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <p
          style={{
            margin: 0,
            color: "#01696f",
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            fontSize: 13,
          }}
        >
          Europese Zoekmachine
        </p>
        <h1 style={{ fontSize: 40, margin: "10px 0 12px" }}>
          Zoek door jouw Europese index
        </h1>
        <p style={{ color: "#475467", fontSize: 18, maxWidth: 720 }}>
          Deze Next.js interface zoekt via een server-side API route in jouw
          Meilisearch index <strong>pages</strong>, zonder de master key in de
          browser te zetten.
        </p>
      </div>

      <SearchBox />
    </main>
  );
}
