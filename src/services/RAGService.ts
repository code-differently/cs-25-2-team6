/**
 * RAG Service for processing natural language queries about attendance and alerts.
 * This service orchestrates query processing, data retrieval, and response generation.
 */
import { QueryProcessor, QueryIntent, APIFilters } from './QueryProcessor';
import { calculateSimilarity, extractKeywords } from '../utils/embeddings';
import { FileAlertRepo } from '../persistence/FileAlertRepo';
import { FileStudentRepo } from '../persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../persistence/FileAttendanceRepo';
import { Student } from '../persistence/FileStudentRepo';
import { AttendanceAlert, AlertStatus } from '../domains/AttendanceAlert';

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

export class RAGService {
  private queryProcessor: QueryProcessor;
  private alertRepo: FileAlertRepo;
  private studentRepo: FileStudentRepo;
  private attendanceRepo: FileAttendanceRepo;
  
  constructor() {
    this.queryProcessor = new QueryProcessor();
    this.alertRepo = new FileAlertRepo();
    this.studentRepo = new FileStudentRepo();
    this.attendanceRepo = new FileAttendanceRepo();
  }
  
  /**
   * Main entry point for processing natural language queries
   */
  async processQuery(query: string): Promise<RAGResponse> {
    // 1. Classify query intent
    const intent = this.queryProcessor.classifyQuery(query);
    
    // 2. Convert to API filters
    const filters = await this.queryProcessor.queryToFilters(query, intent);
    
    // 3. Fetch data based on intent
    const data = await this.fetchRelevantData(intent, filters);
    
    // 4. Generate natural language response
    const response = await this.generateResponse(query, intent, data);
    
    return response;
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
  
  /**
   * Fetch data about alerts requiring intervention
   */
  private async fetchAlertData(filters: APIFilters): Promise<any> {
    // Get active alerts
    let alerts = this.alertRepo.getFilteredAlerts({
      status: [AlertStatus.ACTIVE]
    });
    
    // Apply additional filters if provided
    if (filters.studentId) {
      alerts = alerts.filter(alert => alert.studentId === filters.studentId);
    }
    
    if (filters.alertType) {
      alerts = alerts.filter(alert => alert.type === filters.alertType);
    }
    
    // Enrich with student data
    const students = this.studentRepo.allStudents();
    const enrichedAlerts = alerts.map(alert => {
      const student = students.find(s => s.id === alert.studentId);
      return {
        ...alert,
        student: student ? student : { firstName: 'Unknown', lastName: 'Student' }
      };
    });
    
    return { alerts: enrichedAlerts, total: enrichedAlerts.length };
  }
  
  /**
   * Fetch data explaining why a specific alert was triggered
   */
  private async fetchAlertExplanationData(filters: APIFilters): Promise<any> {
    // Get the alert data
    const alertData = await this.fetchAlertData(filters);
    
    // For each alert, get the threshold that triggered it and the attendance pattern
    const enrichedAlertData = {
      ...alertData,
      alerts: await Promise.all(alertData.alerts.map(async (alert: any) => {
        // Get the threshold that triggered this alert
        const threshold = this.alertRepo.getThresholdById(alert.thresholdId);
        
        // Get recent attendance for this student to provide context
        const attendanceRecords = this.attendanceRepo.allAttendance().filter(
          record => record.studentId === alert.studentId
        );
        
        // Calculate some stats about the attendance pattern
        const recentAttendance = attendanceRecords.slice(-30); // Last 30 records
        const absences = recentAttendance.filter((a: any) => a.status === 'ABSENT').length;
        const lates = recentAttendance.filter((a: any) => a.status === 'LATE').length;
        
        return {
          ...alert,
          threshold,
          attendancePattern: {
            recentAbsences: absences,
            recentLates: lates,
            totalRecords: recentAttendance.length
          }
        };
      }))
    };
    
    return enrichedAlertData;
  }
  
  /**
   * Fetch attendance data
   */
  private async fetchAttendanceData(filters: APIFilters): Promise<any> {
    // Get attendance records with basic filtering
    let attendanceRecords = this.attendanceRepo.allAttendance();
    
    // Apply date range filters if provided
    if (filters.dateRange) {
      attendanceRecords = attendanceRecords.filter((record: any) => {
        const recordDate = new Date(record.dateISO);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    // Apply status filters if provided
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      attendanceRecords = attendanceRecords.filter((record: any) => 
        statusArray.includes(record.status)
      );
    }
    
    // Apply student filter if provided
    if (filters.studentId) {
      attendanceRecords = attendanceRecords.filter((record: any) => 
        record.studentId === filters.studentId
      );
    }
    
    // Group by student for easier processing
    const students = this.studentRepo.allStudents();
    const byStudent: Record<string, any> = {};
    
    attendanceRecords.forEach((record: any) => {
      if (!byStudent[record.studentId]) {
        const student = students.find(s => s.id === record.studentId);
        byStudent[record.studentId] = {
          student: student || { firstName: 'Unknown', lastName: 'Student', id: record.studentId },
          records: []
        };
      }
      byStudent[record.studentId].records.push(record);
    });
    
    return {
      byStudent,
      records: attendanceRecords,
      total: attendanceRecords.length
    };
  }
  
  /**
   * Fetch student data
   */
  private async fetchStudentData(filters: APIFilters): Promise<any> {
    // Get all students
    let students = this.studentRepo.allStudents();
    
    // Apply filters if provided
    if (filters.studentName) {
      const nameParts = filters.studentName.toLowerCase().split(' ');
      students = students.filter(student => 
        nameParts.some(part => 
          student.firstName.toLowerCase().includes(part) || 
          student.lastName.toLowerCase().includes(part)
        )
      );
    }
    
    if (filters.studentId) {
      students = students.filter(student => student.id === filters.studentId);
    }
    
    return { students, total: students.length };
  }
  
  /**
   * Fetch general data (fallback)
   */
  private async fetchGeneralData(filters: APIFilters): Promise<any> {
    // For general queries, provide a summary of the system state
    const students = this.studentRepo.allStudents();
    const alerts = this.alertRepo.getAllAlerts();
    const activeAlerts = alerts.filter(alert => alert.status === AlertStatus.ACTIVE);
    
    return {
      studentCount: students.length,
      alertCount: alerts.length,
      activeAlertCount: activeAlerts.length
    };
  }
  
  /**
   * Generate a natural language response based on the query and data
   */
  private async generateResponse(
    query: string, 
    intent: QueryIntent, 
    data: any
  ): Promise<RAGResponse> {
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
}
