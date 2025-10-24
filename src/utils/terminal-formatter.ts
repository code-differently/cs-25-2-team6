/**
 * Utilities for formatting data for terminal output
 * These functions help present JSON data in a user-friendly tabular format
 */

/**
 * Format alert data as a readable table for terminal output
 * @param alerts Array of alert objects
 * @returns Formatted string with table representation
 */
export function formatAlertsTable(alerts: any[]): string {
  if (!alerts || alerts.length === 0) {
    return 'No alerts found.';
  }

  // Define column headers and widths
  const columns = {
    name: { header: 'STUDENT NAME', width: 25 },
    id: { header: 'ID', width: 10 },
    type: { header: 'ALERT TYPE', width: 20 },
    status: { header: 'STATUS', width: 10 },
    dates: { header: 'RELEVANT DATES', width: 35 },
    details: { header: 'DETAILS', width: 30 }
  };

  // Create header row
  let output = '\n';
  output += `${columns.name.header.padEnd(columns.name.width)} | `;
  output += `${columns.id.header.padEnd(columns.id.width)} | `;
  output += `${columns.type.header.padEnd(columns.type.width)} | `;
  output += `${columns.status.header.padEnd(columns.status.width)} | `;
  output += `${columns.dates.header.padEnd(columns.dates.width)} | `;
  output += `${columns.details.header.padEnd(columns.details.width)}\n`;

  // Create separator row
  output += `${''.padEnd(columns.name.width, '-')} | `;
  output += `${''.padEnd(columns.id.width, '-')} | `;
  output += `${''.padEnd(columns.type.width, '-')} | `;
  output += `${''.padEnd(columns.status.width, '-')} | `;
  output += `${''.padEnd(columns.dates.width, '-')} | `;
  output += `${''.padEnd(columns.details.width, '-')}\n`;

  // Add data rows
  alerts.forEach(alert => {
    const studentName = getStudentName(alert);
    const studentId = alert.studentId || 'N/A';
    const alertType = alert.type || 'Unknown';
    const status = alert.status || 'N/A';
    
    // Get relevant dates
    const relevantDates = getRelevantDates(alert);
    
    // Get threshold information or other details
    const details = getAlertDetails(alert);
    
    // Add the row to the output
    output += `${truncateText(studentName, columns.name.width).padEnd(columns.name.width)} | `;
    output += `${truncateText(studentId, columns.id.width).padEnd(columns.id.width)} | `;
    output += `${truncateText(alertType, columns.type.width).padEnd(columns.type.width)} | `;
    output += `${truncateText(status, columns.status.width).padEnd(columns.status.width)} | `;
    output += `${truncateText(relevantDates, columns.dates.width).padEnd(columns.dates.width)} | `;
    output += `${truncateText(details, columns.details.width).padEnd(columns.details.width)}\n`;
  });

  return output;
}

/**
 * Format student attendance data as a readable table
 * @param students Array of student objects with attendance data
 * @returns Formatted string with table representation
 */
export function formatStudentAttendanceTable(students: any[]): string {
  if (!students || students.length === 0) {
    return 'No student attendance data found.';
  }

  // Define column headers and widths
  const columns = {
    name: { header: 'STUDENT NAME', width: 25 },
    id: { header: 'ID', width: 10 },
    absences: { header: 'ABSENCES', width: 10 },
    tardies: { header: 'TARDIES', width: 10 },
    rate: { header: 'ATT. RATE', width: 10 },
    dates: { header: 'ABSENCE DATES', width: 40 }
  };

  // Create header row
  let output = '\n';
  output += `${columns.name.header.padEnd(columns.name.width)} | `;
  output += `${columns.id.header.padEnd(columns.id.width)} | `;
  output += `${columns.absences.header.padEnd(columns.absences.width)} | `;
  output += `${columns.tardies.header.padEnd(columns.tardies.width)} | `;
  output += `${columns.rate.header.padEnd(columns.rate.width)} | `;
  output += `${columns.dates.header.padEnd(columns.dates.width)}\n`;

  // Create separator row
  output += `${''.padEnd(columns.name.width, '-')} | `;
  output += `${''.padEnd(columns.id.width, '-')} | `;
  output += `${''.padEnd(columns.absences.width, '-')} | `;
  output += `${''.padEnd(columns.tardies.width, '-')} | `;
  output += `${''.padEnd(columns.rate.width, '-')} | `;
  output += `${''.padEnd(columns.dates.width, '-')}\n`;

  // Add data rows
  students.forEach(student => {
    const studentName = getStudentName(student);
    const studentId = student.studentId || student.id || 'N/A';
    const absences = student.totalAbsences || student.absences || '0';
    const tardies = student.totalTardies || student.tardies || student.lateArrivals || '0';
    const rate = student.attendanceRate ? `${(student.attendanceRate * 100).toFixed(1)}%` : 'N/A';
    const dates = getAbsenceDates(student);
    
    // Add the row to the output
    output += `${truncateText(studentName, columns.name.width).padEnd(columns.name.width)} | `;
    output += `${truncateText(studentId, columns.id.width).padEnd(columns.id.width)} | `;
    output += `${truncateText(absences.toString(), columns.absences.width).padEnd(columns.absences.width)} | `;
    output += `${truncateText(tardies.toString(), columns.tardies.width).padEnd(columns.tardies.width)} | `;
    output += `${truncateText(rate, columns.rate.width).padEnd(columns.rate.width)} | `;
    output += `${truncateText(dates, columns.dates.width).padEnd(columns.dates.width)}\n`;
  });

  return output;
}

/**
 * Format general data as a table
 * @param data Array of objects to format as a table
 * @param columns Configuration for table columns
 * @returns Formatted string with table representation
 */
