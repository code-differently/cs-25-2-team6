#!/usr/bin/env node
/**
 * Test script to verify LLMService and RAGService integration
 */
// Use require for compatibility with both ESM and CommonJS
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Import after environment is loaded
import { RAGService } from '../services/RAGService';
import { getLLMService } from '../services/LLMService';
import { validateEnvironment, logEnvironmentValidation } from '../utils/environment';

async function testRAGLLMIntegration() {
  console.log('🧪 Testing RAG + LLM Integration');
  
  // Log environment validation
  logEnvironmentValidation();
  
  const { isValid, message } = validateEnvironment();
  if (!isValid) {
    console.error(`❌ Environment validation failed: ${message}`);
    process.exit(1);
  }
  
  try {
    // Initialize LLM service
    console.log('Initializing LLM service...');
    const llmService = getLLMService();
    console.log(`✅ LLM service initialized with message history size: ${llmService.getConversationLength()}`);
    
    // Initialize RAG service
    console.log('Initializing RAG service...');
    const ragService = new RAGService();
    
    // Test query
    const testQuery = 'Who are the students with high absence rates?';
    console.log(`\n🧠 Processing test query: "${testQuery}"`);
    
    const startTime = Date.now();
    const result = await ragService.processQuery(testQuery);
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Query processed in ${duration}ms`);
    console.log(`\n📝 Natural Language Answer:\n${result.naturalLanguageAnswer}`);
    console.log(`\n🎯 Confidence: ${result.confidence}`);
    
    if (result.actions && result.actions.length > 0) {
      console.log('\n🔍 Suggested Actions:');
      result.actions.forEach((action: { label: string; type: string }, i: number) => {
        console.log(`  ${i + 1}. ${action.label} (${action.type})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRAGLLMIntegration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
