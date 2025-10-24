// Simple script to test the RAGService and RAGIntegration
// TypeScript files need to be imported using ESM syntax
import { RAGService } from './dist/services/RAGService.js';
import { RAGIntegration } from './dist/services/RAGIntegration.js';
import { FileStudentRepo } from './dist/persistence/FileStudentRepo.js';
import { FileAttendanceRepo } from './dist/persistence/FileAttendanceRepo.js';
import { FileAlertRepo } from './dist/persistence/FileAlertRepo.js';

async function testRAG() {
  console.log('Testing RAG service...');
  
  try {
    // Create repositories
    const studentRepo = new FileStudentRepo();
    const attendanceRepo = new FileAttendanceRepo();
    const alertRepo = new FileAlertRepo();
    
    // Create RAG service and integration
    const ragService = new RAGService();
    const ragIntegration = new RAGIntegration(ragService, studentRepo, attendanceRepo, alertRepo);
    
    // Test query
    const query = "When was John Smith absent this month?";
    console.log(`Processing query: "${query}"`);
    
    // Use RAG integration to process the query
    const response = await ragIntegration.processQuery(query);
    
    console.log('Response:');
    console.log(JSON.stringify(response, null, 2));
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing RAG service:', error);
  }
}

testRAG();
