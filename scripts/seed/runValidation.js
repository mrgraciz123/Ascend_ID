// runValidation.js
// Wrapper to execute TypeScript validation runner without needing .ts execution support
require('ts-node').register({ transpileOnly: true });
require('./validationRunner.ts');
