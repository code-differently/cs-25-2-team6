import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '../../../../src/services/ScheduleService';
import path from 'path';
import { FileScheduleRepo } from '../../../../src/persistence/FileScheduleRepo';
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
const scheduleService = new ScheduleService();

/**
 * Get scheduled days off with optional date range filter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Both startDate and endDate parameters are required' },
        { status: 400 }
      );
    }
    
    const scheduledDays = scheduleService.listPlannedDays({ start: startDate, end: endDate });
    
    return NextResponse.json({
      success: true,
      data: scheduledDays,
    });
  } catch (error) {
    console.error('Error getting days off:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get days off' },
      { status: 500 }
    );
  }
}

/**
 * Create a new day off with conflict validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateISO, reason } = body;
    
    
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
    
    // Check if the date is already scheduled
    if (scheduleService.isPlannedDayOff(dateISO)) {
      return NextResponse.json(
        { success: false, error: 'This date is already scheduled as a day off' },
        { status: 409 }
      );
    }
    
    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDate = new Date(dateISO);
    
    if (scheduledDate < today) {
      return NextResponse.json(
        { success: false, error: 'Cannot schedule a day off in the past' },
        { status: 400 }
      );
    }
    
    // Create the day off
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
      message: 'Day off scheduled successfully',
    });
  } catch (error) {
    console.error('Error creating day off:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create day off' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedule/days-off
 * Delete a day off by date
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
    fs.writeFileSync(scheduleRepo['filePath'], JSON.stringify(updatedDaysOff, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Day off deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting day off:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete day off' },
      { status: 500 }
    );
  }
}
