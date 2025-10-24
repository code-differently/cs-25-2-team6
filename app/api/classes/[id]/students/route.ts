import { NextRequest, NextResponse } from 'next/server';
import { ClassManagementService } from '../../../../../src/services/ClassManagementService';

const service = new ClassManagementService();

export async function POST(req: NextRequest, context: any) {
  const { id } = context.params;
  const { studentIds } = await req.json();
  const result = await service.addStudentsToClass(id, studentIds || []);
  if (!result.valid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }
  return NextResponse.json({ message: `Students added to class ${id}` });
}

export async function DELETE(req: NextRequest, context: any) {
  const { id } = context.params;
  const { studentIds } = await req.json();
  const result = await service.removeStudentsFromClass(id, studentIds || []);
  if (!result.valid) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }
  return NextResponse.json({ message: `Students removed from class ${id}` });
}
