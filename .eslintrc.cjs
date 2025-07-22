module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      plugins: ['svelte'],
      processor: 'svelte/svelte',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    {
      files: ['*.js', '*.cjs'],
      parser: '@typescript-eslint/parser'
    }
  ]
}
