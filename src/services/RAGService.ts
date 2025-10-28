/**
 * RAG Service for processing natural language queries about attendance and alerts.
 * This service orchestrates query processing, data retrieval, and response generation.
 */
import { QueryProcessor, QueryIntent, APIFilters } from './QueryProcessor';
import { LLMService, LLMRequest, getLLMService } from './LLMService';
import { sanitizeQuery } from './QuerySanitizer';
import {
  MAX_CONTEXT_ITEMS,
  truncateDataForContext,
  validateResponse,
  createErrorResponse,
  DEFAULT_RAG_SCHEMA,
  ResponseValidationErrorType
} from '../utils/context-management';
import {
  validateAndFixRAGResponse,
  adaptLLMToRAGResponse,
  RAG_RESPONSE_SCHEMA
} from '../utils/response-adapter';
import {
  LLMError,
  LLMErrorCategory,
  getFallbackResponse
} from '../utils/llm-error-handler';
import type { Student } from '../types/students';

// Response types
export interface RAGResponse {
  naturalLanguageAnswer: string;
  structuredData?: any;
  actions?: SuggestedAction[];
  confidence: number;
}

export interface SuggestedAction {
  type: 'VIEW_STUDENT' | 'SEND_NOTIFICATION' | 'SCHEDULE_MEETING' | 'VIEW_ALERTS';
  label: string;
  params?: Record<string, any>;
}

// Utility to get absolute API URL for server-side fetches
function getApiUrl(path: string) {
  // Use NEXT_PUBLIC_BASE_URL if set, otherwise default to localhost:3000
  const base = process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window === 'undefined' ? 'http://localhost:3000' : '');
  return `${base}${path}`;
}

export class RAGService {
  private queryProcessor: QueryProcessor;
  
  constructor() {
    this.queryProcessor = new QueryProcessor();
  }
  
  /**
   * Main entry point for processing natural language queries
   * Accepts optional context and data for direct LLM injection
   */
  async processQuery(query: string, context?: string, dataOverride?: any): Promise<RAGResponse> {
    try {
      // 1. Classify query intent
      const intent = this.queryProcessor.classifyQuery(query);
      
      // 2. Convert to API filters
      const filters = await this.queryProcessor.queryToFilters(query, intent);
      
      // 3. Fetch data based on intent, unless dataOverride is provided
      const data = dataOverride !== undefined ? dataOverride : await this.fetchRelevantData(intent, filters);
      
      // 4. Generate natural language response, passing context if provided
      const response = await this.generateResponse(query, intent, data, context, filters);
      
      return response;
    } catch (error) {
      console.error('Error in RAGService.processQuery:', error);
      
      // Return a graceful fallback response
      return {
        naturalLanguageAnswer: "I'm sorry, but I couldn't process your query at this time. Our system might be experiencing high demand. Please try again with a simpler question.",
        structuredData: null,
        actions: [],
        confidence: 0
      };
    }
  }
  
  /**
   * Fetch relevant data based on the query intent and filters
   */
  private async fetchRelevantData(intent: QueryIntent, filters: APIFilters): Promise<any> {
    switch (intent) {
      case 'ALERT_QUERY':
        return this.fetchAlertData(filters);
      case 'ALERT_EXPLANATION':
        return this.fetchAlertExplanationData(filters);
      case 'ATTENDANCE_QUERY':
        return this.fetchAttendanceData(filters);
      case 'STUDENT_QUERY':
        return this.fetchStudentData(filters);
      default:
        return this.fetchGeneralData(filters);
    }
  }
  
