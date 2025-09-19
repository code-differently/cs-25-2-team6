import AttendanceService from '../../services/AttendanceService';

export class AttendanceCommand {
    async run(args: string[]) {
        // Check for 'mark' command
        if (args[0] !== 'mark') {
            console.error('Unknown command.');
            return;
        }
        // Parse required flags
        const firstIndex = args.indexOf('--first');
        const lastIndex = args.indexOf('--last');
        const dateIndex = args.indexOf('--date');
        if (firstIndex === -1 || lastIndex === -1 || dateIndex === -1 || !args[firstIndex + 1] || !args[lastIndex + 1] || !args[dateIndex + 1]) {
            console.error('Usage: attendance mark --first <string> --last <string> --date <YYYY-MM-DD> [--on-time] [--late] [--early-dismissal]');
            return;
        }
        const first = args[firstIndex + 1];
        const last = args[lastIndex + 1];
        const date = args[dateIndex + 1];

        // Parse attendance status
        let status = 'ABSENT';
        if (args.includes('--on-time')) status = 'ON_TIME';
        else if (args.includes('--late')) status = 'LATE';

        // Parse early dismissal
        const earlyDismissal = args.includes('--early-dismissal');

        // Call AttendanceService
        const service = new AttendanceService();
        await service.markAttendanceByName({ first, last, date, status, earlyDismissal });
        console.log(`Attendance marked for ${first} ${last} on ${date} as ${status}${earlyDismissal ? ' (Early Dismissal)' : ''}`);
    }
}