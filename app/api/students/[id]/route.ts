import { NextRequest, NextResponse } from 'next/server';
import { FileStudentRepo } from '../../../../src/persistence/FileStudentRepo';

const repo = new FileStudentRepo();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const student = repo.findStudentById(params.id);
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json(student);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const updated = repo.updateStudent(params.id, data);
  if (!updated) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const updated = repo.updateStudent(params.id, data, true);
  if (!updated) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = repo.deleteStudent(params.id, { cascade: true });
  if (!result) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
