/**
 * Script to test OpenAI environment setup
 * This is just for testing purposes and can be removed after setup verification
 */
// Use require for compatibility with both ESM and CommonJS
// This avoids issues in different environments (local vs Vercel)
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Import after environment is loaded
import { logEnvironmentValidation, validateEnvironment } from '../utils/environment';

// Log environment validation status
logEnvironmentValidation();

// Test OpenAI API key availability
const { isValid, missingVars } = validateEnvironment();

if (!isValid) {
  console.error(`❌ Environment validation failed: Missing ${missingVars.join(', ')}`);
  console.error('Please set up your .env.local file with the required variables');
  process.exit(1);
} else {
  console.log('✅ OpenAI environment setup is valid and ready for RAG integration');
}

// Note: This file can be executed with "npm run test:env" after adding the script to package.json
