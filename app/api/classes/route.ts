import { NextRequest, NextResponse } from 'next/server';
import { ClassManagementService } from '../../../src/services/ClassManagementService';

const service = new ClassManagementService();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { classData, studentIds } = body;
  const result = await service.createClassWithStudents(classData, studentIds || []);
  if (!result.validation.valid) {
    return NextResponse.json({ errors: result.validation.errors }, { status: 400 });
  }
  return NextResponse.json({ class: result.class });
}

export async function GET(req: NextRequest) {
  const classes = await service.getAllClasses();
  return NextResponse.json({ classes });
}
