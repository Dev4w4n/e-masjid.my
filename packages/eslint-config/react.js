module.exports = {
  extends: [
    "./index.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  plugins: ["react", "react-hooks", "jsx-a11y", "react-refresh"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // React rules
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/prop-types": "off", // Using TypeScript for prop validation
    "react/jsx-uses-react": "off", // Not needed in React 17+
    "react/jsx-uses-vars": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": "warn",
    
    // Accessibility rules
    "jsx-a11y/anchor-is-valid": "off", // Next.js Link component
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
  },
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    sourceType: "module",
  },
};
