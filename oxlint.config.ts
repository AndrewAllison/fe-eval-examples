import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: [
    "typescript",
    "unicorn",
    "react",
    "react-perf",
    "jsx-a11y",
    "nextjs",
    "promise",
    "vitest",
  ],
  categories: {
    correctness: "error",
    perf: "error",
    suspicious: "error",
  },
  rules: {
    complexity: ["error", { max: 10 }],
    "promise/always-return": "error",
    "promise/catch-or-return": "error",
    "react/react-compiler": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-unsafe-argument": "error",
    "unicorn/no-array-for-each": "error",
    "vitest/require-to-throw-message": "error",
  },
  ignorePatterns: [".next/**", "coverage/**", "evidence/runs/**"],
});
