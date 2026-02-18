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
    "scripts/**",
    "prisma/**",
    "*.js",
  ]),
  {
    // Project-wide rule overrides — tech debt tracked separately
    rules: {
      // `any` is widespread in this codebase; treat as warning until typed properly
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars: warn only (don't block CI)
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow @ts-ignore for now (legacy code); prefer @ts-expect-error going forward
      "@typescript-eslint/ban-ts-comment": "warn",
      // Allow require() imports in legacy/dynamic contexts
      "@typescript-eslint/no-require-imports": "warn",
      // React hooks: warn only
      "react-hooks/exhaustive-deps": "warn",
      // react-hooks/immutability is not a standard rule — disable if not installed
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      // Unescaped entities: error (easy to fix, correctness issue)
      "react/no-unescaped-entities": "error",
      // next/link for navigation
      "@next/next/no-html-link-for-pages": "error",
      // prefer-const: error (trivial fix)
      "prefer-const": "error",
    },
  },
]);

export default eslintConfig;
