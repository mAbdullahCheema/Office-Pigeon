/**
 * PostCSS config — consumed by Next.js only.
 *
 * Vite uses the `@tailwindcss/vite` plugin instead and is pinned to an inline
 * empty PostCSS config in vite.config.ts so it does NOT pick this file up
 * (which would double-process Tailwind). See docs/overhaul/04-HANDOFF.md.
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
