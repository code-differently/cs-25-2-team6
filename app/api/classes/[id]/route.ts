import { NextRequest, NextResponse } from 'next/server';
import { ClassManagementService } from '../../../../src/services/ClassManagementService';

const service = new ClassManagementService();

export async function GET(req: NextRequest, context: any) {
  const { id } = context.params;
  const classObj = await service.getClassById(id);
  if (!classObj) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  return NextResponse.json({ class: classObj });
}

export async function PUT(req: NextRequest, context: any) {
  const { id } = context.params;
  const updates = await req.json();
  const updated = await service.updateClass(id, updates);
  if (!updated) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  return NextResponse.json({ class: updated });
}

export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params;
  const updates = await req.json();
  const updated = await service.updateClass(id, updates);
  if (!updated) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  return NextResponse.json({ class: updated });
}

export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params;
  const { preserveStudents } = await req.json();
  const deleted = await service.deleteClassSafely(id, preserveStudents ?? false);
  if (!deleted) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  return NextResponse.json({ message: `Class ${id} deleted` });
}
