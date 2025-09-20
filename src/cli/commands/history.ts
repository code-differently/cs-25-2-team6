import { ReportService } from '../../services/ReportService';


export class HistoryCommand {
   async run(args: string[]) {
       if (args[0] === 'history' && args[1] === 'view') {
           const studentIdIndex = args.indexOf('--student-id');
           const viewIndex = args.indexOf('--view');
           const startIndex = args.indexOf('--start');
           const endIndex = args.indexOf('--end');
           if (studentIdIndex === -1 || viewIndex === -1 || !args[studentIdIndex + 1] || !args[viewIndex + 1]) {
               console.error('Usage: history view --student-id <ID> --view daily|weekly|monthly [--start <YYYY-MM-DD>] [--end <YYYY-MM-DD>]');
               return;
           }
           const studentId = args[studentIdIndex + 1];
           const view = args[viewIndex + 1];
           const start = startIndex !== -1 ? args[startIndex + 1] : undefined;
           const end = endIndex !== -1 ? args[endIndex + 1] : undefined;


           const service = new ReportService();
           const buckets = await service.getHistoryByTimeframe({ studentId, view, start, end });
           // Print buckets with counts per bucket
           console.log(JSON.stringify(buckets, null, 2));
       } else if (args[0] === 'history' && args[1] === 'ytd') {
           // New code for 'ytd' command
           const studentIdIndex = args.indexOf('--student-id');
           const yearIndex = args.indexOf('--year');
           if (studentIdIndex === -1 || !args[studentIdIndex + 1]) {
               console.error('Usage: history ytd --student-id <ID> [--year <YYYY>]');
               return;
           }
           const studentId = args[studentIdIndex + 1];
           const year = yearIndex !== -1 ? args[yearIndex + 1] : undefined;
           const service = new ReportService();
           const summary = await service.getYearToDateSummary({ studentId, year });
           // Print deterministic summary
           console.log(JSON.stringify(summary, null, 2));
       } else {
           console.error('Unknown command.');
       }
   }
}
