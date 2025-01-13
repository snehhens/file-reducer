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
      // Disable specific rules
      'react/no-unescaped-entities': 'off', // Allow unescaped single quotes
      'jsx-a11y/alt-text': 'off', // Disable alt text requirement
      '@typescript-eslint/no-unused-vars': 'warn', // Warn about unused variables
      'react-hooks/exhaustive-deps': 'warn', // Warn about missing dependencies
      '@next/next/no-img-element': 'off', // Allow using <img> instead of <Image />
      'jsx-a11y/heading-has-content': 'off', // Disable heading content requirement
      'no-console': 'off', // Allow console statements

      // Add custom rules
      'quotes': ['error', 'single'], // Enforce single quotes
    },
  },
];

export default eslintConfig;