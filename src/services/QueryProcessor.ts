/**
 * Query processor for converting natural language to structured filters.
 * Handles intent classification and entity extraction.
 */
import { extractKeywords, containsAnyKeyword, normalizeText } from '../utils/embeddings';

// Types for query processing
export type QueryIntent = 
  | 'ATTENDANCE_QUERY' 
  | 'ALERT_QUERY' 
  | 'ALERT_EXPLANATION' 
  | 'STUDENT_QUERY' 
  | 'GENERAL_QUERY';

export interface APIFilters {
  studentId?: string;
  studentName?: string;
  status?: string | string[];
  dateRange?: {
    start: string;
    end: string;
  };
  alertStatus?: string;
  alertType?: string;
  interventionNeeded?: boolean;
  [key: string]: any;
}

export interface DateRange {
  start: string;
  end: string;
}

export class QueryProcessor {
  /**
   * Classifies the query intent based on keywords and patterns
   */
  classifyQuery(query: string): QueryIntent {
    const lowerQuery = query.toLowerCase();
    
    // Alert explanation queries
    if ((lowerQuery.includes('why') || lowerQuery.includes('explain') || lowerQuery.includes('reason')) && 
        (lowerQuery.includes('alert') || lowerQuery.includes('intervention') || lowerQuery.includes('meeting'))) {
      return 'ALERT_EXPLANATION';
    }
    
    // Alert identification queries
    if (lowerQuery.includes('parent meeting') || lowerQuery.includes('intervention') || 
        lowerQuery.includes('alert') || lowerQuery.includes('needs attention')) {
      return 'ALERT_QUERY';
    }
    
    // Attendance queries
    if (lowerQuery.includes('late') || lowerQuery.includes('absent') || lowerQuery.includes('attendance')) {
      return 'ATTENDANCE_QUERY';
    }
    
    // Student queries
    if (lowerQuery.includes('student') || lowerQuery.includes('who') || lowerQuery.includes('which')) {
      return 'STUDENT_QUERY';
    }
    
    return 'GENERAL_QUERY';
  }
  
  /**
   * Extracts student name from query if present
   */
  extractStudentName(query: string): string | null {
    // This is a simplistic approach - in a real system you'd use NER
    const normalized = normalizeText(query);
    const words = normalized.split(' ');
    
    // Look for name patterns (capitalized words that aren't at the start of sentences)
    // This is just a placeholder - real implementation would be more sophisticated
    return null;
  }
  
  /**
   * Convert natural language query to API filters
   */
  async queryToFilters(query: string, intent: QueryIntent): Promise<APIFilters> {
    const filters: APIFilters = {};
    const lowerQuery = query.toLowerCase();
    
    // Extract time frames
    if (lowerQuery.includes('today')) {
      filters.dateRange = this.getCurrentDay();
    } else if (lowerQuery.includes('this week') || lowerQuery.includes('current week')) {
      filters.dateRange = this.getCurrentWeek();
    } else if (lowerQuery.includes('this month')) {
      filters.dateRange = this.getCurrentMonth();
    } else if (lowerQuery.includes('year') || lowerQuery.includes('annual')) {
      filters.dateRange = this.getCurrentYear();
    }
    
    // Extract attendance status
    if (lowerQuery.includes('late')) {
      filters.status = 'LATE';
    } else if (lowerQuery.includes('absent')) {
      filters.status = 'ABSENT';
    } else if (lowerQuery.includes('present')) {
      filters.status = 'PRESENT';
    }
    
    // Extract alert-specific filters
    if (intent === 'ALERT_QUERY' || intent === 'ALERT_EXPLANATION') {
      filters.interventionNeeded = true;
      
      if (lowerQuery.includes('parent')) {
        filters.alertType = 'PARENT_MEETING';
      }
      
      if (lowerQuery.includes('urgent')) {
        filters.alertStatus = 'URGENT';
      }
    }
    
    // Extract student name if any
    const studentName = this.extractStudentName(query);
    if (studentName) {
      filters.studentName = studentName;
    }
    
    return filters;
  }
  
  /**
   * Helper functions to generate date ranges
   */
  getCurrentDay(): DateRange {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    
    return {
      start: today,
      end: today
    };
  }
  
  getCurrentWeek(): DateRange {
    const now = new Date();
    const day = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Get Monday (or Sunday depending on preference) of current week
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); // Adjust to Monday
    
    // Get Sunday (or Saturday) of current week
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10)
    };
  }
  
  getCurrentMonth(): DateRange {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // First day of current month
    const startDate = new Date(year, month, 1);
    
    // Last day of current month
    const endDate = new Date(year, month + 1, 0);
    
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10)
    };
  }
  
  getCurrentYear(): DateRange {
    const now = new Date();
    const year = now.getFullYear();
    
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    };
  }
}
