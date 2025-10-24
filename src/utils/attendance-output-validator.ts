/**
 * TypeScript validator for RAG LLM outputs in the Attendance domain.
 *
 * Purpose:
 * - Verify consistency between `naturalLanguageAnswer` and `structuredData` fields
 * - Detect placeholders like "Unknown Student" when a student is mentioned in the narrative
 * - Ensure required fields are present for every student mentioned in the narrative
 * - Provide a clear list of validation errors and (where possible) automatic suggestions
 *
 * Usage (quick):
 *   # with ts-node
 *   npx ts-node attendance_output_validator.ts <path-to-json-file>
 *
 *   # or compile and run with node
 *   tsc attendance_output_validator.ts
 *   node attendance_output_validator.js <path-to-json-file>
 *
 * If no file is provided the script runs a built-in test using the "bad response" example.
 */

type StudentRecord = {
  studentId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  grade?: string | number | null;
  alertType?: string | null;
  alertTriggeredOn?: string | null;
  alertStatus?: string | null;
  absences?: string[] | null;
  attendanceRate?: number | null;
  [key: string]: any;
};

type LlmOutput = {
  naturalLanguageAnswer?: string;
  structuredData?: any;
  suggestedActions?: any;
  confidence?: number;
  [key: string]: any;
};

type ValidationIssue = {
  level: 'error' | 'warning' | 'info';
  message: string;
  path?: string; // JSON path to problem
  suggestion?: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    mentionedInNL: number;
    presentInStructuredData: number;
    placeholdersFound: number;
  };
  // Attempted automated fixes (best-effort, heuristic)
  autoFixes?: {
    applied: boolean;
    details: string[];
    fixedStructuredData?: any;
  } | null;
};

/**
 * Extract explicit "Name (ID)" mentions from the natural language answer.
 * Returns list of objects { fullName, firstName, lastName, id, index }
 *
 * Heuristics used:
 *  - Prefer patterns like: First Last (S1234)
 *  - Fall back to two-capitalized-word sequences ("John Smith") but only when it's clearly a name
 */
function extractNamesAndIdsFromNL(nl = '') {
  const results: Array<{ fullName: string; firstName?: string; lastName?: string; id?: string; match: string }> = [];
  if (!nl) return results;

  // 1) Find patterns like: "Rosa Nguyen (S1021)" or "John Smith (S1001)"
  const nameIdRe = /([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})\s*\(\s*([A-Za-z0-9-_.:]+)\s*\)/g;
  let m;
  const foundRanges: Array<[number, number]> = [];
  while ((m = nameIdRe.exec(nl)) !== null) {
    const full = m[1].trim();
    const id = m[2].trim();
    const parts = full.split(' ');
    const first = parts[0];
    const last = parts.slice(1).join(' ');
    results.push({ fullName: full, firstName: first, lastName: last, id, match: m[0] });
    foundRanges.push([m.index, m.index + m[0].length]);
  }

  // 2) Find two-word capitalized sequences not already captured, but avoid picking up sentence starts.
  const nameOnlyRe = /\b([A-Z][a-z]{1,} [A-Z][a-z]{1,})(?:\b|,|\.|\()/g;
  while ((m = nameOnlyRe.exec(nl)) !== null) {
    const spanStart = m.index;
    const spanEnd = m.index + m[0].length;
    // skip if overlaps with earlier match
    if (foundRanges.some(([s, e]) => !(spanEnd < s || spanStart > e))) continue;

    const full = m[1].trim();
    const parts = full.split(' ');
    results.push({ fullName: full, firstName: parts[0], lastName: parts.slice(1).join(' '), match: m[0] });
  }

  return results;
}

/**
 * Normalize structuredData.student list into StudentRecord[]
 * Accepts common shapes: { students: [...] } or top-level array or top-level students
 */
function extractStudentsFromStructuredData(structuredData: any): StudentRecord[] {
  if (!structuredData) return [];
  if (Array.isArray(structuredData)) return structuredData as StudentRecord[];
  if (structuredData.students && Array.isArray(structuredData.students)) return structuredData.students as StudentRecord[];
  // sometimes structuredData may be { students: { ... } }
  if (structuredData.students && typeof structuredData.students === 'object') {
    return Object.values(structuredData.students) as StudentRecord[];
  }
  // if nothing matches, but there are top-level keys that look like student objects, try to infer
  // fallback: if structuredData has keys that look like studentId -> student mapping
  const maybeArray = Object.values(structuredData).filter(v => {
    if (!v || typeof v !== 'object') return false;
    const obj = v as Record<string, any>;
    return obj.studentId || obj.firstName || obj.lastName;
  });
  if (maybeArray.length) return maybeArray as StudentRecord[];
  return [];
}

function findPlaceholdersInStructuredData(students: StudentRecord[]) {
  const placeholders = ['Unknown Student', 'Unknown', 'N/A', 'TBD'];
  const found: Array<{ index: number; value: any }> = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const name = `${s.firstName ?? ''}${s.lastName ? ' ' + s.lastName : ''}`.trim();
    if (!name) continue;
    if (placeholders.includes(name) || placeholders.includes((s.firstName || '').toString()) || placeholders.includes((s.lastName || '').toString())) {
      found.push({ index: i, value: s });
    }
  }
  return found;
}

