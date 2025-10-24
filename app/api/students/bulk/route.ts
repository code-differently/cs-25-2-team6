import { NextRequest, NextResponse } from 'next/server';
import { FileStudentRepo } from '../../../../src/persistence/FileStudentRepo';

const repo = new FileStudentRepo();

export async function POST(req: NextRequest) {
  const { operations } = await req.json();
  const results = [];
  for (const op of operations) {
    try {
      let result;
      if (op.type === 'create') {
        result = repo.createStudent(op.data);
      } else if (op.type === 'update') {
        result = repo.updateStudent(op.id, op.data);
      } else if (op.type === 'delete') {
        result = repo.deleteStudent(op.id, { cascade: true });
      }
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  return NextResponse.json({ results });
}
