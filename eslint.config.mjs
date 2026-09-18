import { FlatCompat } from "@eslint/eslintrc";

/**
 * Flat config. `next lint` is deprecated in Next 15 and removed in 16 — the old
 * `pnpm lint` script dropped into an interactive setup prompt instead of linting
 * anything (audit, hygiene table).
 *
 * Run `pnpm install` once to pull the new devDependencies, then `pnpm lint`.
 */
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off", // the lead route logs deliberately — see audit finding #2
    },
  },
];

export default config;
