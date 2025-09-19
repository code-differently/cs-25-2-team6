import { ReportService } from '../../services/ReportService';

export class ReportCommand {
   async run(args: string[]) {
       const subcommand = args[0];
       const lastIndex = args.indexOf('--last');
       const statusIndex = args.indexOf('--status');
       const dateIndex = args.indexOf('--date');
       let lastName = lastIndex !== -1 ? args[lastIndex + 1] : undefined;
       let status = statusIndex !== -1 ? args[statusIndex + 1] : undefined;
       let dateISO = dateIndex !== -1 ? args[dateIndex + 1] : undefined;
       const service = new ReportService();


       if (subcommand === 'filter') {
           if (!lastName && !status && !dateISO) {
               console.error('At least one filter (--last, --status, --date) must be provided.');
               return;
           }
           const results = await service.filterAttendanceBy({ lastName, status, dateISO });
           console.log(JSON.stringify(results, null, 2));
       } else if (subcommand === 'late') {
           const results = await service.getLateListBy({ dateISO, lastName });
           console.log(JSON.stringify(results, null, 2));
       } else if (subcommand === 'early') {
           const results = await service.getEarlyDismissalListBy({ dateISO, lastName });
           console.log(JSON.stringify(results, null, 2));
       } else {
           console.error('Unknown report subcommand.');
       }
   }
}
