import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FileStudentRepo } from '@/src/persistence/FileStudentRepo';

// Use standard Node.js runtime for better compatibility
export const runtime = 'nodejs';

const StudentsQuerySchema = z.object({
  search: z.string().optional(), // Search by name
  grade: z.string().optional(),  // Filter by grade
  limit: z.string().regex(/^\d+$/).optional().transform((val: string | undefined) => val ? parseInt(val) : undefined),
  offset: z.string().regex(/^\d+$/).optional().transform((val: string | undefined) => val ? parseInt(val) : undefined)
}).optional();

const CreateStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  grade: z.string().optional()
});

const UpdateStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  grade: z.string().optional()
});

// GET /api/students - Retrieve students with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = StudentsQuerySchema.parse(Object.fromEntries(searchParams));
    
    const studentRepo = new FileStudentRepo();
    let students = studentRepo.allStudents();
    
    // Convert to API format with grade support (fallback to undefined if not available)
    let studentsData = students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      grade: undefined, // Student domain object doesn't have grade yet
      buildingIds: ['MAIN'] // Default building for file-based students
    }));
    
    // Apply search filter
    if (queryParams?.search) {
      const searchTerm = queryParams.search.toLowerCase();
      studentsData = studentsData.filter(student => 
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        student.fullName.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply grade filter (currently not supported by domain model)
    if (queryParams?.grade) {
      // For now, return empty array if grade filtering is requested
      // TODO: Add grade support to Student domain object
      studentsData = [];
    }
    
    // Apply pagination
    const limit = queryParams?.limit || 50;
    const offset = queryParams?.offset || 0;
    const paginatedStudents = studentsData.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedStudents,
      pagination: {
        total: studentsData.length,
        limit,
        offset,
        hasMore: offset + limit < studentsData.length
      }
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    console.error('Students GET API error:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve students'
    }, { status: 500 });
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateStudentSchema.parse(body);
    
    const studentRepo = new FileStudentRepo();
    
    // Generate a unique ID for the new student
    const allStudents = studentRepo.allStudents();
    const nextId = `STU${String(allStudents.length + 1).padStart(3, '0')}`;
    
    // Create student using existing repo method
    const newStudent = {
      id: nextId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName
    };
    
    studentRepo.saveStudent(newStudent);
    
    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      data: {
        id: newStudent.id,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        fullName: `${newStudent.firstName} ${newStudent.lastName}`,
        grade: validatedData.grade || undefined, // Store in response but not in domain yet
        buildingIds: ['MAIN'] // Default building
      }
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid student data',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    console.error('Students POST API error:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create student'
    }, { status: 500 });
  }
}

// PUT /api/students/[id] - Update an existing student  
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_IMPLEMENTED',
    message: 'Student updates not yet implemented'
  }, { status: 501 });
}

// DELETE /api/students/[id] - Delete a student
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_IMPLEMENTED', 
    message: 'Student deletion not yet implemented'
  }, { status: 501 });
}
