module.exports = {
  extends: ["@masjid-suite/eslint-config/react"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "dist/**",
    "node_modules/**",
    "tests/**",
    "*.config.ts",
    "*.config.js"
  ],
  rules: {
    // Additional rules specific to content management
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "prefer-const": "error",
  },
};