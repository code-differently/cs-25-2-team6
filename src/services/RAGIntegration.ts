/**
 * RAG Integration Interface
 * 
 * This file provides a clean interface for integrating the RAG (Retrieval Augmented Generation)
 * service with other parts of the application. It maintains separation of concerns between
 * retrieval and generation components.
 */

import { RAGResponse, RAGService, SuggestedAction } from './RAGService';
import { LLMService, LLMRequest, getLLMService } from './LLMService';
import { FileStudentRepo, Student } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { FileAlertRepo } from '../persistence/FileAlertRepo';
import { AttendanceRecord } from '../domains/AttendanceRecords';
import { AttendanceAlert } from '../domains/AttendanceAlert';
import {
  formatAttendanceForLLM,
  formatStudentsForLLM,
  prepareAttendanceContext, 
  FormatAttendanceOptions,
  StudentRecord,
  AttendanceRecordContext,
  adaptMultipleDomainToContext
} from '../utils/db-context-formatter';
import { 
  validateAndFixRAGResponse,
  RAG_RESPONSE_SCHEMA
} from '../utils/response-adapter';
import { LLMError, LLMErrorCategory } from '../utils/llm-error-handler';
import { sanitizeQuery } from './QuerySanitizer';
import { extractKeywords, calculateSimilarity } from '../utils/embeddings';
import { truncateDataForContext } from '../utils/context-management';

/**
 * Interface for RAG query options
 */
export interface RAGQueryOptions {
  maxAttendanceRecords?: number;
  includeStudentInfo?: boolean;
  dateFormat?: string;
  timezone?: string;
  priority?: 'high' | 'normal' | 'low';
  bypassCache?: boolean;
  timeout?: number;
}

/**
 * Query intent enum for categorizing types of user queries
 */
export enum QueryIntentType {
  ATTENDANCE_QUERY = 'attendance_query',
  ALERT_QUERY = 'alert_query',
  STUDENT_QUERY = 'student_query',
  GENERAL_QUERY = 'general_query'
}

/**
 * Filter parameters for API queries
 */
export interface QueryFilters {
  studentId?: string;
  studentName?: string;
  startDate?: string;
  endDate?: string;
  status?: string | string[];
  reason?: string;
  [key: string]: any;
}

/**
 * Interface for RAG integration adapter
 */
export interface RAGIntegrationAdapter {
  /**
   * Process a natural language query using RAG
   * @param query User's query text
   * @param options Query processing options
   * @returns Promise resolving to RAGResponse
   */
  processQuery(query: string, options?: RAGQueryOptions): Promise<RAGResponse>;
  
  /**
   * Process a natural language query with explicitly provided context
   * @param query User's query
   * @param context Explicit context to use (overrides retrieval)
   * @param options Query options
   * @returns Promise resolving to RAGResponse
   */
  processQueryWithContext(
    query: string, 
    context: string, 
    options?: RAGQueryOptions
  ): Promise<RAGResponse>;
  
  /**
   * Get attendance data formatted for LLM consumption
   * @param studentId Optional student ID to filter by
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @param options Formatting options
   * @returns Promise resolving to formatted attendance records
   */
  getFormattedAttendanceData(
    studentId?: string,
    startDate?: string,
    endDate?: string,
    options?: FormatAttendanceOptions
  ): Promise<AttendanceRecordContext[]>;
  
  /**
   * Get student data formatted for LLM consumption
   * @param studentId Optional student ID to filter by
   * @param includeDetails Whether to include detailed information
   * @returns Promise resolving to formatted student records
   */
  getFormattedStudentData(
    studentId?: string,
    includeDetails?: boolean
  ): Promise<StudentRecord[]>;
  
  /**
   * Analyze the intent of a user query
   * @param query User's query text
   * @returns Promise resolving to query intent and filters
   */
  analyzeQueryIntent(
    query: string
  ): Promise<{ intent: QueryIntentType; filters: QueryFilters }>;
}

/**
 * RAG Integration Adapter implementation
 * Provides a clean interface for integrating RAG with the rest of the application
 */
export class RAGIntegration implements RAGIntegrationAdapter {
  private ragService: RAGService;
  private llmService: LLMService;
  private studentRepo: FileStudentRepo;
  private attendanceRepo: FileAttendanceRepo;
  private alertRepo: FileAlertRepo;

  constructor(
    ragService?: RAGService,
    studentRepo?: FileStudentRepo,
    attendanceRepo?: FileAttendanceRepo,
    alertRepo?: FileAlertRepo
  ) {
    this.ragService = ragService || new RAGService();
    this.llmService = getLLMService();
    this.studentRepo = studentRepo || new FileStudentRepo();
    this.attendanceRepo = attendanceRepo || new FileAttendanceRepo();
    this.alertRepo = alertRepo || new FileAlertRepo();
  }
  
