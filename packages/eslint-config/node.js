module.exports = {
  extends: ["./index.js"],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Node.js specific rules
    "no-console": "off", // Console is acceptable in Node.js
    "no-process-exit": "error",
    "no-process-env": "off", // Environment variables are common in Node.js
  },
};
