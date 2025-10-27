#!/usr/bin/env node
/**
 * Test script to verify the enhanced LLMService implementation
 */
// Use require for compatibility with both ESM and CommonJS
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { LLMRequest, getLLMService } from '../services/LLMService';
import { validateEnvironment } from '../utils/environment';
import { loadConfigFromEnvironment } from '../services/LLMServiceConfig';

const TEST_SCENARIOS = [
  {
    name: 'Basic Query',
    request: {
      query: 'Show me attendance data for the past week',
      queryContext: 'general'
    }
  },
  {
    name: 'Query With Special Characters',
    request: {
      query: 'Show me attendance data with special chars: <script>alert("test")</script>',
      queryContext: 'general'
    }
  },
  {
    name: 'Query With Custom Options',
    request: {
      query: 'Who has the highest absence rate?',
      queryContext: 'report',
      options: {
        temperature: 0.3,
        maxTokens: 1000
      }
    }
  }
];

async function testLLMService() {
  console.log('🧪 Testing Enhanced LLM Service Implementation');
  
  // Check environment
  const { isValid, message } = validateEnvironment();
  if (!isValid) {
    console.error(`❌ Environment validation failed: ${message}`);
    process.exit(1);
  }
  
  // Show loaded configuration
  const config = loadConfigFromEnvironment();
  console.log('✅ Configuration loaded:', {
    model: config.openai.model,
    temperature: config.openai.temperature,
    maxRetries: config.openai.maxRetries
  });
  
  try {
    // Initialize LLM service
    console.log('\nInitializing LLM service...');
    const llmService = getLLMService();
    
    // Run each test scenario
    for (const scenario of TEST_SCENARIOS) {
      console.log(`\n📝 Testing scenario: ${scenario.name}`);
      console.log(`Query: "${scenario.request.query}"`);
      
      const startTime = Date.now();
      const response = await llmService.processQuery(scenario.request);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Response generated in ${duration}ms`);
      console.log(`Confidence: ${response.confidence}`);
      console.log(`Answer: ${response.naturalLanguageAnswer.substring(0, 100)}...`);
      
      if (response.suggestedActions && response.suggestedActions.length > 0) {
        console.log(`Suggested actions: ${response.suggestedActions.join(', ')}`);
      }
    }
    
    console.log('\n✅ All test scenarios completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testLLMService().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
