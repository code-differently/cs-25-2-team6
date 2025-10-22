#!/usr/bin/env node
/**
 * Test script to verify system prompts for different contexts
 */
// Use require for compatibility with both ESM and CommonJS
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { LLMRequest, getLLMService } from '../services/LLMService';

const TEST_QUERIES = [
  {
    context: 'general',
    query: 'Show me attendance data for the past week'
  },
  {
    context: 'alert',
    query: 'Why was an attendance alert triggered for John Smith?'
  },
  {
    context: 'report',
    query: 'Generate a weekly attendance report for Class 101'
  }
];

async function testSystemPrompts() {
  console.log('🧪 Testing System Prompts for Different Contexts');
  
  try {
    // Initialize LLM service
    console.log('Initializing LLM service...');
    const llmService = getLLMService();
    
    // Test each query with its specific context
    for (const test of TEST_QUERIES) {
      console.log(`\n📝 Testing context: ${test.context}`);
      console.log(`Query: "${test.query}"`);
      
      const request: LLMRequest = {
        query: test.query,
        queryContext: test.context,
        // Add mock data for testing
        attendanceData: [
          { 
            studentId: '123', 
            studentName: 'John Smith', 
            date: '2025-10-15', 
            status: 'Absent' 
          },
          { 
            studentId: '123', 
            studentName: 'John Smith', 
            date: '2025-10-16', 
            status: 'Absent' 
          },
          { 
            studentId: '123', 
            studentName: 'John Smith', 
            date: '2025-10-17', 
            status: 'Present' 
          }
        ]
      };
      
      const startTime = Date.now();
      const response = await llmService.processQuery(request);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Response generated in ${duration}ms`);
      console.log(`Confidence: ${response.confidence}`);
      console.log(`Answer: ${response.naturalLanguageAnswer.substring(0, 100)}...`);
      
      if (response.suggestedActions && response.suggestedActions.length > 0) {
        console.log(`Suggested actions: ${response.suggestedActions.length}`);
      }
    }
    
    console.log('\n✅ All system prompts tested successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSystemPrompts().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
