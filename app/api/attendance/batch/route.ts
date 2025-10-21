import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AttendanceService } from '@/src/services/AttendanceService';
import { FileAttendanceRepo } from '@/src/persistence/FileAttendanceRepo';
import { FileStudentRepo } from '@/src/persistence/FileStudentRepo';
import { AttendanceStatus } from '@/src/domains/AttendanceStatus';

// Use standard Node.js runtime for better compatibility  
export const runtime = 'nodejs';

// Zod validation schema for batch attendance request
const BatchAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  students: z.array(z.object({
    id: z.string().min(1, "Student ID is required"),
    status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']),
    late: z.boolean().optional().default(false),
    earlyDismissal: z.boolean().optional().default(false)
  })).min(1, "At least one student must be selected")
});

// Initialize attendance services 
const attendanceService = new AttendanceService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BatchAttendanceSchema.parse(body);

    // Check for existing attendance records 
    const attendanceRepo = new FileAttendanceRepo();
    const existingRecords = [];
    for (const student of validatedData.students) {
      try {
        const existing = attendanceRepo.findAttendanceBy(student.id, validatedData.date);
        if (existing) {
          existingRecords.push({
            studentId: student.id,
            existingStatus: existing.status,
            existingRecord: {
              late: existing.late,
              earlyDismissal: existing.earlyDismissal
            }
          });
        }
      } catch (error) {
        // Student might not exist
        console.warn(`Could not check existing attendance for student ${student.id}:`, error);
      }
    }

    // If duplicates found, return conflict response for teacher confirmation 
    if (existingRecords.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'DUPLICATE_RECORDS_FOUND',
        message: 'Some students already have attendance recorded for this date. Do you want to update their records?',
        duplicates: existingRecords,
        requestData: validatedData 
      }, { status: 409 });
    }

    // Process batch attendance submission
    const studentRepo = new FileStudentRepo();
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const student of validatedData.students) {
      try {
        // Find student by ID to get their name for the service
        const allStudents = studentRepo.allStudents();
        const studentRecord = allStudents.find(s => s.id === student.id);
        
        if (!studentRecord) {
          results.push({
            studentId: student.id,
            status: 'error',
            error: `Student with ID ${student.id} not found`
          });
          errorCount++;
          continue;
        }

        // Use the existing service method 
        const markAttendanceParams = {
          firstName: studentRecord.firstName,
          lastName: studentRecord.lastName,
          dateISO: validatedData.date,
          onTime: student.status === 'PRESENT' && !student.late,
          late: student.late || student.status === 'LATE',
          earlyDismissal: student.earlyDismissal,
          excused: student.status === 'EXCUSED'
        };

        attendanceService.markAttendanceByName(markAttendanceParams);
        
        results.push({
          studentId: student.id,
          status: 'success',
          message: `Attendance marked as ${student.status} for ${studentRecord.firstName} ${studentRecord.lastName}`
        });
        successCount++;

      } catch (error) {
        results.push({
          studentId: student.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch attendance processed: ${successCount} successful, ${errorCount} failed`,
      summary: {
        total: validatedData.students.length,
        successful: successCount,
        failed: errorCount
      },
      results,
      date: validatedData.date
    }, { status: 200 });

  } catch (error) {
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

    console.error('Batch attendance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while processing attendance'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'GET method not supported. Use POST to submit batch attendance.'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED', 
    message: 'PUT method not supported. Use POST to submit batch attendance.'
  }, { status: 405 });
}
