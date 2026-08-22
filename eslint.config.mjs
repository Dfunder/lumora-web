import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ESLint Flat Configuration for Lumora Web Application.
 * Standardizes rules across development teams, ensuring consistent style
 * and resolving typescript-eslint or react-hooks warnings when interacting with
 * low-level browser APIs (e.g. window.ethereum) or executing necessary state syncs.
 */
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
  // Custom rules configuration
  {
    rules: {
      // Disable overly strict rule that flags any state setting within an effect callback
      // since low-level state syncing on layout mounts/unmounts is required by theme/auth flows.
      "react-hooks/set-state-in-effect": "off",
      // Disable explicit any warning since it blocks standard declarations for third-party scripts (e.g. MetaMask/Window)
      "@typescript-eslint/no-explicit-any": "off",
      // Downgrade unused variables to warnings to allow ongoing work in developer sandboxes
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    }
  }
]);

export default eslintConfig;

