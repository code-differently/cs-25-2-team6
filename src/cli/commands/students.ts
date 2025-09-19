import { FileStudentRepo } from '../../persistence/FileStudentRepo';

export class StudentsCommand {
    async run(args: string[]) {
        // Parse arguments
        const addIndex = args.indexOf('add');
        if (addIndex === -1) {
            console.error('Unknown command.');
            return;
        }
        // Extract --first and --last
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
    }
}
