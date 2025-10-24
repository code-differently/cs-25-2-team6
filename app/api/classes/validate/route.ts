import { NextRequest, NextResponse } from 'next/server';
import { ClassManagementService } from '../../../../src/services/ClassManagementService';

const service = new ClassManagementService();

export async function POST(req: NextRequest) {
  const { classId, studentIds } = await req.json();
  const result = await service.validateClassStudentRelationships(classId, studentIds || []);
  return NextResponse.json({ validation: result });
}
