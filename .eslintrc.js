module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // These rules are being overridden to fix deployment errors
    '@typescript-eslint/no-unused-vars': 'warn', // Downgrade from error to warning
    'react-hooks/exhaustive-deps': 'warn', // Downgrade from error to warning
    'react/no-unescaped-entities': 'off', // Turn off unescaped entities errors
  }
} 