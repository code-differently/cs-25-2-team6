import { StudentNotFoundError } from '../exceptions/StudentNotFoundError';


export class AttendanceService {
    private students: Map<string, { id: string; firstName: string; lastName: string }> = new Map();

   
    public markAttendanceByName(firstName: string, lastName: string): void {
        const studentId = this.findStudentIdByName(firstName, lastName);
        if (!studentId) {
            throw new StudentNotFoundError(firstName, lastName);
        }
        
        console.log(`Marking attendance for student ${studentId}`);
    }

    
    private findStudentIdByName(firstName: string, lastName: string): string | null {
        
        const fullNameKey = `${firstName} ${lastName}`;
        const student = this.students.get(fullNameKey);
        return student ? student.id : null;
    }

    
    public registerStudent(firstName: string, lastName: string, studentId: string): void {
        const fullNameKey = `${firstName} ${lastName}`;
        this.students.set(fullNameKey, { id: studentId, firstName, lastName });
    }

   
    public getStudentCount(): number {
        return this.students.size;
    }
}