  /**
   * Classify the intent and filters of a user query
   * @param userQuery User's query text
   * @returns Promise resolving to intent and filters
   */
  private async classifyIntent(userQuery: string): Promise<{ intent: QueryIntentType; filters: QueryFilters }> {
    return await this.analyzeQueryIntent(userQuery);
  }

  /**
   * Process a natural language query using RAG
   * @param query User's query text
   * @param options Query processing options
   * @returns Promise resolving to RAGResponse
   */
  public async processQuery(
    userQuery: string,
    options?: RAGQueryOptions
  ): Promise<RAGResponse> {
    // 1. Classify intent
    const { intent, filters } = await this.classifyIntent(userQuery);
    // 2. Fetch data from local repo (remove supabase)
    let records: Student[] = [];
    try {
      if (intent === QueryIntentType.STUDENT_QUERY || intent === QueryIntentType.ATTENDANCE_QUERY) {
        // Use local repo for demo
        records = this.studentRepo ? this.studentRepo.allStudents() : [];
      }
      // Add more intent mappings as needed
    } catch (err: any) {
      return {
        naturalLanguageAnswer: `⚠️ Error fetching data.`,
        structuredData: {},
        actions: [],
        confidence: 0.1
      };
    }
    // 3. Fallback if no data
    if (!records.length) {
      return {
        naturalLanguageAnswer: "No matching records were found.",
        structuredData: { students: [] },
        actions: [],
        confidence: 0.4,
      };
    }
    // 4. Prepare prompt for LLM
    const systemPrompt = this.getSystemPromptForContext(intent);
    const injectedPrompt = `\n${systemPrompt}\n\n### RETRIEVED DATA\n${JSON.stringify(records, null, 2)}\n\n### USER QUERY\n${userQuery}\n`;
    // 5. Call LLM
    const llmResponse = await this.runLLM(injectedPrompt);
    // 6. Validate
    const validated = this.validateResponse(llmResponse);
    if (!validated.valid) {
      return {
        naturalLanguageAnswer: `⚠️ The response didn't meet validation standards.`,
        structuredData: {},
        actions: [],
        confidence: 0.2,
      };
    }
    // 7. Return final response
    return {
      ...llmResponse,
      confidence: llmResponse.confidence || 0.85,
    };
  }
  
