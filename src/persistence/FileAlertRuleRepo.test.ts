import { FileAlertRuleRepo } from "./FileAlertRuleRepo";
import * as fs from "fs";
import * as path from "path";

const testFile = path.join(__dirname, "test_alert_rules.json");

beforeEach(() => {
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
});

test("saveRules persists the thresholds", () => {
  const repo = new FileAlertRuleRepo(testFile);
  const rules = {
    absences30: 6,
    lates30: 4,
    absencesTotal: 12,
    latesTotal: 10
  };
  
  repo.saveRules(rules);
  
  const savedRules = repo.getRules();
  expect(savedRules.absences30).toBe(6);
  expect(savedRules.lates30).toBe(4);
  expect(savedRules.absencesTotal).toBe(12);
  expect(savedRules.latesTotal).toBe(10);
});

test("getRules returns currently saved thresholds", () => {
  const repo = new FileAlertRuleRepo(testFile);
  const rules = {
    absences30: 3,
    lates30: 2,
    absencesTotal: 8,
    latesTotal: 6
  };
  
  repo.saveRules(rules);
  const result = repo.getRules();
  
  expect(result.absences30).toBe(3);
  expect(result.lates30).toBe(2);
  expect(result.absencesTotal).toBe(8);
  expect(result.latesTotal).toBe(6);
});

test("getRules returns sensible defaults when no file exists", () => {
  const repo = new FileAlertRuleRepo(testFile);
  
  const defaults = repo.getRules();
  
  expect(defaults.absences30).toBe(5);    // 5 absences in 30 days
  expect(defaults.lates30).toBe(3);       // 3 lates in 30 days
  expect(defaults.absencesTotal).toBe(10); // 10 total absences
  expect(defaults.latesTotal).toBe(8);     // 8 total lates
});