/**
 * Main validator function. Returns ValidationResult.
 */
export function validateAttendanceOutput(output: LlmOutput, options?: { autoFix?: boolean }): ValidationResult {
  const issues: ValidationIssue[] = [];
  const nl = (output.naturalLanguageAnswer || '').toString();
  const structuredData = output.structuredData || {};
  const mentioned = extractNamesAndIdsFromNL(nl);
  const students = extractStudentsFromStructuredData(structuredData);

  // Summary counters
  let placeholdersFound = 0;

  // 1) If NL mentions no students but structuredData has students -> warning
  if (mentioned.length === 0 && students.length > 0) {
    issues.push({ level: 'warning', message: `No student names were parsed from naturalLanguageAnswer, but structuredData contains ${students.length} student record(s).`, path: 'naturalLanguageAnswer', suggestion: 'Ensure the narrative mentions students by full name and ID if necessary.' });
  }

  // 2) If NL mentions students but structuredData is empty -> error
  if (mentioned.length > 0 && students.length === 0) {
    issues.push({ level: 'error', message: `Natural language mentions ${mentioned.length} student(s) but structuredData is empty or has no student records.`, path: 'structuredData', suggestion: 'Populate structuredData.students with matching records.' });
  }

  // 3) Placeholder detection
  const placeholders = findPlaceholdersInStructuredData(students);
  placeholdersFound = placeholders.length;
  if (placeholdersFound > 0) {
    placeholders.forEach(p => {
      issues.push({ level: 'error', message: `Placeholder student found in structuredData at index ${p.index}.`, path: `structuredData.students[${p.index}]`, suggestion: 'Replace placeholder with the real student firstName and lastName fields.' });
    });
  }

  // 4) Cross-check each name mentioned in NL exists in structuredData
  const lowerStructuredNames = students.map((s, i) => ({
    index: i,
    firstName: (s.firstName || '').toString().trim().toLowerCase(),
    lastName: (s.lastName || '').toString().trim().toLowerCase(),
    id: (s.studentId || '').toString().trim().toLowerCase(),
    raw: s,
  }));

  for (const m of mentioned) {
    const mFirst = (m.firstName || '').toString().toLowerCase();
    const mLast = (m.lastName || '').toString().toLowerCase();
    const mId = (m.id || '').toString().toLowerCase();

    let matched = false;
    // First try exact id match if ID present in NL
    if (mId) {
      const byId = lowerStructuredNames.find(s => s.id && s.id === mId);
      if (byId) matched = true;
    }
    // Then try name match
    if (!matched && mFirst && mLast) {
      const byName = lowerStructuredNames.find(s => s.firstName === mFirst && s.lastName === mLast);
      if (byName) matched = true;
    }

    if (!matched) {
      issues.push({ level: 'error', message: `Mentioned student "${m.fullName}${m.id ? ' (' + m.id + ')' : ''}" not found in structuredData.`, path: 'structuredData', suggestion: 'Add or correct the corresponding student record.' });
    }
  }

  // 5) For every student in structuredData mentioned or not, check required fields when referenced in NL
  // Build set of names from NL for quick lookup
  const mentionedNames = new Set(mentioned.map(m => `${(m.firstName||'').toLowerCase()}|${(m.lastName||'').toLowerCase()}`));
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const first = (s.firstName || '').toString();
    const last = (s.lastName || '').toString();
    const id = (s.studentId || '').toString();
    const key = `${first.toLowerCase()}|${last.toLowerCase()}`;

    // If this student appears in NL (by name) then these fields are required
    if (mentionedNames.has(key)) {
      if (!first || !last) {
        issues.push({ level: 'error', message: `Student at structuredData.students[${i}] is missing firstName or lastName but is described in the narrative.`, path: `structuredData.students[${i}]`, suggestion: 'Include firstName and lastName fields.' });
      }
      if (!id) {
        issues.push({ level: 'warning', message: `Student ${first} ${last} is missing studentId in structuredData.`, path: `structuredData.students[${i}].studentId`, suggestion: 'Include studentId when available.' });
      }
      // Check absences array presence if narrative lists dates
      if (/\b(\d{4}-\d{2}-\d{2}|\w+\s\d{1,2}(?:st|nd|rd|th)?(?:,\s?\d{4})?)\b/.test(output.naturalLanguageAnswer || '')) {
        if (!Array.isArray(s.absences) || s.absences.length === 0) {
          issues.push({ level: 'warning', message: `Narrative mentions dates but structuredData.students[${i}].absences is empty or missing.`, path: `structuredData.students[${i}].absences`, suggestion: 'Include absence dates array.' });
        }
      }
    }

    // Detect inconsistent attendanceRate types
    if (s.attendanceRate != null && typeof s.attendanceRate !== 'number') {
      issues.push({ level: 'error', message: `attendanceRate for student at index ${i} should be a number (percent), got ${typeof s.attendanceRate}.`, path: `structuredData.students[${i}].attendanceRate`, suggestion: 'Ensure attendanceRate is a numeric percentage (e.g., 82).' });
    }
  }

  // 6) If structuredData contains students that are not mentioned in NL, raise info (this may be acceptable depending on use-case)
  if (students.length > 0 && mentioned.length > 0) {
    // count how many structured students are not referenced in NL
    let unmentioned = 0;
    for (const s of lowerStructuredNames) {
      const nameKey = `${s.firstName}|${s.lastName}`;
      if (!mentionedNames.has(nameKey)) unmentioned++;
    }
    if (unmentioned > 0) {
      issues.push({ level: 'info', message: `${unmentioned} student(s) exist in structuredData but are not referenced in the narrative.` });
    }
  }

  // 7) Finalize result
  const result: ValidationResult = {
    valid: issues.filter(i => i.level === 'error').length === 0,
    issues,
    summary: {
      mentionedInNL: mentioned.length,
      presentInStructuredData: students.length,
      placeholdersFound,
    },
    autoFixes: null,
  };

  // Attempt basic auto-fix if requested (VERY HEURISTIC)
  if (options?.autoFix) {
    const fixes: string[] = [];
    const fixed = JSON.parse(JSON.stringify(structuredData));
    // Auto-fill studentId if NL mentions an ID and structured student matches by name
    for (const m of mentioned) {
      if (!m.id) continue;
      const mFirst = (m.firstName || '').toString().toLowerCase();
      const mLast = (m.lastName || '').toString().toLowerCase();
      for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const sFirst = (s.firstName || '').toString().toLowerCase();
        const sLast = (s.lastName || '').toString().toLowerCase();
        if (sFirst === mFirst && sLast === mLast && !s.studentId) {
          // set in fixed copy
          if (Array.isArray(fixed.students) && fixed.students[i]) {
            fixed.students[i].studentId = m.id;
            fixes.push(`Set studentId for ${sFirst} ${sLast} to ${m.id}`);
          }
        }
      }
    }

    result.autoFixes = {
      applied: fixes.length > 0,
      details: fixes,
      fixedStructuredData: fixes.length > 0 ? fixed : undefined,
    };
  }

  return result;
}

