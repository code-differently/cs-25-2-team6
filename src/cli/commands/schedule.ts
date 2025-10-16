import { ScheduleService } from '../../services/ScheduleService';


export class ScheduleCommand {
   async run(args: string[]) {
       if (args[0] === 'schedule' && args[1] === 'plan') {
           const dateIndex = args.indexOf('--date');
           const reasonIndex = args.indexOf('--reason');
           if (dateIndex === -1 || reasonIndex === -1 || !args[dateIndex + 1] || !args[reasonIndex + 1]) {
               console.error('Usage: schedule plan --date <YYYY-MM-DD> --reason <HOLIDAY|PROF_DEV|REPORT_CARD|OTHER>');
               return;
           }
           const dateISO = args[dateIndex + 1];
           const reason = args[reasonIndex + 1];
           const service = new ScheduleService();
           await service.planDayOff({ dateISO, reason });
           console.log(`Planned day off on ${dateISO} for reason: ${reason}`);
       } else if (args[0] === 'schedule' && args[1] === 'apply') {
           const dateIndex = args.indexOf('--date');
           if (dateIndex === -1 || !args[dateIndex + 1]) {
               console.error('Usage: schedule apply --date <YYYY-MM-DD>');
               return;
           }
           const dateISO = args[dateIndex + 1];
           const service = new ScheduleService();
           const count = await service.applyPlannedDayOffToAllStudents(dateISO);
           console.log(`EXCUSED records generated: ${count}`);
       } else if (args[0] === 'schedule' && args[1] === 'list') {
           const startIndex = args.indexOf('--start');
           const endIndex = args.indexOf('--end');
           const start = startIndex !== -1 ? args[startIndex + 1] : '';
           const end = endIndex !== -1 ? args[endIndex + 1] : '';
           const service = new ScheduleService();
           const plannedDays = await service.listPlannedDays({ start, end });
           console.log(JSON.stringify(plannedDays, null, 2));
       } else {
           console.error('Unknown schedule command.');
       }
   }
}
