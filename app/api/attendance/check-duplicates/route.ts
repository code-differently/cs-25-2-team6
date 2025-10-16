import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FileAttendanceRepo } from '@/src/persistence/FileAttendanceRepo';
import { FileStudentRepo } from '@/src/persistence/FileStudentRepo';

// Zod validation schema for duplicate check 
const DuplicateCheckSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  studentIds: z.array(z.string().min(1, "Student ID cannot be empty")).min(1, "At least one student ID required")
});

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { date, studentIds } = DuplicateCheckSchema.parse(body);

    
    const attendanceRepo = new FileAttendanceRepo();
    const studentRepo = new FileStudentRepo();
    const allStudents = studentRepo.allStudents();

// Check each student for existing attendance and validity
    const duplicates = [];
    const nonExistentStudents = [];

    for (const studentId of studentIds) {
     
      const studentRecord = allStudents.find(s => s.id === studentId);
      
      if (!studentRecord) {
        nonExistentStudents.push(studentId);
        continue;
      }

// Check for existing attendance record
      try {
        const existingRecord = attendanceRepo.findAttendanceBy(studentId, date);
        
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
      } catch (error) {
       
        console.log(`No existing attendance found for student ${studentId} on ${date}`);
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
