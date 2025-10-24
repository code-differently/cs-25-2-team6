import { NextRequest, NextResponse } from 'next/server';
import { StudentManagementService } from '../../../../src/services/StudentManagementService';

const service = new StudentManagementService();

export async function POST(req: NextRequest) {
  const { studentId, excludeId } = await req.json();
  const result = service.validateStudentUniqueness(studentId, excludeId);
  return NextResponse.json({ isUnique: result.valid, errors: result.errors });
}
