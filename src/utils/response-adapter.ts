/**
 * Response adapter utilities for converting between different response formats
 * in the application (RAGResponse, LLMResponse, etc.)
 */

import { LLMResponse } from '../services/LLMService';
import { RAGResponse, SuggestedAction } from '../services/RAGService';
import { validateResponse, ResponseSchema } from './context-management';

/**
 * Standard schema for RAGResponse validation
 */
export const RAG_RESPONSE_SCHEMA: ResponseSchema = {
  requiredFields: ['naturalLanguageAnswer', 'confidence'],
  optionalFields: ['structuredData', 'actions'],
  nestedSchemas: {
    actions: {
      requiredFields: ['type', 'label']
    }
  }
};

/**
 * Convert an LLMResponse to a RAGResponse format
 * @param llmResponse The LLM response to convert
 * @returns Converted RAG response
 */
export function adaptLLMToRAGResponse(llmResponse: LLMResponse): RAGResponse {
  // Map suggested actions to SuggestedAction format
  const actions: SuggestedAction[] = llmResponse.suggestedActions
    .filter(actionStr => actionStr && actionStr.trim().length > 0)
    .map((actionStr, index) => {
      // Try to determine action type based on content
      const lowerAction = actionStr.toLowerCase();
      let type: SuggestedAction['type'] = 'VIEW_ALERTS'; // Default type
      
      if (lowerAction.includes('student') || lowerAction.includes('profile')) {
        type = 'VIEW_STUDENT';
      } else if (lowerAction.includes('notification') || lowerAction.includes('message')) {
        type = 'SEND_NOTIFICATION';
      } else if (lowerAction.includes('meeting') || lowerAction.includes('schedule')) {
        type = 'SCHEDULE_MEETING';
      }
      
      return {
        type,
        label: actionStr,
        params: { id: `action-${index + 1}` }
      };
    });
  
  return {
    naturalLanguageAnswer: llmResponse.naturalLanguageAnswer,
    structuredData: llmResponse.structuredData,
    actions,
    confidence: llmResponse.confidence
  };
}

/**
 * Convert a RAGResponse to an LLMResponse format
 * @param ragResponse The RAG response to convert
 * @returns Converted LLM response
 */
/**
 * Enhances a RAG response's natural language answer based on structured data
 * @param response The response to enhance
 * @returns Enhanced response with more detailed natural language answer
 */
export function enhanceNaturalLanguageAnswer(response: RAGResponse): RAGResponse {
  // Create a deep copy of the response
  const enhancedResponse = JSON.parse(JSON.stringify(response)) as RAGResponse;
  
  // Skip enhancement if no structured data is available
  if (!enhancedResponse.structuredData) return enhancedResponse;
  
  // Check if there's student data to enhance
  const studentsData = extractStudentData(enhancedResponse.structuredData);
  if (studentsData.length > 0) {
    // Create a natural language description of student data if not already included
    const studentDescriptions = studentsData.map(student => formatStudentDescription(student));
    
    // Check if these descriptions are already in the natural language answer
    const existingAnswer = enhancedResponse.naturalLanguageAnswer || '';
    const missingDescriptions = studentDescriptions.filter(desc => !existingAnswer.includes(desc.substring(0, 30)));
    
    // Only add missing descriptions
    if (missingDescriptions.length > 0) {
      const studentSummary = missingDescriptions.join('\n\n');
      if (!existingAnswer.includes(studentSummary.substring(0, 30))) {
        enhancedResponse.naturalLanguageAnswer = 
          existingAnswer + 
          (existingAnswer ? '\n\n' : '') + 
          'Additional student details:\n\n' + 
          studentSummary;
      }
    }
  }
  
  // Check if there's alert data to enhance
  const alertsData = extractAlertData(enhancedResponse.structuredData);
  if (alertsData.length > 0) {
    // Create a natural language description of alert data if not already included
    const alertDescriptions = alertsData.map(alert => formatAlertDescription(alert));
    
    // Check if these descriptions are already in the natural language answer
    const existingAnswer = enhancedResponse.naturalLanguageAnswer || '';
    const missingDescriptions = alertDescriptions.filter(desc => !existingAnswer.includes(desc.substring(0, 30)));
    
    // Only add missing descriptions
    if (missingDescriptions.length > 0) {
      const alertSummary = missingDescriptions.join('\n\n');
      if (!existingAnswer.includes(alertSummary.substring(0, 30))) {
        enhancedResponse.naturalLanguageAnswer = 
          existingAnswer + 
          (existingAnswer ? '\n\n' : '') + 
          'Attendance Alerts:\n\n' + 
          alertSummary;
      }
    }
  }
  
  return enhancedResponse;
}

/**
 * Extract student data from structured data
 */
