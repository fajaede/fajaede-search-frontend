import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fajaede-search-frontend.vercel.app";

  // Haal configuratie veilig op vanaf de server (nooit zichtbaar in browser)
  const MEILI_HOST = process.env.MEILI_HOST || "http://127.0.0.1:7700";
  const MEILI_KEY = process.env.MEILI_SEARCH_KEY || process.env.MEILI_MASTER_KEY || "";
  const MEILI_INDEX = process.env.MEILI_INDEX || "pages";

  let dynamicUrls: MetadataRoute.Sitemap = [];

  try {
    // Haal de top URLs op uit je 'pages' index in Meilisearch
    const res = await fetch(`${MEILI_HOST}/indexes/${MEILI_INDEX}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_KEY}`,
      },
      body: JSON.stringify({ q: "", limit: 1000, attributesToRetrieve: ["url", "published_at"] }),
      next: { revalidate: 3600 }, // Cache dit resultaat voor 1 uur
    });

    if (res.ok) {
      const data = await res.json();
      dynamicUrls = data.hits.map((hit: { url: string; published_at?: string }) => {
        let lastMod = new Date();
        if (hit.published_at) {
          const parsed = new Date(hit.published_at);
          if (!isNaN(parsed.getTime())) {
            lastMod = parsed;
          }
        }
        return {
          url: hit.url,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.6,
        };
      });
    } else {
      console.error("Kon dynamische sitemap niet laden van Meilisearch:", await res.text());
    }
  } catch (error) {
    console.error("Fout bij verbinden met Meilisearch in sitemap:", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...dynamicUrls];
}