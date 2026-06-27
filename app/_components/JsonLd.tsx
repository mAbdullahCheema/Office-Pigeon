/**
 * Renders a JSON-LD <script>. Server Component (no client JS) — the structured
 * data is emitted directly into the server-rendered HTML for crawlers. SEO-04.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema content is static/from config; safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
