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
  ]),
  {
    // `react-hooks/set-state-in-effect` is a strict rule from the React 19 hooks
    // plugin that this codebase predates — it fires on ~7 legacy setState-in-effect
    // sites. Keep it advisory (warn) so CI enforces real errors without blocking on
    // a pre-existing pattern; tracked for a proper cleanup pass (see S-026 debt).
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