// Run the script directly or use as a module
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const arg = process.argv[2];

  let raw: any;
  if (arg) {
    const p = path.resolve(process.cwd(), arg);
    if (!fs.existsSync(p)) {
      console.error(`File not found: ${p}`);
      process.exit(2);
    }
    raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  } else {
    // Built-in bad example for testing
    raw = {
      naturalLanguageAnswer: `Currently, there are three active attendance alerts for different students, each triggered by specific patterns or thresholds of absenteeism. Let's review each case:\n\n1. John Smith (S1001) has triggered an Absence Threshold Alert. This alert was activated because John has been absent four times within a 14-day period, which exceeds the threshold of three absences. The specific dates of his absences are 2025-10-01, 2025-10-05, 2025-10-08, and 2025-10-12. This alert was created on 2025-10-15 and is still active.\n\n2. Emma Johnson (S1052) has a Pattern Alert due to her recurring absences on Mondays. This alert identifies a pattern where Emma was absent on three Mondays within a 21-day period. The alert was set to monitor absences on the same weekday over a 30-day period, and Emma's pattern meets this criterion. This alert was initiated on 2025-10-16.\n\n3. The third alert is incomplete in the provided data, but it appears to be another attendance-related alert for a different student.`,
      structuredData: {
        students: [
          {
            firstName: 'John',
            lastName: 'Smith',
            studentId: 'S1001',
            alertType: 'Absence Threshold Alert',
            alertTriggeredOn: '2025-10-15',
            alertStatus: 'active',
            absences: ['2025-10-01', '2025-10-05', '2025-10-08', '2025-10-12'],
            attendanceRate: 78,
          },
          {
            firstName: 'Emma',
            lastName: 'Johnson',
            studentId: 'S1052',
            alertType: 'Pattern Alert',
            alertTriggeredOn: '2025-10-16',
            alertStatus: 'active',
            absences: ['2025-09-22', '2025-09-29', '2025-10-06'],
            attendanceRate: 85,
          },
          {
            firstName: 'Unknown Student',
            studentId: null,
            alertType: 'Absence Threshold...',
            alertStatus: 'active',
            absences: ['2025-10-01', '2025-10-05', '2025-10-08'],
          },
        ],
      },
    };
    console.log('No input file supplied — running built-in test case.');
  }

  const res = validateAttendanceOutput(raw, { autoFix: true });

  console.log('\nValidation result:');
  console.log(JSON.stringify(res, null, 2));

  if (res.issues.length > 0) {
    console.log('\nIssues found:');
    for (const i of res.issues) {
      console.log(`- [${i.level.toUpperCase()}] ${i.message}${i.path ? ` (path: ${i.path})` : ''}${i.suggestion ? `\n    suggestion: ${i.suggestion}` : ''}`);
    }
  } else {
    console.log('\nNo issues detected. Output looks consistent.');
  }
}
