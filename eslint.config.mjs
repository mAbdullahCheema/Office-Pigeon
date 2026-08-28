import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The Hostinger bundle is generated output, node_modules and all.
    "deploy/**",
    // Snapshots of pages taken out of the build, kept verbatim for restoring.
    "page-backups/**",
  ]),
]);

export default eslintConfig;
