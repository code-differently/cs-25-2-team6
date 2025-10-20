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
    
// FILTERS 

    const studentName = searchParams.get('studentName') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const status = searchParams.get('status') || '';
    
  
    const allRecords = attendanceRepo.allAttendance();
    const allStudents = studentRepo.allStudents();
    
    
    let filteredRecords = allRecords;
    

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


    const enhancedRecords = filteredRecords.map((record: AttendanceRecord) => {
      const student = allStudents.find(s => s.id === record.studentId);
      return {
        id: record.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        date: record.dateISO,
        status: record.status,
        late: record.late,
        earlyDismissal: record.earlyDismissal,
        excused: record.excused
      };
    });
    
    // Sort by student name, then date
    enhancedRecords.sort((a: any, b: any) => {
      const nameCompare = a.studentName.localeCompare(b.studentName);
      if (nameCompare !== 0) return nameCompare;
      return a.date.localeCompare(b.date);
    });
    
    return NextResponse.json({
      success: true,
      data: enhancedRecords,
      total: enhancedRecords.length,
      filters: {
        studentName: studentName || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        status: status || null
      }
    });
    
  } catch (error) {
    console.error('Reports API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch attendance reports',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
