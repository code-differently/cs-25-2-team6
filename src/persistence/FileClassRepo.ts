import { ClassProfile } from '../domains/ClassProfile';

export class FileClassRepo {
  private classes: ClassProfile[] = [];

  createClass(classData: ClassProfile): ClassProfile {
    this.classes.push(classData);
    return classData;
  }

  findClassById(classId: string): ClassProfile | undefined {
    return this.classes.find(c => c.id === classId);
  }

  getAllClasses(): ClassProfile[] {
    return [...this.classes];
  }

  updateClass(classId: string, updates: Partial<ClassProfile>): ClassProfile | undefined {
    const idx = this.classes.findIndex(c => c.id === classId);
    if (idx === -1) return undefined;
    this.classes[idx] = { ...this.classes[idx], ...updates };
    return this.classes[idx];
  }

  deleteClass(classId: string): boolean {
    const initialLength = this.classes.length;
    this.classes = this.classes.filter(c => c.id !== classId);
    return this.classes.length < initialLength;
  }
}
