import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '../../../src/services/ScheduleService';
import { FileScheduleRepo } from '../../../src/persistence/FileScheduleRepo';
import { FileStudentRepo } from '../../../src/persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../../../src/persistence/FileAttendanceRepo';
import { AttendanceService } from '../../../src/services/AttendanceService';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataPath = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Ensure schedule.json file exists
const scheduleFilePath = path.join(dataPath, 'schedule.json');
if (!fs.existsSync(scheduleFilePath)) {
  fs.writeFileSync(scheduleFilePath, JSON.stringify([]), 'utf8');
}

// Initialize services
const scheduleRepo = new FileScheduleRepo(scheduleFilePath);
const studentRepo = new FileStudentRepo();
const attendanceRepo = new FileAttendanceRepo();
const attendanceService = new AttendanceService();
const scheduleService = new ScheduleService();

/**
 * Get all scheduled days off or filtered by date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let scheduledDays;
    
    if (startDate && endDate) {
      scheduledDays = scheduleService.listPlannedDays({ start: startDate, end: endDate });
    } else {
      // Get current year's start and end dates
      const now = new Date();
      const yearStart = `${now.getFullYear()}-01-01`;
      const yearEnd = `${now.getFullYear()}-12-31`;
      scheduledDays = scheduleService.listPlannedDays({ start: yearStart, end: yearEnd });
    }
    
    return NextResponse.json({
      success: true,
      data: scheduledDays,
    });
  } catch (error) {
    console.error('Error getting scheduled days:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get scheduled days' },
      { status: 500 }
    );
  }
}

/**
 * Create a new scheduled day off
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateISO, reason, description } = body;
    
    
    // Validate required fields
    if (!dateISO || !reason) {
      return NextResponse.json(
        { success: false, error: 'Date and reason are required' },
        { status: 400 }
      );
    }
    
    // Validate reason is a valid DayOffReason
    const validReasons = ['HOLIDAY', 'PROF_DEV', 'REPORT_CARD', 'OTHER'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reason. Must be one of: HOLIDAY, PROF_DEV, REPORT_CARD, OTHER' },
        { status: 400 }
      );
    }
    
    // date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateISO)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    // Check if the day is already scheduled
    if (scheduleService.isPlannedDayOff(dateISO)) {
      return NextResponse.json(
        { success: false, error: 'This date is already scheduled as a day off' },
        { status: 409 }
      );
    }
    
    // Create the scheduled day off
    scheduleService.planDayOff({
      dateISO,
      reason,
      scope: 'ALL_STUDENTS'
    });
    
    return NextResponse.json({
      success: true,
      data: {
        dateISO,
        reason,
        scope: 'ALL_STUDENTS'
      },
      message: 'Scheduled day off created successfully',
    });
  } catch (error) {
    console.error('Error creating scheduled day:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create scheduled day off' },
      { status: 500 }
    );
  }
}

/**

 * Delete a scheduled day off
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateISO = searchParams.get('dateISO');
    
    if (!dateISO) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    // Check if the day is actually scheduled
    if (!scheduleService.isPlannedDayOff(dateISO)) {
      return NextResponse.json(
        { success: false, error: 'No scheduled day off found for this date' },
        { status: 404 }
      );
    }
    
    // Remove from the schedule repository
    const scheduleRepo = new FileScheduleRepo();
    
    // Since there's no explicit delete method, we need to get all days and filter out the one to delete
    const allDaysOff = scheduleRepo.allDaysOff();
    const updatedDaysOff = allDaysOff.filter(day => day.dateISO !== dateISO);
    
    // Write back the filtered array
    const fs = require('fs');
    fs.writeFileSync(scheduleRepo['filePath'], JSON.stringify(updatedDaysOff, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled day off deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting scheduled day:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete scheduled day off' },
      { status: 500 }
    );
  }
}
