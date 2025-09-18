import { StudentNotFoundError } from '../exceptions/StudentNotFoundError';


export class StudentRoster {
    private students: Map<string, { firstName: string; lastName: string; email?: string }> = new Map();

    
    public addStudent(studentId: string, firstName: string, lastName: string, email?: string): void {
        if (this.students.has(studentId)) {
            throw new Error(`Student with ID ${studentId} already exists in roster`);
        }

        if (!firstName.trim() || !lastName.trim()) {
            throw new Error('First name and last name cannot be empty');
        }

        this.students.set(studentId, { firstName: firstName.trim(), lastName: lastName.trim(), email });
    }

    
    public removeStudent(studentId: string): void {
        const student = this.students.get(studentId);
        if (!student) {
            
            throw new StudentNotFoundError('Unknown', 'Student');
        }
        this.students.delete(studentId);
    }

   
    public getStudentById(studentId: string): { firstName: string; lastName: string; email?: string } {
        const student = this.students.get(studentId);
        if (!student) {
            throw new StudentNotFoundError('Unknown', 'Student');
        }
        return { ...student };
    }

    
    public findStudentIdByName(firstName: string, lastName: string): string | null {
        for (const [studentId, student] of this.students.entries()) {
            if (student.firstName === firstName && student.lastName === lastName) {
                return studentId;
            }
        }
        return null;
    }

    
    public updateStudent(studentId: string, updates: { firstName?: string; lastName?: string; email?: string }): void {
        const student = this.students.get(studentId);
        if (!student) {
            throw new StudentNotFoundError('Unknown', 'Student');
        }

        if (updates.firstName !== undefined && !updates.firstName.trim()) {
            throw new Error('First name cannot be empty');
        }

        if (updates.lastName !== undefined && !updates.lastName.trim()) {
            throw new Error('Last name cannot be empty');
        }

        const updatedStudent = {
            firstName: updates.firstName?.trim() ?? student.firstName,
            lastName: updates.lastName?.trim() ?? student.lastName,
            email: updates.email ?? student.email
        };

        this.students.set(studentId, updatedStudent);
    }

    
    public getAllStudents(): Array<{ id: string; firstName: string; lastName: string; email?: string }> {
        return Array.from(this.students.entries()).map(([id, student]) => ({
            id,
            ...student
        }));
    }

   
    public getStudentCount(): number {
        return this.students.size;
    }

    
    public clear(): void {
        this.students.clear();
    }

    
    public hasStudent(studentId: string): boolean {
        return this.students.has(studentId);
    }
}