import { NextRequest, NextResponse } from 'next/server';
import { StudentManagementService } from '../../../../src/services/StudentManagementService';

const service = new StudentManagementService();

export async function GET(req: NextRequest, context: any) {
  const { id } = context.params;
  const student = service.getStudentById(id);
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, context: any) {
  const { id } = context.params;
  const data = await req.json();
  const { student, validation } = await service.updateStudentProfile(id, data);
  if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 400 });
  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params;
  const data = await req.json();
  const { student, validation } = await service.updateStudentProfile(id, data);
  if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 400 });
  return NextResponse.json(student);
}

export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params;
  try {
    const result = await service.deleteStudentProfile(id, { cascade: true });
    if (!result) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