function extractStudentData(structuredData: any): any[] {
  if (!structuredData) return [];
  // Prefer students array, but also extract from alerts if present
  if (Array.isArray(structuredData.students)) {
    return structuredData.students.map((student: any) => ({
      ...student,
      // Ensure ISO format for absence dates
      absenceDates: Array.isArray(student.absenceDates)
        ? student.absenceDates.map((date: string) => new Date(date).toISOString().split('T')[0])
        : [],
    }));
  } else if (Array.isArray(structuredData)) {
    return structuredData.filter((item: any) => item && typeof item === 'object' && (item.studentId || item.studentName));
  } else if (structuredData.student) {
    return [{
      ...structuredData.student,
      absenceDates: Array.isArray(structuredData.student.absenceDates)
        ? structuredData.student.absenceDates.map((date: string) => new Date(date).toISOString().split('T')[0])
        : [],
    }];
  } else if (structuredData.alerts) {
    // Extract student info from alerts
    return structuredData.alerts
      .filter((alert: any) => alert && typeof alert === 'object')
      .map((alert: any) => {
        return {
          studentId: alert.studentId,
          firstName: alert.studentFirstName || (alert.studentName ? alert.studentName.split(' ')[0] : undefined),
          lastName: alert.studentLastName || (alert.studentName ? alert.studentName.split(' ').slice(1).join(' ') : undefined),
          absenceDates: alert.details?.absenceDates?.map((date: string) => new Date(date).toISOString().split('T')[0]) || [],
          alerts: [alert]
        };
      });
  }
  return [];
}

/**
 * Extract alert data from structured data
 */
function extractAlertData(structuredData: any): any[] {
  if (!structuredData) return [];
  
  // Check for various possible formats of alert data
  if (Array.isArray(structuredData.alerts)) {
    return structuredData.alerts;
  } else if (structuredData.alert) {
    return [structuredData.alert];
  } else if (Array.isArray(structuredData)) {
    return structuredData.filter(item => 
      item && typeof item === 'object' && 
      (item.type === 'ABSENCE' || item.type === 'LATENESS' || 
       item.status || item.thresholdId));
  }
  
  return [];
}

/**
 * Format an alert object into a natural language description
 */
function formatAlertDescription(alert: any): string {
  if (!alert) return '';
  const alertType = alert.type || 'attendance';
  const studentId = alert.studentId || 'unknown student';
  const status = alert.status || 'ACTIVE';
  // Format student name
  let studentName = '';
  if (alert.studentFirstName && alert.studentLastName) {
    studentName = `${alert.studentFirstName} ${alert.studentLastName}`;
  } else if (alert.studentName) {
    studentName = alert.studentName;
  } else {
    studentName = `Student ${studentId}`;
  }
  // Start with basic alert information including full name
  let description = `${studentName} (ID: ${studentId}) has triggered an ${alertType.toLowerCase()} alert.`;
  // Add count information if available
  if (typeof alert.count === 'number') {
    description += ` This occurred ${alert.count} time${alert.count !== 1 ? 's' : ''}.`;
  }
  // Add specific absence dates in ISO format if available
  if (alert.details?.absenceDates && alert.details.absenceDates.length > 0) {
    const isoDates = alert.details.absenceDates.map((d: string) => new Date(d).toISOString().split('T')[0]);
    description += ` Absent on: ${isoDates.join(', ')}.`;
  } else if (alert.details?.tardyDates && alert.details.tardyDates.length > 0) {
    const isoDates = alert.details.tardyDates.map((d: string) => new Date(d).toISOString().split('T')[0]);
    description += ` Late on: ${isoDates.join(', ')}.`;
  }
  // Add pattern information if available
  if (alert.details?.pattern) {
    description += ` Pattern identified: ${alert.details.pattern}.`;
  }
  // Add threshold information if available
  if (alert.details?.threshold) {
    description += ` Threshold exceeded: ${alert.details.threshold}.`;
  } else if (alert.thresholdId) {
    description += ` Triggered by threshold ${alert.thresholdId}.`;
  }
  // Add status information
  description += ` Status: ${status.toLowerCase()}.`;
  // Add date information if available
  if (alert.createdAt) {
    const date = new Date(alert.createdAt).toISOString().split('T')[0];
    description += ` Alert created on ${date}.`;
  }
  // Add notification status
  if (typeof alert.notificationSent === 'boolean') {
    description += alert.notificationSent ? ` Notification sent to parents/guardians.` : ` No notification sent yet.`;
  }
  return description.trim();
}

/**
 * Format a student object into a natural language description
 */
