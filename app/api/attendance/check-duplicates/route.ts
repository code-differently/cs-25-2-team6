import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Use standard Node.js runtime for better compatibility
export const runtime = 'nodejs';

// In-memory storage 
let attendanceStore: any[] = [];

// Mock students data
const studentsStore: any[] = [
  { id: 'STU001', firstName: 'Alice', lastName: 'Johnson', grade: '7th' },
  { id: 'STU002', firstName: 'Bob', lastName: 'Smith', grade: '8th' },
  { id: 'STU003', firstName: 'Carol', lastName: 'Davis', grade: '7th' },
  { id: 'STU004', firstName: 'David', lastName: 'Wilson', grade: '9th' },
  { id: 'STU005', firstName: 'Emma', lastName: 'Brown', grade: '8th' }
];

// Zod validation schema for duplicate check 
const DuplicateCheckSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  studentIds: z.array(z.string().min(1, "Student ID cannot be empty")).min(1, "At least one student ID required")
});

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { date, studentIds } = DuplicateCheckSchema.parse(body);

    // Check each student for existing attendance and validity
    const duplicates = [];
    const nonExistentStudents = [];

    for (const studentId of studentIds) {
      // Find student in mock data
      const studentRecord = studentsStore.find((s: any) => s.id === studentId);
      
      if (!studentRecord) {
        nonExistentStudents.push(studentId);
        continue;
      }

      // Check for existing attendance record in memory
      const existingRecord = attendanceStore.find((record: any) => 
        record.studentId === studentId && record.date === date
      );
      
      if (existingRecord) {
        duplicates.push({
          studentId: studentId,
          studentName: `${studentRecord.firstName} ${studentRecord.lastName}`,
          existingRecord: {
            status: existingRecord.status,
            late: existingRecord.late,
            earlyDismissal: existingRecord.earlyDismissal,
            excused: existingRecord.excused
          }
        });
      }
    }

   
    return NextResponse.json({
      success: true,
      hasDuplicates: duplicates.length > 0,
      duplicates,
      nonExistentStudents,
      summary: {
        totalChecked: studentIds.length,
        duplicatesFound: duplicates.length,
        invalidStudents: nonExistentStudents.length,
        validNewRecords: studentIds.length - duplicates.length - nonExistentStudents.length
      },
      date
    }, { status: 200 });

  } catch (error) {
    //Error handling
   
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_JSON',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }

    
    console.error('Duplicate check API error:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while checking for duplicates'
    }, { status: 500 });
  }
}


export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'GET method not supported. Use POST to check for duplicate attendance records.'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'PUT method not supported. Use POST to check for duplicate attendance records.'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'DELETE method not supported. Use POST to check for duplicate attendance records.'
  }, { status: 405 });
}
