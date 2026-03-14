/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',       // React 17+ — no import React needed
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',                        // Must be last — disables conflicting rules
  ],
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'jsx-a11y'],
  rules: {
    /* TypeScript */
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

    /* React */
    'react/prop-types': 'off',         // TypeScript handles this
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    /* i18n — every user-facing string must use i18n.t() */
    'no-restricted-syntax': [
      'warn',
      {
        // Warn on JSX text nodes that aren't wrapped — loose heuristic
        selector: 'JSXText[value=/[A-Z][a-z]{3,}/]',
        message: 'Use i18n.t() for user-facing strings',
      },
    ],

    /* General */
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: ['build/', 'dist/', 'node_modules/', 'coverage/', '*.js'],
}
