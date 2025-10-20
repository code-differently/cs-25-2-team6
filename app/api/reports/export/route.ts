import { NextRequest, NextResponse } from 'next/server';
import { FileStudentRepo } from '@/src/persistence/FileStudentRepo';
import { FileAttendanceRepo } from '@/src/persistence/FileAttendanceRepo';
import { AttendanceStatus } from '@/src/domains/AttendanceStatus';
import { AttendanceRecord } from '@/src/domains/AttendanceRecords';

const studentRepo = new FileStudentRepo();
const attendanceRepo = new FileAttendanceRepo();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
// Extract filter parameters the same as reports route
    const studentName = searchParams.get('studentName') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const status = searchParams.get('status') || '';
    const format = searchParams.get('format') || 'csv';
    
// same logic as reports route
    const allRecords = attendanceRepo.allAttendance();
    const allStudents = studentRepo.allStudents();
    let filteredRecords = allRecords;
    
// Apply filters
    if (studentName) {
      const matchingStudents = allStudents.filter(student => 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentName.toLowerCase())
      );
      const studentIds = matchingStudents.map(s => s.id);
      filteredRecords = filteredRecords.filter((record: AttendanceRecord) => 
        studentIds.includes(record.studentId)
      );
    }
    
    if (dateFrom) {
      filteredRecords = filteredRecords.filter((record: AttendanceRecord) => 
        record.dateISO >= dateFrom
      );
    }
    
    if (dateTo) {
      filteredRecords = filteredRecords.filter((record: AttendanceRecord) => 
        record.dateISO <= dateTo
      );
    }
    
    if (status && Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
      filteredRecords = filteredRecords.filter((record: AttendanceRecord) => 
        record.status === status
      );
    }
    
// update records with student information
    const enhancedRecords = filteredRecords.map((record: AttendanceRecord) => {
      const student = allStudents.find(s => s.id === record.studentId);
      return {
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        date: record.dateISO,
        status: record.status,
        late: record.late ? 'Yes' : 'No',
        earlyDismissal: record.earlyDismissal ? 'Yes' : 'No',
        excused: record.excused ? 'Yes' : 'No'
      };
    });
    
   
    enhancedRecords.sort((a: any, b: any) => {
      const nameCompare = a.studentName.localeCompare(b.studentName);
      if (nameCompare !== 0) return nameCompare;
      return a.date.localeCompare(b.date);
    });
    
    // Generate export format
    if (format === 'csv') {
      const csvContent = generateCSV(enhancedRecords);
      const filename = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    if (format === 'json') {
      const filename = `attendance-report-${new Date().toISOString().split('T')[0]}.json`;
      
      return new NextResponse(JSON.stringify({
        exportDate: new Date().toISOString(),
        filters: {
          studentName: studentName || null,
          dateFrom: dateFrom || null,
          dateTo: dateTo || null,
          status: status || null
        },
        totalRecords: enhancedRecords.length,
        data: enhancedRecords
      }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }
    
 // CSV default formatting 
    const csvContent = generateCSV(enhancedRecords);
    const filename = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Export API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export attendance report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateCSV(records: any[]): string {
  if (records.length === 0) {
    return 'No data available for export';
  }
  //CSV structure

  const headers = ['Student Name', 'Date', 'Status', 'Late', 'Early Dismissal', 'Excused'];
  
 
  const rows = records.map(record => [
    `"${record.studentName}"`,
    record.date,
    record.status,
    record.late,
    record.earlyDismissal,
    record.excused
  ]);
  
  // Combine headers and rows
  const csvLines = [headers.join(','), ...rows.map(row => row.join(','))];
  
  return csvLines.join('\n');
}
