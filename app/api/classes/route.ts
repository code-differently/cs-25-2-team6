import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ClassManagementService } from '../../../src/services/ClassManagementService';

const service = new ClassManagementService();
const DATA_PATH = path.join(process.cwd(), 'data.json');

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { classData, studentIds } = body;
  const result = await service.createClassWithStudents(classData, studentIds || []);
  if (!result.validation.valid) {
    return NextResponse.json({ errors: result.validation.errors }, { status: 400 });
  }
  return NextResponse.json({ class: result.class });
}

export async function GET(req: NextRequest) {
  try {
    const data = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
    // If data is an array of students, extract unique classIds
    let students: any[] = [];
    if (Array.isArray(data.students)) {
      students = data.students;
    } else if (Array.isArray(data)) {
      students = data;
    } else {
      // fallback: try to find students in root
      students = Object.values(data).filter(
        (v) => Array.isArray(v) && v.length && v[0].classId
      ).flat();
    }
    // Extract unique classIds and build class objects
    const classMap: Record<string, { id: string; name: string }> = {};
    for (const student of students) {
      if (student.classId && !classMap[student.classId]) {
        classMap[student.classId] = {
          id: student.classId,
          name: student.classId,
        };
      }
    }
    const normalizedClasses = Object.values(classMap);
    return NextResponse.json({ classes: normalizedClasses });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load classes' }, { status: 500 });
  }
}