  // --- API-based data fetching ---
  private async fetchAlertData(filters: APIFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters.studentId) params.append('studentId', filters.studentId);
    if (filters.alertType) params.append('type', filters.alertType);
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        filters.status.forEach(status => params.append('status', status));
      } else {
        params.append('status', filters.status);
      }
    }
    const res = await fetch(getApiUrl(`/api/data/alerts?${params.toString()}`));
    const alerts = await res.json();
    return { alerts, total: alerts.length };
  }

  private async fetchAttendanceData(filters: APIFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters.studentId) params.append('studentId', filters.studentId);
    // Add more filters as needed
    // If no filters, fetch all attendance records
    const url = params.toString()
      ? getApiUrl(`/api/data/attendance?${params.toString()}`)
      : getApiUrl('/api/data/attendance');
    const res = await fetch(url);
    const attendance = await res.json();
    return { attendance, total: attendance.length };
  }

  private async fetchStudentData(filters: APIFilters): Promise<any> {
    // Support multi-class queries
    let students: any[] = [];
    if (Array.isArray(filters.classNames) && filters.classNames.length > 0) {
      // Fetch students for each class and merge
      const results = await Promise.all(
        filters.classNames.map((className: string) =>
          fetch(getApiUrl(`/api/data/students?class=${encodeURIComponent(className)}`)).then(res => res.json())
        )
      );
      // Flatten and dedupe by studentId
      const allStudents = results.flat();
      const seen = new Set();
      students = allStudents.filter((s: any) => {
        const key = s.studentId || s.id || `${s.firstName}_${s.lastName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else {
      // Single class or no class filter
      const params = new URLSearchParams();
      if (filters.className) params.append('class', filters.className);
      if (filters.studentId) params.append('studentId', filters.studentId);
      const res = await fetch(getApiUrl(`/api/data/students?${params.toString()}`));
      students = await res.json();
    }
    return { students, total: students.length };
  }

  private async fetchGeneralData(filters: APIFilters): Promise<any> {
    // Fetch all classes and count students
    const res = await fetch(getApiUrl('/api/data/classes'));
    const classes = await res.json();
    let studentCount = 0;
    for (const className of classes) {
      const sRes = await fetch(getApiUrl(`/api/data/students?class=${encodeURIComponent(className)}`));
      const students = await sRes.json();
      studentCount += students.length;
    }
    const alertsRes = await fetch(getApiUrl('/api/data/alerts'));
    const alerts = await alertsRes.json();
    const activeAlertCount = alerts.filter((a: any) => a.status === 'active').length;
    return {
      studentCount,
      alertCount: alerts.length,
      activeAlertCount
    };
  }

  private async fetchAlertExplanationData(filters: APIFilters): Promise<any> {
    // For now, just fetch alert data (can be extended for more detail)
    return this.fetchAlertData(filters);
  }
  
  /**
   * Generate a natural language response based on the query and data
   * Accepts optional context for direct LLM injection
   */
  private async generateResponse(
    query: string, 
    intent: QueryIntent, 
    data: any,
    contextOverride?: string,
    filters?: APIFilters
  ): Promise<RAGResponse> {
    if (intent === 'STUDENT_QUERY' && data?.students && Array.isArray(data.students) && data.students.length > 0) {
      const targetClass = this.resolveTargetClass(filters, query, data.students);
      if (targetClass) {
        const classSpecificStudents = data.students.filter((student: any) => {
          const studentClass = (student.className || student.classId || student.class)?.toString().toLowerCase();
          return studentClass ? studentClass === targetClass.toLowerCase() : true;
        });
        const studentsForSummary = classSpecificStudents.length > 0 ? classSpecificStudents : data.students;
        return this.buildClassStudentSummary(targetClass, studentsForSummary);
      }
    }

    try {
      const llmService = getLLMService();
      let fullContext = contextOverride !== undefined ? contextOverride : `Query intent: ${intent}`;
      // Prepare LLMRequest with structured data
      const llmRequest: LLMRequest = {
        query,
        context: fullContext,
        queryContext: this.mapIntentToQueryContext(intent),
        attendanceData: data.attendance || data.attendanceRecords || data.records || [],
        alertData: data.alerts || [],
        ...(intent === 'STUDENT_QUERY' && data.students ? { students: data.students } : {})
      };
      console.log('[RAGService] Sending request to LLM service:', {
        query,
        intent,
        dataSize: JSON.stringify(data).length,
      });
      // Process query using LLM service
      const llmResponse = await llmService.processQuery(llmRequest);
      console.log('[RAGService] Received LLM response with confidence:', llmResponse.confidence);
      // Convert LLM response to RAG response format
      return this.convertLLMResponseToRAGResponse(llmResponse, data);
    } catch (error) {
      console.error('[RAGService] Error generating response with LLM:', error);
      // Fall back to template-based responses if LLM fails
      console.log('[RAGService] Falling back to template responses');
      switch (intent) {
        case 'ALERT_QUERY':
          return this.generateAlertQueryResponse(query, data);
        case 'ALERT_EXPLANATION':
          return this.generateAlertExplanationResponse(query, data);
        case 'ATTENDANCE_QUERY':
          return this.generateAttendanceQueryResponse(query, data);
        case 'STUDENT_QUERY':
          return this.generateStudentQueryResponse(query, data);
        default:
          return this.generateGeneralQueryResponse(query, data);
      }
    }
  }
  
  /**
   * Generate response for alert queries
   */
  private async generateAlertQueryResponse(query: string, data: any): Promise<RAGResponse> {
    const { alerts, total } = data;
    
    if (total === 0) {
      return {
        naturalLanguageAnswer: "I don't see any active alerts that require intervention at this time.",
        structuredData: data,
        confidence: 0.9
      };
    }
    
    // Group by alert types for summary
    const byType: Record<string, any[]> = {};
    alerts.forEach((alert: any) => {
      if (!byType[alert.type]) {
        byType[alert.type] = [];
      }
      byType[alert.type].push(alert);
    });
    
    // Generate summary text
    let answer = `Based on current attendance records, there are ${total} active alerts that require intervention:\n\n`;
    
    Object.entries(byType).forEach(([type, typeAlerts]) => {
      answer += `• ${typeAlerts.length} ${type} alerts:\n`;
      
      typeAlerts.slice(0, 5).forEach((alert: any) => {
        const student = alert.student;
        answer += `  - ${student.firstName} ${student.lastName}: ${alert.type} (created ${new Date(alert.createdAt).toLocaleDateString()})\n`;
      });
      
      if (typeAlerts.length > 5) {
        answer += `  - and ${typeAlerts.length - 5} more\n`;
      }
      
      answer += '\n';
    });
    
    // Add suggested actions
    const actions: SuggestedAction[] = [
      {
        type: 'VIEW_ALERTS',
        label: 'View All Alerts',
        params: {}
      }
    ];
    
    if (total > 0) {
      actions.push({
        type: 'SEND_NOTIFICATION',
        label: 'Send Parent Notifications',
        params: { alertIds: alerts.map((a: any) => a.id) }
      });
    }
    
    return {
      naturalLanguageAnswer: answer,
      structuredData: data,
      actions,
      confidence: 0.9
    };
  }
  
  /**
   * Generate response explaining why an alert was triggered
   */
  private async generateAlertExplanationResponse(query: string, data: any): Promise<RAGResponse> {
    const { alerts } = data;
    
    if (alerts.length === 0) {
      return {
        naturalLanguageAnswer: "I couldn't find any alerts that match your query.",
        structuredData: data,
        confidence: 0.7
      };
    }
    
    // For explanation queries, focus on just one alert (the first matching one)
    const alert = alerts[0];
    const student = alert.student;
    const threshold = alert.threshold;
    const pattern = alert.attendancePattern;
    
    let answer = `${student.firstName} ${student.lastName} needs intervention because `;
    
    // Explain based on the alert type and threshold
    if (alert.type === 'ABSENCE') {
      answer += `they have ${pattern.recentAbsences} recent absences, `;
      if (threshold) {
        answer += `which exceeds the threshold of ${threshold.count} absences within a ${threshold.period} timeframe.`;
      } else {
        answer += `which requires attention according to school attendance policy.`;
      }
    } else if (alert.type === 'LATE') {
      answer += `they have ${pattern.recentLates} recent late arrivals, `;
      if (threshold) {
        answer += `which exceeds the threshold of ${threshold.count} lates within a ${threshold.period} timeframe.`;
      } else {
        answer += `which requires attention according to school attendance policy.`;
      }
    } else {
      answer += `there is an attendance concern that requires follow-up.`;
    }
    
    // Add context about when the alert was created
    answer += `\n\nThis alert was created on ${new Date(alert.createdAt).toLocaleDateString()}.`;
    
    // Add relevant actions
    const actions: SuggestedAction[] = [
      {
        type: 'VIEW_STUDENT',
        label: `View ${student.firstName}'s Profile`,
        params: { studentId: student.id }
      },
      {
        type: 'SCHEDULE_MEETING',
        label: 'Schedule Parent Meeting',
        params: { studentId: student.id, alertId: alert.id }
      }
    ];
    
    return {
      naturalLanguageAnswer: answer,
      structuredData: data,
      actions,
      confidence: 0.85
    };
  }
  
  /**
   * Generate response for attendance queries
   */
  private async generateAttendanceQueryResponse(query: string, data: any): Promise<RAGResponse> {
    const { records, byStudent, total } = data;
    
    if (total === 0) {
      return {
        naturalLanguageAnswer: "I couldn't find any attendance records matching your query.",
        structuredData: data,
        confidence: 0.8
      };
    }
    
    // Get the status type from the query
    const lowerQuery = query.toLowerCase();
    const isAbsentQuery = lowerQuery.includes('absent');
    const isLateQuery = lowerQuery.includes('late');
    const statusType = isAbsentQuery ? 'absent' : (isLateQuery ? 'late' : 'attendance');
    
    // Generate summary
    let answer = `I found ${total} ${statusType} records `;
    
    // Add date context if available
    if (records.length > 0) {
      const dates = records.map((r: any) => new Date(r.dateISO));
      const minDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())));
      
      if (minDate.toDateString() === maxDate.toDateString()) {
        answer += `for ${minDate.toLocaleDateString()}.`;
      } else {
        answer += `from ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}.`;
      }
    }
    
    // List students with records
    const studentCount = Object.keys(byStudent).length;
    answer += `\n\n${studentCount} student${studentCount !== 1 ? 's' : ''} ${studentCount !== 1 ? 'have' : 'has'} ${statusType} records:\n`;
    
    Object.entries(byStudent)
      .sort((a: [string, any], b: [string, any]) => b[1].records.length - a[1].records.length) // Sort by most records
      .slice(0, 5) // Limit to top 5
      .forEach(([studentId, data]: [string, any]) => {
        const student = data.student;
        const recordCount = data.records.length;
        answer += `• ${student.firstName} ${student.lastName}: ${recordCount} ${statusType} record${recordCount !== 1 ? 's' : ''}\n`;
      });
    
    // Add note if there are more students than shown
    if (studentCount > 5) {
      answer += `• and ${studentCount - 5} more students\n`;
    }
    
    return {
      naturalLanguageAnswer: answer,
      structuredData: data,
      confidence: 0.85
    };
  }
  
  /**
   * Generate response for student queries
   */
  private async generateStudentQueryResponse(query: string, data: any): Promise<RAGResponse> {
    const { students, total } = data;
    
    if (total === 0) {
      return {
        naturalLanguageAnswer: "I couldn't find any students matching your query.",
        structuredData: data,
        confidence: 0.8
      };
    }
    
    // Generate summary
    let answer = `I found ${total} student${total !== 1 ? 's' : ''} matching your query.\n\n`;
    
    // List students
    students.slice(0, 10).forEach((student: Student) => {
      answer += `• ${student.firstName} ${student.lastName} (ID: ${student.id})\n`;
    });
    
    // Add note if there are more students than shown
    if (total > 10) {
      answer += `\nAnd ${total - 10} more students match your query.`;
    }
    
    return {
      naturalLanguageAnswer: answer,
      structuredData: data,
      confidence: 0.85
    };
  }
  
  /**
   * Generate response for general queries
   */
  private async generateGeneralQueryResponse(query: string, data: any): Promise<RAGResponse> {
    // For general queries, provide system overview
    const { studentCount, alertCount, activeAlertCount } = data;
    
    const answer = `Currently, the system has ${studentCount} students and ${activeAlertCount} active alerts that require attention out of ${alertCount} total alerts.`;
    
    return {
      naturalLanguageAnswer: answer,
      structuredData: data,
      confidence: 0.7
    };
  }
  
  private resolveTargetClass(filters: APIFilters | undefined, query: string, students: any[]): string | null {
    if (filters?.classNames && filters.classNames.length === 1) {
      return filters.classNames[0];
    }
    if (filters?.className) {
      return filters.className;
    }
    if (filters?.classNames && filters.classNames.length > 1) {
      return null;
    }
    const classesFromQuery = this.extractClassNamesFromQuery(query);
    if (classesFromQuery.length === 1) {
      return classesFromQuery[0];
    }
    const classTokens = students
      .map((student: any) => (student.className || student.classId || student.class)?.toString())
      .filter((value: any): value is string => Boolean(value));
    const uniqueClasses = Array.from(new Set(classTokens));
    if (uniqueClasses.length === 1) {
      return uniqueClasses[0];
    }
    return null;
  }

  private extractClassNamesFromQuery(query: string): string[] {
    const matches = query.match(/class\s+([a-z0-9]+)/gi);
    if (!matches) return [];
    return matches
      .map(match => {
        const letter = match.match(/class\s+([a-z0-9]+)/i);
        if (!letter || !letter[1]) return null;
        const token = letter[1].toUpperCase();
        return token.length === 1 ? `Class ${token}` : `Class ${token}`;
      })
      .filter((value): value is string => Boolean(value));
  }

  private buildClassStudentSummary(className: string, students: any[]): RAGResponse {
    const normalizedStudents = students.map(student => this.normalizeStudentRecordForSummary(student, className));
    const uniqueStudents = normalizedStudents.filter((student, index, arr) => {
      const key = `${student.studentId}-${student.firstName}-${student.lastName}`;
      return arr.findIndex(other => `${other.studentId}-${other.firstName}-${other.lastName}` === key) === index;
    });
    const totalStudents = uniqueStudents.length;
    const studentsToReport = totalStudents <= 5 ? uniqueStudents : uniqueStudents.slice(0, 5);
    const remaining = totalStudents - studentsToReport.length;

    const headerLine = `Class ${className} currently has ${totalStudents} student${totalStudents !== 1 ? 's' : ''} in the roster.`;
    const introLine = remaining > 0
      ? `Highlighting ${studentsToReport.length} representative student${studentsToReport.length !== 1 ? 's' : ''}; ${remaining} additional student${remaining !== 1 ? 's' : ''} follow the same attendance pattern.`
      : 'Attendance details for each student are listed below.';

    const studentLines = studentsToReport.map(student => {
      const absenceText = student.absences.length > 0
        ? `Absences on ${this.formatAbsenceDates(student.absences as string[])}.`
        : 'No absences recorded.';
      const attendanceRateText = typeof student.attendanceRate === 'number'
        ? `Attendance rate ${this.formatAttendanceRate(student.attendanceRate)}.`
        : null;
      const fragments = [absenceText];
      if (attendanceRateText) fragments.push(attendanceRateText);
      return `- ${student.firstName} ${student.lastName} (${student.studentId}): ${fragments.join(' ')}`;
    });

    const narrativeParts = [headerLine, introLine, ...studentLines];
    if (remaining > 0) {
      narrativeParts.push(`The remaining ${remaining} student${remaining !== 1 ? 's' : ''} currently do not have notable attendance concerns.`);
    }

    return {
      naturalLanguageAnswer: narrativeParts.join('\n'),
      structuredData: {
        className,
        totalStudents,
        students: studentsToReport.map(student => ({
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentId,
          className: student.className,
          grade: student.grade,
          absences: student.absences,
          absenceCount: student.absences.length,
          attendanceRate: student.attendanceRate,
        }))
      },
      actions: [
        {
          type: 'VIEW_STUDENT',
          label: `Review ${className} roster`,
          params: { className }
        }
      ],
      confidence: 0.88
    };
  }

  private normalizeStudentRecordForSummary(student: any, fallbackClass: string) {
    const attendanceRecords = Array.isArray(student.attendance) ? student.attendance : [];
    const absenceDates = attendanceRecords
      .filter((record: any) => {
        if (!record || typeof record.status !== 'string') return false;
        const status = record.status.toUpperCase();
        return status.includes('ABSENT');
      })
      .map((record: any) => record.dateISO || record.dateIso || record.date)
      .filter((date: any): date is string => Boolean(date));

    const absences = Array.from(new Set(absenceDates)).sort();

    const rawRate = student.attendanceRate;
    let attendanceRate: number | null = null;
    if (typeof rawRate === 'number') {
      attendanceRate = rawRate;
    } else if (typeof rawRate === 'string') {
      const parsed = parseFloat(rawRate);
      attendanceRate = Number.isFinite(parsed) ? parsed : null;
    }

    const studentId = student.studentId || student.id || student.uuid || '';

    return {
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      studentId: studentId.toString(),
      className: student.className || student.classId || fallbackClass,
      grade: student.grade ?? null,
      absences,
      attendanceRate
    };
  }

  private formatAbsenceDates(absenceDates: string[]): string {
    if (absenceDates.length === 1) {
      return absenceDates[0];
    }
    if (absenceDates.length === 2) {
      return `${absenceDates[0]} and ${absenceDates[1]}`;
    }
    return `${absenceDates.slice(0, -1).join(', ')}, and ${absenceDates[absenceDates.length - 1]}`;
  }

  private formatAttendanceRate(rate: number): string {
    if (!Number.isFinite(rate)) return '';
    const percentage = rate > 1 ? rate : rate * 100;
    return `${percentage.toFixed(1)}%`;
  }

  /**
   * Extract attendance data from retrieved data for LLM processing
   * Formats data to be more suitable for LLM consumption
   */
  private extractAttendanceDataForLLM(data: any, intent: QueryIntent): any[] {
    if (!data) return [];
    
    // For attendance queries, extract attendance records
    if (intent === 'ATTENDANCE_QUERY' && data.attendanceRecords) {
      return data.attendanceRecords.slice(0, 50); // Limit to avoid token limits
    }
    
    // For student queries, extract attendance for that student
    if (intent === 'STUDENT_QUERY' && data.student && data.student.attendanceRecords) {
      return data.student.attendanceRecords.slice(0, 50);
    }
    
    // Extract any attendance data we find in the object
    if (data.attendance) return data.attendance.slice(0, 50);
    
    return [];
  }
  
  /**
   * Extract alert data from retrieved data for LLM processing
   * Formats data to be more suitable for LLM consumption
   */
  private extractAlertDataForLLM(data: any, intent: QueryIntent): any[] {
    if (!data) return [];
    
    // For alert queries, extract alert details
    if ((intent === 'ALERT_QUERY' || intent === 'ALERT_EXPLANATION') && data.alerts) {
      return data.alerts.slice(0, 20); // Limit to avoid token limits
    }
    
    // For student queries, extract alerts for that student
    if (intent === 'STUDENT_QUERY' && data.student && data.student.alerts) {
      return data.student.alerts.slice(0, 20);
    }
    
    // Extract any alert data we find in the object
    if (data.alerts) return data.alerts.slice(0, 20);
    
    return [];
  }
  
  /**
   * Post-process LLM response to generate a concise, user-friendly summary for any response
   */
  private summarizeLLMResponse(llmResponse: any, originalData: any): string {
    // If alert data, use alert summary
    const alerts = (llmResponse.structuredData?.alerts && Array.isArray(llmResponse.structuredData.alerts))
      ? llmResponse.structuredData.alerts
      : (originalData?.alerts && Array.isArray(originalData.alerts) ? originalData.alerts : []);
    if (alerts.length) {
      const byClass: Record<string, any[]> = {};
      alerts.forEach((alert: any) => {
        const classId = alert.classId || 'Unknown Class';
        if (!byClass[classId]) byClass[classId] = [];
        byClass[classId].push(alert);
      });
      const classNames = Object.keys(byClass);
      const total = alerts.length;
      let summary = `There are ${total} students with active attendance alerts across ${classNames.length > 1 ? 'Classes ' + classNames.join(', ') : 'Class ' + classNames[0]}.`;
      classNames.forEach((classId) => {
        const classAlerts = byClass[classId];
        classAlerts.sort((a, b) => (b.alertMessage?.match(/(\d+)/)?.[0] || 0) - (a.alertMessage?.match(/(\d+)/)?.[0] || 0));
        const top = classAlerts.slice(0, 3);
        const names = top.map(a => a.studentName || (a.student ? `${a.student.firstName} ${a.student.lastName}` : 'Unknown')).join(', ');
        summary += ` In ${classId}, ${names}${top.length === 3 ? ', and others' : ''} have triggered alerts due to multiple absences`;
        if (top[0]?.alertMessage) {
          const match = top[0].alertMessage.match(/Absent (\d+) times/);
          if (match) summary += ` (top: ${top[0].studentName} with ${match[1]} absences)`;
        }
        summary += '.';
      });
      summary += ' Please review the full alert list for details.';
      return summary;
    } else if (llmResponse.structuredData?.alerts || originalData?.alerts) {
      return 'No alerts were found matching your query.';
    }
    // If student data, summarize students
    const students = llmResponse.structuredData?.students || llmResponse.students || originalData?.students || [];
    if (students.length) {
      const total = students.length;
      const names = students.slice(0, 3).map((s: any) => `${s.firstName} ${s.lastName}`).join(', ');
      let summary = `The system currently tracks ${total} student${total !== 1 ? 's' : ''}`;
      if (total > 3) {
        summary += `, including ${names}, and others.`;
      } else {
        summary += `: ${names}.`;
      }
      summary += ' Each student record includes ID, absences, tardiness, and attendance rate.';
      return summary;
    } else if (llmResponse.structuredData?.students || llmResponse.students || originalData?.students) {
      return 'No students were found matching your query.';
    }
    // If attendance data, summarize attendance
    if (llmResponse.structuredData?.attendance || originalData?.attendance) {
      const attendance = llmResponse.structuredData?.attendance || originalData?.attendance || [];
      if (!attendance.length) return 'No attendance records were found matching your query.';
      const total = attendance.length;
      let summary = `There are ${total} attendance records available.`;
      return summary;
    }
    // Fallback: return LLM's answer
    return llmResponse.naturalLanguageAnswer;
  }

  private convertLLMResponseToRAGResponse(llmResponse: any, originalData: any): RAGResponse {
    const actions = Array.isArray(llmResponse.suggestedActions)
      ? llmResponse.suggestedActions.map((action: string) => {
          const actionType = this.inferActionTypeFromText(action);
          return {
            type: actionType,
            label: action,
            params: {}
          };
        })
      : [];
    // Inject students into structuredData if missing or empty but present in originalData
    let structuredData = llmResponse.structuredData || {};
    if (originalData?.students && Array.isArray(originalData.students) && originalData.students.length > 0) {
      if (!structuredData.students || !Array.isArray(structuredData.students) || structuredData.students.length === 0) {
        structuredData = { ...structuredData, students: originalData.students };
      }
    }
    // Inject alerts into structuredData if missing or empty but present in originalData
    if (originalData?.alerts && Array.isArray(originalData.alerts) && originalData.alerts.length > 0) {
      if (!structuredData.alerts || !Array.isArray(structuredData.alerts) || structuredData.alerts.length === 0) {
        structuredData = { ...structuredData, alerts: originalData.alerts };
      }
    }
    // Always summarize for user-friendly output
    return {
      naturalLanguageAnswer: this.summarizeLLMResponse({ ...llmResponse, structuredData }, originalData),
      structuredData,
      actions,
      confidence: llmResponse.confidence
    };
  }
  
  /**
   * Infer action type from text description
   */
  private inferActionTypeFromText(actionText: string): 'VIEW_STUDENT' | 'SEND_NOTIFICATION' | 'SCHEDULE_MEETING' | 'VIEW_ALERTS' {
    const text = actionText.toLowerCase();
    
    if (text.includes('view student') || text.includes('check student')) {
      return 'VIEW_STUDENT';
    }
    
    if (text.includes('notification') || text.includes('notify') || text.includes('email') || text.includes('message')) {
      return 'SEND_NOTIFICATION';
    }
    
    if (text.includes('meeting') || text.includes('schedule') || text.includes('appointment')) {
      return 'SCHEDULE_MEETING';
    }
    
    // Default to VIEW_ALERTS for anything else
    return 'VIEW_ALERTS';
  }
  
  /**
   * Map query intent to appropriate system prompt context
   * @param intent The classified intent of the query
   * @returns Context string for system prompt selection
   */
  private mapIntentToQueryContext(intent: QueryIntent): string {
    switch (intent) {
      case 'ALERT_QUERY':
      case 'ALERT_EXPLANATION':
        return 'alert';
        
      case 'ATTENDANCE_QUERY':
      case 'STUDENT_QUERY':
        return 'general';
        
      case 'GENERAL_QUERY':
      default:
        return 'general';
    }
  }
}
