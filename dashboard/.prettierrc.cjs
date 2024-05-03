module.exports = {
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  plugins: [require('@ianvs/prettier-plugin-sort-imports')],
  importOrder: ['^react$', '', '<THIRD_PARTY_MODULES>', '', '^~/', '^@/', '^[.][.]/', '^[.]/'],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '4.4.0',
}
