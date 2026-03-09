import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginJest from "eslint-plugin-jest";

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
    files: [
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/?(*.)+(spec|test).[jt]s?(x)",
    ],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      ...pluginJest.configs["flat/recommended"].rules,
    },
  },
]);

export default eslintConfig;