function formatStudentDescription(student: any): string {
  if (!student) return '';
  // Get the full name, prioritizing firstName/lastName fields
  let name;
  if (student.firstName && student.lastName) {
    name = `${student.firstName} ${student.lastName}`;
  } else if (student.studentFirstName && student.studentLastName) {
    name = `${student.studentFirstName} ${student.studentLastName}`;
  } else if (student.studentName || student.name || student.fullName) {
    name = student.studentName || student.name || student.fullName;
  } else {
    name = `Student ID: ${student.studentId || student.id || 'unknown'}`;
  }
  // Always include student ID
  const studentId = student.studentId || student.id || 'unknown';
  // Start with the basic information
  let description = `${name} (ID: ${studentId}) is a student`;
  // Add grade level if available
  if (student.grade) {
    description += ` in grade ${student.grade}`;
  }
  // Add class/section if available
  if (student.class || student.section) {
    description += ` in ${student.class || student.section}`;
  }
  // Add attendance information if available
  if (typeof student.attendanceRate === 'number' || student.absences || student.attendance) {
    description += `. Attendance rate: ${typeof student.attendanceRate === 'number' ? (student.attendanceRate * 100).toFixed(1) + '%' : 'N/A'}`;
    if (student.absences) {
      description += `, Total absences: ${student.absences}`;
    }
    if (student.lateArrivals || student.tardies) {
      description += `, Late arrivals: ${student.lateArrivals || student.tardies}`;
    }
  }
  // Add absence dates if available
  if (student.absenceDates && Array.isArray(student.absenceDates) && student.absenceDates.length > 0) {
    const isoDates = student.absenceDates.map((d: string) => new Date(d).toISOString().split('T')[0]);
    description += `. Absent on: ${isoDates.join(', ')}`;
  }
  // Add alert information if available
  if (student.alerts && Array.isArray(student.alerts) && student.alerts.length > 0) {
    description += `. ${student.alerts.length} attendance alert${student.alerts.length > 1 ? 's' : ''} present.`;
    // Add details for the first few alerts
    const alertsToDescribe = student.alerts.slice(0, 2);
    alertsToDescribe.forEach((alert: any, index: number) => {
      if (index === 0) {
        description += ` Example: ${formatAlertDescription(alert)}`;
      } else {
        description += `; ${formatAlertDescription(alert)}`;
      }
    });
  }
  return description.trim();
}

export function adaptRAGToLLMResponse(ragResponse: RAGResponse): LLMResponse {
  return {
    naturalLanguageAnswer: ragResponse.naturalLanguageAnswer,
    structuredData: ragResponse.structuredData || null,
    suggestedActions: ragResponse.actions ? 
      ragResponse.actions.map(action => action.label) : 
      [],
    confidence: ragResponse.confidence
  };
}

/**
 * Validate a RAG response and fix common issues
 * @param response The response to validate and fix
 * @returns Fixed response or original if valid
 */
export function validateAndFixRAGResponse(response: any): RAGResponse {
  // Validate against our schema
  const validation = validateResponse(response, RAG_RESPONSE_SCHEMA);
  
  // If valid, return as is
  if (validation.valid) {
    // Enhance the natural language answer if structured data exists
    if (response.structuredData) {
      try {
        // Ensure the natural language answer fully describes all structured data
        const enhancedResponse = enhanceNaturalLanguageAnswer(response);
        return enhancedResponse;
      } catch (error) {
        console.warn("Error enhancing natural language answer:", error);
        return response as RAGResponse;
      }
    }
    return response as RAGResponse;
  }
  
  // Otherwise, try to fix common issues
  const fixedResponse: RAGResponse = {
    naturalLanguageAnswer: response?.naturalLanguageAnswer || 
      response?.answer || 
      response?.text || 
      response?.content ||
      "I'm sorry, but I couldn't generate a proper response.",
    confidence: typeof response?.confidence === 'number' ? response.confidence : 0.5,
    actions: []
  };
  
  // Add structuredData if available
  if (response?.structuredData) {
    fixedResponse.structuredData = response.structuredData;
  }
  
  // Add actions if available and valid
  if (Array.isArray(response?.actions)) {
    fixedResponse.actions = response.actions
      .filter((action: any) => action && typeof action === 'object' && action.type && action.label)
      .map((action: any) => ({
        type: action.type,
        label: action.label,
        params: action.params || {}
      }));
  } else if (Array.isArray(response?.suggestedActions)) {
    // Try to adapt from suggestedActions format
    fixedResponse.actions = response.suggestedActions
      .filter((action: any) => action && (typeof action === 'string' || (typeof action === 'object' && action.label)))
      .map((action: any, index: number) => {
        if (typeof action === 'string') {
          return {
            type: 'VIEW_ALERTS' as const,
            label: action,
            params: { id: `auto-${index + 1}` }
          };
        } else {
          return {
            type: action.type || 'VIEW_ALERTS' as const,
            label: action.label,
            params: action.params || { id: `auto-${index + 1}` }
          };
        }
      });
  }
  
  return fixedResponse;
}
