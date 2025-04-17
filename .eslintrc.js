module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/playwright-test',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'playwright'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.spec.tsx', 'tests/**/*.ts'],
      env: { 'playwright/playwright-test': true },
    },
  ],
};
