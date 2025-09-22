#!/usr/bin/env ts-node

// Main CLI entrypoint for the attendance management system

const [,, ...args] = process.argv;

async function main() {
  if (args[0] === 'students') {
    const { StudentsCommand } = await import('./commands/students');
    const cmd = new StudentsCommand();
    await cmd.run(args.slice(1));
  } else if (args[0] === 'attendance') {
    const { AttendanceCommand } = await import('./commands/attendance');
    const cmd = new AttendanceCommand();
    await cmd.run(args.slice(1));
  } else if (args[0] === 'schedule') {
    const { ScheduleCommand } = await import('./commands/schedule');
    const cmd = new ScheduleCommand();
    await cmd.run(args.slice(1));
  } else if (args[0] === 'history') {
    const { HistoryCommand } = await import('./commands/history');
    const cmd = new HistoryCommand();
    await cmd.run(args.slice(1));
  } else if (args[0] === 'alerts') {
    const { AlertsCommand } = await import('./commands/alerts');
    const cmd = new AlertsCommand();
    await cmd.run(args.slice(1));
  } else if (args[0] === 'report') {
    const { ReportCommand } = await import('./commands/report');
    const cmd = new ReportCommand();
    await cmd.run(args.slice(1));
  } else {
    console.log('Usage:');
    console.log('  students ...');
    console.log('  attendance ...');
    console.log('  schedule ...');
    console.log('  history ...');
    console.log('  alerts ...');
    console.log('  report ...');
  }
}

main();

