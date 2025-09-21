import { FileAlertRuleRepo } from '../../persistence/FileAlertRuleRepo';
import { AlertService } from '../../services/AlertService';


export class AlertsCommand {
   async run(args: string[]) {
       if (args[0] === 'alerts' && args[1] === 'set') {
           // Parse thresholds
           const absences30Index = args.indexOf('--absences30');
           const lates30Index = args.indexOf('--lates30');
           const absencesTotalIndex = args.indexOf('--absencesTotal');
           const latesTotalIndex = args.indexOf('--latesTotal');
           const thresholds: any = {};
           if (absences30Index !== -1) thresholds.absences30 = Number(args[absences30Index + 1]);
           if (lates30Index !== -1) thresholds.lates30 = Number(args[lates30Index + 1]);
           if (absencesTotalIndex !== -1) thresholds.absencesTotal = Number(args[absencesTotalIndex + 1]);
           if (latesTotalIndex !== -1) thresholds.latesTotal = Number(args[latesTotalIndex + 1]);
           // Save to FileAlertRuleRepo
           const repo = new FileAlertRuleRepo();
           repo.saveRules(thresholds);
           console.log('Alert thresholds saved.');
       } else if (args[0] === 'alerts' && args[1] === 'check') {
           // Parse student-id and date
           const studentIdIndex = args.indexOf('--student-id');
           const onIndex = args.indexOf('--on');
           if (studentIdIndex === -1 || !args[studentIdIndex + 1]) {
               console.error('Usage: alerts check --student-id <ID> [--on <YYYY-MM-DD>]');
               return;
           }
           const studentId = args[studentIdIndex + 1];
           let whenISO: string;
           if (onIndex !== -1 && args[onIndex + 1]) {
               whenISO = args[onIndex + 1];
           } else {
               whenISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
           }
           // Load thresholds
           const repo = new FileAlertRuleRepo();
           const rules = repo.getRules();
           
           // Call AlertService
           const notifier = { send: (payload: any) => console.log(`ALERT: ${JSON.stringify(payload)}`) };
           const alertService = new AlertService();
           const result = alertService.notifyIfBreached(studentId, whenISO, rules, notifier);
           
           if (!result.shouldAlert) {
               console.log('No alerts triggered.');
           }
       } else {
           console.error('Unknown alerts command.');
       }
   }
}
