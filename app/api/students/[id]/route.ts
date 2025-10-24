import { NextRequest, NextResponse } from 'next/server';
import { StudentManagementService } from '../../../../src/services/StudentManagementService';

const service = new StudentManagementService();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const student = service.getStudentById(params.id);
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const { student, validation } = await service.updateStudentProfile(params.id, data);
  if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 400 });
  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const { student, validation } = await service.updateStudentProfile(params.id, data);
  if (!validation.valid) return NextResponse.json({ error: validation.errors }, { status: 400 });
  return NextResponse.json(student);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await service.deleteStudentProfile(params.id, { cascade: true });
    if (!result) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
