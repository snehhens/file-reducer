import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:jsx-a11y/recommended'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'off',
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/alt-text': 'off',
      '@next/next/no-img-element': 'off',
      'jsx-a11y/heading-has-content': 'off',
      'no-console': 'off',
      'quotes': ['error', 'single'],
    },
  },
];

export default eslintConfig;
