import { ReportService } from '../../services/ReportService';

export class HistoryCommand {
    async run(args: string[]) {
        const service = new ReportService();
        
        if (args[0] !== 'history') {
            console.error('Unknown command.');
            return;
        }

        if (args[1] === 'view') {
            // history view --student-id <id> --view <daily|weekly|monthly> [--start <date>] [--end <date>]
            const studentIdIndex = args.indexOf('--student-id');
            const viewIndex = args.indexOf('--view');
            const startIndex = args.indexOf('--start');
            const endIndex = args.indexOf('--end');

            if (studentIdIndex === -1 || viewIndex === -1 || !args[studentIdIndex + 1] || !args[viewIndex + 1]) {
                console.error('Usage: history view --student-id <id> --view <daily|weekly|monthly> [--start <date>] [--end <date>]');
                return;
            }

            const studentId = args[studentIdIndex + 1];
            const view = args[viewIndex + 1] as 'DAILY' | 'WEEKLY' | 'MONTHLY';
            const timeframe = view.toUpperCase() as 'DAILY' | 'WEEKLY' | 'MONTHLY';
            const startISO = startIndex !== -1 && args[startIndex + 1] ? args[startIndex + 1] : undefined;
            const endISO = endIndex !== -1 && args[endIndex + 1] ? args[endIndex + 1] : undefined;

            const buckets = service.getHistoryByTimeframe({
                studentId,
                timeframe,
                startISO,
                endISO
            });

            console.log(JSON.stringify(buckets));
        } else if (args[1] === 'ytd') {
            // history ytd --student-id <id> [--year <year>]
            const studentIdIndex = args.indexOf('--student-id');
            const yearIndex = args.indexOf('--year');

            if (studentIdIndex === -1 || !args[studentIdIndex + 1]) {
                console.error('Usage: history ytd --student-id <id> [--year <year>]');
                return;
            }

            const studentId = args[studentIdIndex + 1];
            const year = yearIndex !== -1 && args[yearIndex + 1] ? parseInt(args[yearIndex + 1]) : undefined;

            const summary = service.getYearToDateSummary(studentId, year);
            console.log(JSON.stringify(summary));
        } else {
            console.error('Unknown history command. Available commands: view, ytd');
        }
    }
}
