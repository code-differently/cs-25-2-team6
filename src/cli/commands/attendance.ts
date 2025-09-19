import { AttendanceService } from '../../services/AttendanceService';

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
        const firstName = args[firstIndex + 1];
        const lastName = args[lastIndex + 1];
        const dateISO = args[dateIndex + 1];

        // Parse attendance flags
        const onTime = args.includes('--on-time');
        const late = args.includes('--late');
        const earlyDismissal = args.includes('--early-dismissal');

        // Call AttendanceService
        const service = new AttendanceService();
        await service.markAttendanceByName({ firstName, lastName, dateISO, onTime, late, earlyDismissal });
        console.log(`Attendance marked for ${firstName} ${lastName} on ${dateISO}${onTime ? ' (On Time)' : late ? ' (Late)' : ''}${earlyDismissal ? ' (Early Dismissal)' : ''}`);
    }
}