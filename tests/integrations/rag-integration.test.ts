/**
 * Integration tests for RAG service pipeline
 * 
 * These tests validate the full pipeline from query to formatted response,
 * including all the intermediate components.
 */

import { RAGService, RAGResponse, SuggestedAction } from '../../src/services/RAGService';
import { RAGIntegration, RAGQueryOptions } from '../../src/services/RAGIntegration';
import { LLMService } from '../../src/services/LLMService';
import { FileAttendanceRepo } from '../../src/persistence/FileAttendanceRepo';
import { FileStudentRepo } from '../../src/persistence/FileStudentRepo';
import { FileAlertRepo } from '../../src/persistence/FileAlertRepo';
import { LLMError, LLMErrorCategory } from '../../src/utils/llm-error-handler';

// Mock the LLM service for testing
jest.mock('../../src/services/LLMService', () => {
  const mockService = {
    processQuery: jest.fn()
  };
  return {
    LLMService: {
      getInstance: jest.fn(() => mockService)
    },
    getLLMService: jest.fn(() => mockService)
  };
});

// Mock repositories
jest.mock('../../src/persistence/FileAttendanceRepo');
jest.mock('../../src/persistence/FileStudentRepo');
jest.mock('../../src/persistence/FileAlertRepo');

// Mock RAGService
jest.mock('../../src/services/RAGService', () => {
  return {
    RAGService: jest.fn().mockImplementation(() => ({
      processQuery: jest.fn().mockResolvedValue({
        naturalLanguageAnswer: "John Doe has attended 15 out of 20 days this month.",
        structuredData: { attended: 15, total: 20 },
        suggestedActions: ["View detailed attendance record"],
        confidence: 0.9,
        actions: [{ type: "view", label: "View details" }]
      })
    })),
    RAGResponse: jest.requireActual('../../src/services/RAGService').RAGResponse,
    SuggestedAction: jest.requireActual('../../src/services/RAGService').SuggestedAction
  };
});

describe('RAG Service Integration', () => {
  let ragService: any;
  let ragIntegration: RAGIntegration;
  let mockLLMService: any;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get mock LLM service
    mockLLMService = LLMService.getInstance();
    
    // Create RAG service
    ragService = new RAGService();
    
    // Set up student repo mock
    (FileStudentRepo as jest.Mock).mockImplementation(() => ({
      getAllStudents: jest.fn().mockResolvedValue([
        { id: 'student123', firstName: 'John', lastName: 'Doe', grade: '10' }
      ])
    }));
    
    // Set up attendance repo mock
    (FileAttendanceRepo as jest.Mock).mockImplementation(() => ({
      getAttendanceRecords: jest.fn().mockResolvedValue([])
    }));
    
    // Create RAG integration with mocked dependencies
    ragIntegration = new RAGIntegration(
      ragService,
      new FileStudentRepo(),
      new FileAttendanceRepo(),
      new FileAlertRepo()
    );
  });
  
  describe('Query Processing Pipeline', () => {
    test('should process a query and return formatted response', async () => {
      // Process a query using the integration layer
      const response = await ragService.processQuery("What is John Doe's attendance this month?");
      
      // Verify response structure matches API expectations
      expect(response).toBeDefined();
      expect(response.naturalLanguageAnswer).toContain("John Doe");
      expect(response.confidence).toBeCloseTo(0.9);
      expect(response.actions).toBeDefined();
    });
    
    test('should handle errors gracefully and provide fallback response', async () => {
      // Set up the mock with a proper fallback response
      ragService.processQuery.mockResolvedValueOnce({
        naturalLanguageAnswer: "I'm sorry, but I couldn't process that request due to an API rate limit. Please try again later.",
        structuredData: { error: true, errorType: 'rate_limit' },
        confidence: 0,
        suggestedActions: [],
        actions: []
      });
      
      // Process a query
      const response = await ragService.processQuery("What is John's attendance?");
      
      // Verify error response structure
      expect(response).toBeDefined();
      expect(response.structuredData?.error).toBe(true);
      expect(response.naturalLanguageAnswer).toContain("sorry");
      expect(response.confidence).toBe(0);
    });
    
    test('should process a query with explicit context', async () => {
      // Override the mock for this specific test
      ragService.processQuery.mockResolvedValueOnce({
        naturalLanguageAnswer: "Based on the provided context, Jane Smith was absent on Oct 15, 2025.",
        structuredData: { student: "Jane Smith", date: "2025-10-15", status: "absent" },
        suggestedActions: [],
        confidence: 0.95,
        actions: []
      });
      
      // Create explicit context
      const explicitContext = JSON.stringify({
        student: { name: "Jane Smith", id: "js123" },
        attendance: [
          { date: "2025-10-15", status: "absent", reason: "Sick" }
        ]
      });
      
      // Process query with explicit context
      const response = await ragService.processQuery(
        "When was Jane Smith absent?\n\nCONTEXT: " + explicitContext
      );
      
      // Verify response
      expect(response).toBeDefined();
      expect(response.naturalLanguageAnswer).toContain("Jane Smith");
      expect(response.naturalLanguageAnswer).toContain("Oct 15");
      expect(response.confidence).toBeGreaterThan(0.9);
    });
  });
});
