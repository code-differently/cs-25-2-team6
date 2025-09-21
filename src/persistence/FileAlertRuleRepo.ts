import * as fs from "fs";
import * as path from "path";

export interface AlertRules {
  absences30: number;
  lates30: number;
  absencesTotal: number;
  latesTotal: number;
}

export class FileAlertRuleRepo {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(__dirname, "alert_rules.json");
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(this.getDefaultRules()));
    }
  }

  saveRules(rules: AlertRules): void {
    fs.writeFileSync(this.filePath, JSON.stringify(rules, null, 2));
  }

  getRules(): AlertRules {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(data) as AlertRules;
    } catch {
      return this.getDefaultRules();
    }
  }

  private getDefaultRules(): AlertRules {
    return {
      absences30: 5,     // 5 absences in 30 days
      lates30: 3,        // 3 lates in 30 days  
      absencesTotal: 10, // 10 total absences
      latesTotal: 8      // 8 total lates
    };
  }
}
