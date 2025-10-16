import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FileStudentRepo } from '@/src/persistence/FileStudentRepo';


const StudentsQuerySchema = z.object({
  search: z.string().optional(), // Search by name
  grade: z.string().optional(),  // Filter by grade
  limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : undefined),
  offset: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val) : undefined)
}).optional();

// Validation schema for creating new students 
const CreateStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  grade: z.string().optional(),
  id: z.string().min(1, "Student ID is required")
});

export async function GET(request: NextRequest) {
  try {
    // Parse URL search parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      search: searchParams.get('search') || undefined,
      grade: searchParams.get('grade') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined
    };

    
    const validatedQuery = StudentsQuerySchema.parse(queryParams);

    // Initialize repository
    const studentRepo = new FileStudentRepo();
    const allStudents = studentRepo.allStudents();

    
    let filteredStudents = allStudents;

    // Search filter 
    if (validatedQuery?.search) {
      const searchTerm = validatedQuery.search.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm) ||
        student.id.toLowerCase().includes(searchTerm)
      );
    }

    // Grade filter (optional)
    if (validatedQuery?.grade) {
      filteredStudents = filteredStudents.filter(student => 
        (student as any).grade === validatedQuery.grade
      );
    }

    // Sort students alphabetically by last name, then first name
    filteredStudents.sort((a, b) => {
      const lastNameComparison = a.lastName.localeCompare(b.lastName);
      if (lastNameComparison !== 0) return lastNameComparison;
      return a.firstName.localeCompare(b.firstName);
    });

   
    const limit = validatedQuery?.limit || 100;
    const offset = validatedQuery?.offset || 0;
    const paginatedStudents = filteredStudents.slice(offset, offset + limit);

// Transform data for frontend
    const studentList = paginatedStudents.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      grade: (student as any).grade || undefined
    }));

    
    return NextResponse.json({
      success: true,
      students: studentList,
      pagination: {
        total: filteredStudents.length,
        limit,
        offset,
        hasMore: offset + limit < filteredStudents.length
      }
    }, { status: 200 });

  } catch (error) {

//Error handling
    
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

    
    console.error('Students list API error:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while fetching students'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateStudentSchema.parse(body);

    const studentRepo = new FileStudentRepo();
    
    // Check if student ID already exists 
    const existingStudents = studentRepo.allStudents();
    const existingStudent = existingStudents.find(s => s.id === validatedData.id);
    
    if (existingStudent) {
      return NextResponse.json({
        success: false,
        error: 'DUPLICATE_ID',
        message: 'A student with this ID already exists',
        existingStudent: {
          id: existingStudent.id,
          firstName: existingStudent.firstName,
          lastName: existingStudent.lastName,
          grade: (existingStudent as any).grade || undefined
        }
      }, { status: 409 });
    }

   
    const newStudent: any = {
      id: validatedData.id,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName
    };

    // Add grade (optional)
    if (validatedData.grade) {
      newStudent.grade = validatedData.grade;
    }

    studentRepo.saveStudent(newStudent);

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: newStudent.id,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        fullName: `${newStudent.firstName} ${newStudent.lastName}`,
        grade: newStudent.grade || undefined
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

   
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_JSON',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }

    console.error('Create student API error:', error);
    return NextResponse.json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while creating student'
    }, { status: 500 });
  }
}


export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'PUT method not supported. Use POST to create students or GET to list students.'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'DELETE method not supported. Use individual student endpoints for deletion.'
  }, { status: 405 });
}
