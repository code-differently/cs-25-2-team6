import { FileStudentRepo } from '../../persistence/FileStudentRepo';

export class StudentsCommand {
    async run(args: string[]) {
        // Parse arguments
        const addIndex = args.indexOf('add');
        const listIndex = args.indexOf('list');
        if (addIndex !== -1) {
            const firstIndex = args.indexOf('--first');
            const lastIndex = args.indexOf('--last');
            if (firstIndex === -1 || lastIndex === -1 || !args[firstIndex + 1] || !args[lastIndex + 1]) {
                console.error('Usage: students add --first <string> --last <string>');
                return;
            }
            const first = args[firstIndex + 1];
            const last = args[lastIndex + 1];

            // Add student using FileStudentRepo
            const repo = new FileStudentRepo();
            // Generate a simple id (in real app, use uuid or similar)
            const id = `${first}_${last}`;
            const student = { id, firstName: first, lastName: last };
            repo.saveStudent(student);
            console.log(`Student added with ID: ${student.id}`);
            return student;
        } else if (listIndex !== -1) {
            // List all students
            const repo = new FileStudentRepo();
            const students = repo.allStudents();
            if (students.length === 0) {
                console.log('No students found.');
            } else {
                students.forEach((s: { id: string, firstName: string, lastName: string }) => {
                    console.log(`${s.id}: ${s.firstName} ${s.lastName}`);
                });
            }
            return students;
        } else {
            console.error('Unknown command.');
            return;
        }
    }
}
