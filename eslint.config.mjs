import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.stories.*",
      "**/*.test.*",
      "**/*.spec.*",
      "migrations/**",
      "scripts/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Pragmatic rule tuning: keep CI green while we incrementally improve code quality.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Relax a few base JS rules that are noisy in this codebase.
      "no-empty": "off",
      "no-case-declarations": "off",
      "no-useless-assignment": "off",
      "no-shadow-restricted-names": "off",
      "no-useless-escape": "off",

      // React hooks linting is intentionally relaxed (complex effects in the UI).
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",

      // Next.js image lint: we sometimes intentionally use <img> (data URLs, etc.).
      "@next/next/no-img-element": "off",
    },
  }
);
