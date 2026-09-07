import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      ".webdev/**",
      "**/*.d.ts",
    ],
  },
  {
    files: ["client/src/**/*.{ts,tsx}", "server/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
    },
  },
];
