// app/builder/page.tsx
'use client';

import { useState } from 'react';

type BuilderResponse = {
  site_brief: any;
  site_content: any;
  html: string;
  validation_report: any;
};

export default function BuilderPage() {
  const [siteType, setSiteType] = useState('general_business');
  const [industry, setIndustry] = useState('IT');
  const [style, setStyle] = useState('modern');
  const [description, setDescription] = useState(
    'Een klein IT-consultancy bureau in Rotterdam dat MKB-bedrijven helpt met cloud en security.',
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BuilderResponse | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_type: siteType,
          industry,
          style,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Onbekende fout');
        setResult(null);
        return;
      }

      setResult(data as BuilderResponse);
    } catch (err: any) {
      setError(err?.message ?? 'Netwerkfout');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="builder-page" style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Website builder</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Genereer een MKB‑website op basis van een korte beschrijving. De HTML‑preview staat rechts.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: '2rem' }}>
        {/* Linker kolom: formulier + JSON debug */}
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>
                Site type
                <select
                  value={siteType}
                  onChange={(e) => setSiteType(e.target.value)}
                  style={{ display: 'block', marginTop: 4 }}
                >
                  <option value="general_business">Algemeen bedrijf</option>
                  <option value="law_firm">Advocatenkantoor</option>
                  <option value="restaurant">Restaurant</option>
                  {/* etc. */}
                </select>
              </label>
            </div>

            <div>
              <label>
                Sector / industry
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ display: 'block', marginTop: 4, width: '100%' }}
                />
              </label>
            </div>

            <div>
              <label>
                Stijl
                <input
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={{ display: 'block', marginTop: 4, width: '100%' }}
                />
              </label>
            </div>

            <div>
              <label>
                Beschrijving
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  style={{ display: 'block', marginTop: 4, width: '100%' }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: '#1a73e8',
                color: 'white',
                fontWeight: 500,
              }}
            >
              {loading ? 'Genereren…' : 'Genereer website'}
            </button>
          </form>

          {error && (
            <div style={{ marginTop: '1rem', color: 'red' }}>
              Fout: {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: '1rem' }}>
              <h2>JSON result</h2>
              <pre
                style={{
                  maxHeight: 300,
                  overflow: 'auto',
                  background: '#111827',
                  color: '#e5e7eb',
                  padding: '0.75rem',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                {JSON.stringify(
                  {
                    site_brief: result.site_brief,
                    site_content: result.site_content,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Rechter kolom: HTML preview */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
            <h2 style={{ margin: 0, marginRight: 'auto' }}>
              {viewMode === 'preview' ? 'Preview' : 'HTML Bron'}
            </h2>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              disabled={viewMode === 'preview'}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                cursor: viewMode === 'preview' ? 'default' : 'pointer',
                background: viewMode === 'preview' ? '#f3f4f6' : 'white',
                fontSize: '0.85rem'
              }}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('html')}
              disabled={viewMode === 'html'}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                cursor: viewMode === 'html' ? 'default' : 'pointer',
                background: viewMode === 'html' ? '#f3f4f6' : 'white',
                fontSize: '0.85rem'
              }}
            >
              HTML
            </button>
          </div>

          {!result && <p>Nog geen website gegenereerd.</p>}
          {result && viewMode === 'preview' && (
            /* 
               BEVEILIGING: Strictly sandboxed iframe voor preview van LLM-output.
               - allow-same-origin: Nodig voor rendering van CSS en anchors.
               - GEEN allow-scripts: Maximale veiligheid tegen XSS (JS is uitgeschakeld).
               - GEEN allow-top-navigation/popups/forms: Voorkomt redirects, phishing of form-submits.
            */
            <iframe
              title="Website preview"
              srcDoc={result.html}
              sandbox="allow-same-origin"
              style={{
                width: '100%',
                height: '80vh',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: 'white',
              }}
            />
          )}

          {result && viewMode === 'html' && (
            <pre
              style={{
                width: '100%',
                height: '80vh',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: '#111827',
                color: '#e5e7eb',
                padding: '0.75rem',
                overflow: 'auto',
                fontSize: 12,
              }}
            >
              {result.html}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}