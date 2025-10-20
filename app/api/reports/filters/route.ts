import { NextRequest, NextResponse } from 'next/server';
import { FileStudentRepo } from '@/src/persistence/FileStudentRepo';
import { AttendanceStatus } from '@/src/domains/AttendanceStatus';

const studentRepo = new FileStudentRepo();

export async function GET(request: NextRequest) {
  try {
// Get all students for name filtering options
    const allStudents = studentRepo.allStudents();
    
// Create student name options
    const studentOptions = allStudents.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName
    }));
    

    studentOptions.sort((a, b) => a.name.localeCompare(b.name));
    
    // Get available attendance status options
    const statusOptions = Object.values(AttendanceStatus).map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      description: getStatusDescription(status)
    }));
    
    return NextResponse.json({
      success: true,
      filters: {
        students: {
          total: studentOptions.length,
          options: studentOptions
        },
        statuses: {
          total: statusOptions.length,
          options: statusOptions
        },
        dateRanges: {
          presets: [
            { value: 'today', label: 'Today', days: 0 },
            { value: 'week', label: 'This Week', days: 7 },
            { value: 'month', label: 'This Month', days: 30 },
            { value: 'quarter', label: 'This Quarter', days: 90 },
            { value: 'semester', label: 'This Semester', days: 180 },
            { value: 'year', label: 'This Year', days: 365 }
          ]
        }
      },
      metadata: {
        totalStudents: allStudents.length,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Filter Options API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch filter options',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getStatusDescription(status: AttendanceStatus): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return 'Student was present and on time';
    case AttendanceStatus.ABSENT:
      return 'Student was not present';
    case AttendanceStatus.LATE:
      return 'Student arrived late';
    case AttendanceStatus.EXCUSED:
      return 'Student absence was excused';
    default:
      return 'Unknown status';
  }
}
