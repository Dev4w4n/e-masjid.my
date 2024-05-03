/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    // 'plugin:react-hooks/recommended',
    // 'plugin:react/recommended',
    // 'plugin:react/jsx-runtime',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', 'build', '.eslintrc.cjs', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['react-refresh', 'import'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
  // overrides: [
  //   {
  //     files: ['*.js', '*.jsx'],
  //     extends: ['plugin:@typescript-eslint/disable-type-checked'],
  //   },
  // ],
  settings: {
    react: {
      version: 'detect',
    },
  },
}

module.exports = config