  /**
   * Process a natural language query with explicitly provided context
   * @param query User's query
   * @param context Explicit context to use (overrides retrieval)
   * @param options Query options
   * @returns Promise resolving to RAGResponse
   */
  public async processQueryWithContext(
    query: string, 
    context: string, 
    options?: RAGQueryOptions
  ): Promise<RAGResponse> {
    try {
      // Sanitize the query
      const sanitizedQuery = sanitizeQuery(query);
      
      // Process with RAG service using the provided context
      return await this.ragService.processQuery(sanitizedQuery + "\n\nCONTEXT: " + context);
    } catch (error) {
      console.error('Error in RAG integration processQueryWithContext:', error);
      
      // Create standardized error response
      return {
        naturalLanguageAnswer: `I'm sorry, but I encountered an error processing your query with the provided context. ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        actions: [{
          type: 'VIEW_ALERTS',
          label: 'Try again with a different context'
        }]
      };
    }
  }
  
  /**
   * Get attendance data formatted for LLM consumption
   * @param studentId Optional student ID to filter by
   * @param startDate Optional start date
   * @param endDate Optional end date
   * @param options Formatting options
   * @returns Promise resolving to formatted attendance records
   */
  public async getFormattedAttendanceData(
    studentId?: string,
    startDate?: string,
    endDate?: string,
    options?: FormatAttendanceOptions
  ): Promise<AttendanceRecordContext[]> {
    try {
      // Get raw attendance data from repository
      let attendanceRecords: AttendanceRecord[] = await this.getAllAttendance();
      
      // Apply filters
      if (studentId) {
        attendanceRecords = attendanceRecords.filter(record => record.studentId === studentId);
      }
      
      if (startDate) {
        const start = new Date(startDate);
        attendanceRecords = attendanceRecords.filter(record => 
          new Date(record.dateISO) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        attendanceRecords = attendanceRecords.filter(record => 
          new Date(record.dateISO) <= end
        );
      }
      
      // Get student info for formatting
      const students = await this.getAllStudents();
      // Map students to StudentRecord format
      const studentRecords: StudentRecord[] = students.map(student => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName
      }));
      const studentMap: Record<string, StudentRecord> = {};
      studentRecords.forEach(student => {
        studentMap[student.id] = student;
      });
      
      // Format for LLM
      return formatAttendanceForLLM(
        attendanceRecords, 
        {
          ...options,
          studentInfo: Object.values(studentMap) as StudentRecord[]
        }
      );
    } catch (error) {
      console.error('Error getting formatted attendance data:', error);
      throw new LLMError(
        'Failed to retrieve attendance data',
        LLMErrorCategory.DATA_RETRIEVAL
      );
    }
  }
  
  /**
   * Get student data formatted for LLM consumption
   * @param studentId Optional student ID to filter by
   * @param includeDetails Whether to include detailed information
   * @returns Promise resolving to formatted student records
   */
  public async getFormattedStudentData(
    studentId?: string,
    includeDetails: boolean = false
  ): Promise<StudentRecord[]> {
    try {
      // Get raw student data from repository
      let students: Student[] = [];
      
      if (studentId) {
        const student = this.studentRepo.findStudentById(studentId);
        if (student) {
          students = [student];
        }
      } else {
        students = this.studentRepo.allStudents();
      }
      
      // Format for LLM
      return formatStudentsForLLM(students as StudentRecord[]);
    } catch (error) {
      console.error('Error getting formatted student data:', error);
      throw new LLMError(
        'Failed to retrieve student data',
        LLMErrorCategory.DATA_RETRIEVAL
      );
    }
  }
  
  /**
   * Analyze the intent of a user query
   * @param query User's query text
   * @returns Promise resolving to query intent and filters
   */
  public async analyzeQueryIntent(
    query: string
  ): Promise<{ intent: QueryIntentType; filters: QueryFilters }> {
    try {
      // Extract keywords from the query
      const keywords = extractKeywords(query);
      
      // Determine intent based on keywords
      let intent = QueryIntentType.GENERAL_QUERY;
      const filters: QueryFilters = {};
      
      // Check for attendance-related keywords
      const attendanceKeywords = ['attendance', 'absent', 'present', 'tardy', 'late', 'excused'];
      if (attendanceKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
        intent = QueryIntentType.ATTENDANCE_QUERY;
      }
      
      // Check for alert-related keywords
      const alertKeywords = ['alert', 'warning', 'notification', 'threshold'];
      if (alertKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
        intent = QueryIntentType.ALERT_QUERY;
      }
      
      // Check for student-related keywords
      const studentKeywords = ['student', 'profile', 'information', 'contact'];
      if (studentKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
        intent = QueryIntentType.STUDENT_QUERY;
      }
      
      // Try to extract student names or IDs
      const students = this.studentRepo.allStudents();
      for (const student of students) {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        if (query.toLowerCase().includes(fullName) || 
            query.toLowerCase().includes(student.firstName.toLowerCase()) ||
            query.toLowerCase().includes(student.lastName.toLowerCase())) {
          filters.studentId = student.id;
          filters.studentName = `${student.firstName} ${student.lastName}`;
          break;
        }
      }
      
      // TODO: Add more sophisticated date extraction, status filters, etc.
      
      return { intent, filters };
    } catch (error) {
      console.error('Error analyzing query intent:', error);
      throw new LLMError(
        'Failed to analyze query intent',
        LLMErrorCategory.QUERY_PROCESSING
      );
    }
  }

  // Stub for missing functions
  private getSystemPromptForContext(intent: QueryIntentType): string {
    return `System prompt for ${intent}`;
  }
  private async runLLM(prompt: string): Promise<RAGResponse> {
    return { naturalLanguageAnswer: 'Stub LLM response', structuredData: {}, actions: [], confidence: 1 };
  }
  private validateResponse(response: RAGResponse): { valid: boolean } {
    return { valid: true };
  }
  private async getAllAttendance(): Promise<AttendanceRecord[]> {
    return this.attendanceRepo ? this.attendanceRepo.allAttendance() : [];
  }
  private async getAllStudents(): Promise<Student[]> {
    return this.studentRepo ? this.studentRepo.allStudents() : [];
  }
}

/**
 * Factory function to create a RAG integration adapter
 * @param ragService Optional RAGService instance (creates a new one if not provided)
 * @returns RAGIntegrationAdapter instance
 */
export function createRAGIntegration(
  ragService?: RAGService,
  studentRepo?: FileStudentRepo,
  attendanceRepo?: FileAttendanceRepo,
  alertRepo?: FileAlertRepo
): RAGIntegrationAdapter {
  return new RAGIntegration(ragService, studentRepo, attendanceRepo, alertRepo);
}
