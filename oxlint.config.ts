import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "react", "react-perf", "jsx-a11y", "nextjs"],
  categories: {
    correctness: "error",
    perf: "error",
    suspicious: "error",
  },
  rules: {
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": "error",
    "typescript/no-unsafe-assignment": "error",
    "typescript/no-unsafe-argument": "error",
    "unicorn/no-array-for-each": "error",
  },
  ignorePatterns: [".next/**", "coverage/**", "evidence/runs/**"],
});
