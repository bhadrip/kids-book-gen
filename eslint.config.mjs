import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import playwright from "eslint-plugin-playwright";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["e2e/**/*.ts"],
    ...playwright.configs["flat/recommended"],
  },
  globalIgnores([
    ".next/**",
    "coverage/**",
    "data/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
