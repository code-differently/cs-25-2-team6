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

        // Delegate to StudentRepository
        // Assuming StudentRepository is imported and has a createStudent method
        const repo = new FileStudentRepo();
        const student = await repo.createStudent({ first, last });
        console.log(`Student added with ID: ${student.id}`);
    }
}
