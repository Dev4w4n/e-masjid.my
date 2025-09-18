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
  plugins: ['isaacscript', 'react-refresh', 'import'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // These off/not-configured-the-way-we-want lint rules we like & opt into
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    'import/consistent-type-specifier-style': ['error', 'prefer-inline'],

    // For educational purposes we format our comments/jsdoc nicely
    'isaacscript/complete-sentences-jsdoc': 'warn',
    'isaacscript/format-jsdoc-comments': 'warn',

    // These lint rules don't make sense for us but are enabled in the preset configs
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',

    // This rule doesn't seem to be working properly
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
}

module.exports = config