export function formatDataTable(
  data: any[], 
  columns: Record<string, { header: string; width: number; key: string; }>
): string {
  if (!data || data.length === 0) {
    return 'No data found.';
  }

  // Create header row
  let output = '\n';
  Object.values(columns).forEach((col, index) => {
    output += `${col.header.padEnd(col.width)}`;
    output += index < Object.values(columns).length - 1 ? ' | ' : '';
  });
  output += '\n';

  // Create separator row
  Object.values(columns).forEach((col, index) => {
    output += `${''.padEnd(col.width, '-')}`;
    output += index < Object.values(columns).length - 1 ? ' | ' : '';
  });
  output += '\n';

  // Add data rows
  data.forEach(item => {
    Object.values(columns).forEach((col, index) => {
      const value = item[col.key] ?? 'N/A';
      output += `${truncateText(value.toString(), col.width).padEnd(col.width)}`;
      output += index < Object.values(columns).length - 1 ? ' | ' : '';
    });
    output += '\n';
  });

  return output;
}

// Helper functions
function getStudentName(obj: any): string {
  if (obj.firstName && obj.lastName) {
    return `${obj.firstName} ${obj.lastName}`;
  } 
  else if (obj.studentFirstName && obj.studentLastName) {
    return `${obj.studentFirstName} ${obj.studentLastName}`;
  } 
  else if (obj.studentName) {
    return obj.studentName;
  } 
  else if (obj.name) {
    return obj.name;
  } 
  else {
    return 'Unknown Student';
  }
}

function getRelevantDates(alert: any): string {
  if (!alert || !alert.details) return 'N/A';
  
  if (alert.details.absenceDates && alert.details.absenceDates.length > 0) {
    return formatDateList(alert.details.absenceDates);
  } 
  else if (alert.details.tardyDates && alert.details.tardyDates.length > 0) {
    return formatDateList(alert.details.tardyDates);
  } 
  else {
    return 'N/A';
  }
}

function getAbsenceDates(student: any): string {
  if (!student) return 'N/A';
  
  if (student.absenceDates && Array.isArray(student.absenceDates)) {
    return formatDateList(student.absenceDates);
  } 
  else if (student.absences && Array.isArray(student.absences)) {
    return formatDateList(student.absences);
  } 
  else {
    return 'N/A';
  }
}

function getAlertDetails(alert: any): string {
  if (!alert || !alert.details) return 'N/A';
  
  if (alert.details.threshold) {
    return alert.details.threshold;
  } 
  else if (alert.details.currentValue) {
    return alert.details.currentValue;
  } 
  else if (alert.details.pattern) {
    return alert.details.pattern;
  } 
  else {
    return 'N/A';
  }
}

function formatDateList(dates: string[]): string {
  if (!dates || dates.length === 0) return 'N/A';
  
  // If there are more than 3 dates, show the first 3 and indicate there are more
  if (dates.length > 3) {
    const formattedDates = dates.slice(0, 3).join(', ');
    return `${formattedDates}, +${dates.length - 3} more`;
  } else {
    return dates.join(', ');
  }
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  } else {
    return text.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Format JSON data with syntax highlighting for terminal output
 * @param data Any JSON serializable data
 * @returns Formatted string with basic syntax highlighting
 */
export function formatJsonWithHighlighting(data: any): string {
  if (!data) return 'No data available';
  
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  
  // Replace specific patterns with colored text (these classes will be styled in CSS)
  return jsonString
    .replace(/"([^"]+)":/g, '<span class="json-key">$&</span>')
    .replace(/(true|false)/g, '<span class="json-boolean">$&</span>')
    .replace(/\b(\d+)\b/g, '<span class="json-number">$&</span>')
    .replace(/"([^"]*)"(?!:)/g, '<span class="json-string">$&</span>');
}

/**
 * Formats RAG response data for terminal output
 * @param response The RAG response object
 * @returns Formatted string ready for terminal display
 */
export function formatResponseForTerminal(response: any): string {
  if (!response) return 'No response data available.';
  
  let output = '';
  
  // Get the natural language answer
  if (response.naturalLanguageAnswer) {
    output += response.naturalLanguageAnswer;
    output += '\n\n';
  }
  
  // Format structured data as tables when possible
  if (response.structuredData) {
    output += 'DATA:\n';
    
    // Handle alerts data
    if (response.structuredData.alerts && Array.isArray(response.structuredData.alerts)) {
      output += formatAlertsTable(response.structuredData.alerts);
    } 
    // Handle students data
    else if (response.structuredData.students && Array.isArray(response.structuredData.students)) {
      output += formatStudentAttendanceTable(response.structuredData.students);
    }
    // Handle a single student
    else if (response.structuredData.student) {
      output += formatStudentAttendanceTable([response.structuredData.student]);
    }
    // Handle alert data mixed in other objects
    else if (Array.isArray(response.structuredData) && 
             response.structuredData.length > 0 &&
             response.structuredData[0].type &&
             (response.structuredData[0].type.includes('Alert') || 
              response.structuredData[0].studentId)) {
      output += formatAlertsTable(response.structuredData);
    }
    // Generic data formatting with syntax highlighting
    else {
      output += formatJsonWithHighlighting(response.structuredData);
    }
  }
  
  // Add suggested actions if available
  if (response.suggestedActions && response.suggestedActions.length > 0) {
    output += '\n\nSUGGESTED ACTIONS:\n';
    response.suggestedActions.forEach((action: string, index: number) => {
      output += `${index + 1}. ${action}\n`;
    });
  } else if (response.actions && response.actions.length > 0) {
    output += '\n\nSUGGESTED ACTIONS:\n';
    response.actions.forEach((action: any, index: number) => {
      output += `${index + 1}. ${action.label || action}\n`;
    });
  }
  
  return output;
}
