import { AlertService } from '../../services/AlertService';
import { FileAlertRuleRepo, AlertRules } from '../../persistence/FileAlertRuleRepo';

export class AlertsCommand {
    async run(args: string[]) {
        const alertService = new AlertService();
        const alertRuleRepo = new FileAlertRuleRepo();
        
        if (args[0] !== 'alerts') {
            console.error('Unknown command.');
            return;
        }

        if (args[1] === 'set') {
            // alerts set --absences30 <count> --lates30 <count> --absencesTotal <count> --latesTotal <count>
            const absences30Index = args.indexOf('--absences30');
            const lates30Index = args.indexOf('--lates30');
            const absencesTotalIndex = args.indexOf('--absencesTotal');
            const latesTotalIndex = args.indexOf('--latesTotal');

            if (absences30Index === -1 || lates30Index === -1 || absencesTotalIndex === -1 || latesTotalIndex === -1 ||
                !args[absences30Index + 1] || !args[lates30Index + 1] || !args[absencesTotalIndex + 1] || !args[latesTotalIndex + 1]) {
                console.error('Usage: alerts set --absences30 <count> --lates30 <count> --absencesTotal <count> --latesTotal <count>');
                return;
            }

            const absences30 = parseInt(args[absences30Index + 1]);
            const lates30 = parseInt(args[lates30Index + 1]);
            const absencesTotal = parseInt(args[absencesTotalIndex + 1]);
            const latesTotal = parseInt(args[latesTotalIndex + 1]);

            // Create and save alert rules
            const alertRules: AlertRules = {
                absences30,
                lates30,
                absencesTotal,
                latesTotal
            };

            alertRuleRepo.saveRules(alertRules);
            console.log('Alert thresholds set successfully');

        } else if (args[1] === 'check') {
            // alerts check --student-id <id> --on <date>
            const studentIdIndex = args.indexOf('--student-id');
            const onIndex = args.indexOf('--on');

            if (studentIdIndex === -1 || onIndex === -1 || !args[studentIdIndex + 1] || !args[onIndex + 1]) {
                console.error('Usage: alerts check --student-id <id> --on <date>');
                return;
            }

            const studentId = args[studentIdIndex + 1];
            const dateISO = args[onIndex + 1];

            // Get alert rules and check them
            const alertRules = alertRuleRepo.getRules();
            const result = alertService.checkThresholds(studentId, dateISO, alertRules);
            
            // Debug: Always output the result details for now
            // console.log(`Debug: studentId=${studentId}, dateISO=${dateISO}, shouldAlert=${result.shouldAlert}, reasons=${JSON.stringify(result.reasons)}`);
            
            if (result.shouldAlert) {
                for (const reason of result.reasons) {
                    console.log(`ALERT: ${reason}`);
                }
            } else {
                // Debug: log when no alerts are found
                // console.log(`No alerts for student ${studentId} on ${dateISO}`);
            }

        } else {
            console.error('Unknown alerts command. Available commands: set, check');
        }
    }
}
