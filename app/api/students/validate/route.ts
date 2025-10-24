import { NextRequest, NextResponse } from 'next/server';
import { FileStudentRepo } from '../../../../src/persistence/FileStudentRepo';

const repo = new FileStudentRepo();

export async function POST(req: NextRequest) {
  const { studentId, excludeId } = await req.json();
  const isUnique = repo.isStudentIdUnique(studentId, excludeId);
  return NextResponse.json({ isUnique });
}
