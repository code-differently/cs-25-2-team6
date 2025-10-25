import { NextRequest, NextResponse } from 'next/server';
import { StudentManagementService } from '../../../../src/services/StudentManagementService';

const service = new StudentManagementService();

export async function POST(req: NextRequest) {
  const { operations } = await req.json();
  const results = await service.bulkStudentOperations(operations);
  return NextResponse.json({ results });
}
