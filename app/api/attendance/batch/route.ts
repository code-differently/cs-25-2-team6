import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Use edge runtime for better Vercel compatibility
export const runtime = 'edge';

// In-memory storage for attendance records (temporary solution)
// TODO: Replace with Supabase once deployment is stable
let attendanceStore: any[] = [];

// Mock students data (same as in students API)
const studentsStore: any[] = [
  { id: 'STU001', firstName: 'Alice', lastName: 'Johnson', grade: '7th' },
  { id: 'STU002', firstName: 'Bob', lastName: 'Smith', grade: '8th' },
  { id: 'STU003', firstName: 'Carol', lastName: 'Davis', grade: '7th' },
  { id: 'STU004', firstName: 'David', lastName: 'Wilson', grade: '9th' },
  { id: 'STU005', firstName: 'Emma', lastName: 'Brown', grade: '8th' }
];

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BatchAttendanceSchema.parse(body);

    // Check for existing attendance records in memory
    const existingRecords = [];
    for (const student of validatedData.students) {
      const existing = attendanceStore.find((record: any) => 
        record.studentId === student.id && record.date === validatedData.date
      );
      
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
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const student of validatedData.students) {
      try {
        // Find student by ID to get their name
        const studentRecord = studentsStore.find((s: any) => s.id === student.id);
        
        if (!studentRecord) {
          results.push({
            studentId: student.id,
            status: 'error',
            error: `Student with ID ${student.id} not found`
          });
          errorCount++;
          continue;
        }

        // Create attendance record
        const attendanceRecord = {
          id: `ATT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          studentId: student.id,
          studentName: `${studentRecord.firstName} ${studentRecord.lastName}`,
          date: validatedData.date,
          status: student.status,
          late: student.late || student.status === 'LATE',
          earlyDismissal: student.earlyDismissal,
          excused: student.status === 'EXCUSED',
          createdAt: new Date().toISOString()
        };

        // Save to in-memory storage
        attendanceStore.push(attendanceRecord);
        
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
//Error handling
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
