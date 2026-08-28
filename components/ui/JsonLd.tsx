/**
 * Emits a structured-data block.
 *
 * `suppressHydrationWarning` is required rather than tidy: React serialises the
 * JSON slightly differently on the server and the client, and without it every
 * page carrying schema logs a hydration mismatch for text no human ever reads.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(data)}
    </script>
  );
}
