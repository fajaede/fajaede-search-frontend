import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Gebruik de officiële domeinnaam uit de environment variables, met een fallback.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fajaede.eu";
  // Static routes always included
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
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // If the flag is set, skip the dynamic Meilisearch request (useful during Vercel builds)
  const disableMeili = process.env.VERCEL_ENV === "production" || process.env.MEILI_DISABLE_ON_BUILD === "true";
  if (disableMeili) {
    console.log("MEILI_DISABLE_ON_BUILD is true – skipping Meilisearch sitemap generation.");
    return staticRoutes;
  }

  // Haal configuratie veilig op vanaf de server (nooit zichtbaar in browser)
  const MEILI_HOST = process.env.MEILI_HOST || "http://127.0.0.1:7700";
  // Gebruik altijd de publieke search key voor de frontend. De master key hoort hier niet.
  const MEILI_KEY = process.env.MEILI_SEARCH_KEY || "";
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

  return [...staticRoutes, ...dynamicUrls];
}
