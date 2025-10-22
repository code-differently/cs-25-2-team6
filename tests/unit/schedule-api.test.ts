import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../../../app/api/schedule/route';
import { POST as BulkExcusePost, GET as BulkExcuseGet } from '../../../app/api/schedule/bulk-excuse/route';
import { GET as DaysOffGet, POST as DaysOffPost, DELETE as DaysOffDelete } from '../../../app/api/schedule/days-off/route';
import { ScheduleService } from '../../../src/services/ScheduleService';
import { FileScheduleRepo } from '../../../src/persistence/FileScheduleRepo';
import { FileStudentRepo } from '../../../src/persistence/FileStudentRepo';
import { FileAttendanceRepo } from '../../../src/persistence/FileAttendanceRepo';

// Mock all the necessary services and repositories
jest.mock('../../../src/services/ScheduleService');
jest.mock('../../../src/persistence/FileScheduleRepo');
jest.mock('../../../src/persistence/FileStudentRepo');
jest.mock('../../../src/persistence/FileAttendanceRepo');
jest.mock('fs');

describe('Schedule API Routes', () => {
  let mockScheduleService: jest.Mocked<ScheduleService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockScheduleService = new ScheduleService() as jest.Mocked<ScheduleService>;
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('/api/schedule', () => {
    describe('GET', () => {
      test('should return scheduled days with date range', async () => {
        // Mock implementation
        mockScheduleService.listPlannedDays.mockReturnValueOnce([
          { dateISO: '2023-12-25', reason: 'HOLIDAY' }
        ]);
        
        // Create mock request with search params
        const request = {
          url: 'http://localhost:3000/api/schedule?startDate=2023-12-01&endDate=2023-12-31'
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await GET(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].dateISO).toBe('2023-12-25');
      });
      
      test('should return scheduled days for current year if no date range', async () => {
        // Mock implementation
        mockScheduleService.listPlannedDays.mockReturnValueOnce([]);
        
        // Create mock request without search params
        const request = {
          url: 'http://localhost:3000/api/schedule'
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await GET(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(true);
        expect(mockScheduleService.listPlannedDays).toHaveBeenCalled();
      });
    });
    
    describe('POST', () => {
      test('should create a scheduled day off', async () => {
        // Mock implementation
        mockScheduleService.isPlannedDayOff.mockReturnValueOnce(false);
        
        // Create mock request
        const request = {
          json: jest.fn().mockResolvedValueOnce({
            dateISO: '2023-12-25',
            reason: 'HOLIDAY'
          })
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await POST(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(true);
        expect(mockScheduleService.planDayOff).toHaveBeenCalledWith({
          dateISO: '2023-12-25',
          reason: 'HOLIDAY',
          scope: 'ALL_STUDENTS'
        });
      });
      
      test('should reject invalid date format', async () => {
        // Create mock request with invalid date
        const request = {
          json: jest.fn().mockResolvedValueOnce({
            dateISO: '12/25/2023', // Invalid format
            reason: 'HOLIDAY'
          })
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await POST(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid date format');
        expect(response.status).toBe(400);
      });
      
      test('should reject invalid reason', async () => {
        // Create mock request with invalid reason
        const request = {
          json: jest.fn().mockResolvedValueOnce({
            dateISO: '2023-12-25',
            reason: 'INVALID_REASON' // Invalid reason
          })
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await POST(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(false);
        expect(data.error).toContain('Invalid reason');
        expect(response.status).toBe(400);
      });
      
      test('should reject if date already scheduled', async () => {
        // Mock implementation
        mockScheduleService.isPlannedDayOff.mockReturnValueOnce(true);
        
        // Create mock request
        const request = {
          json: jest.fn().mockResolvedValueOnce({
            dateISO: '2023-12-25',
            reason: 'HOLIDAY'
          })
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await POST(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(false);
        expect(data.error).toContain('already scheduled');
        expect(response.status).toBe(409);
      });
    });
  });

  describe('/api/schedule/bulk-excuse', () => {
    describe('POST', () => {
      test('should apply excused absences to all students', async () => {
        // Mock implementation
        mockScheduleService.isPlannedDayOff.mockReturnValueOnce(true);
        mockScheduleService.applyPlannedDayOffToAllStudents.mockReturnValueOnce(10);
        
        // Create mock request
        const request = {
          json: jest.fn().mockResolvedValueOnce({
            dateISO: '2023-12-25'
          })
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await BulkExcusePost(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(true);
        expect(data.data.processedCount).toBe(10);
        expect(mockScheduleService.applyPlannedDayOffToAllStudents).toHaveBeenCalledWith('2023-12-25');
      });
      
      test('should reject if date is not scheduled', async () => {
        // Mock implementation
        mockScheduleService.isPlannedDayOff.mockReturnValueOnce(false);
        
        // Create mock request
        const request = {
          json: jest.fn().mockResolvedValueOnce({
            dateISO: '2023-12-25'
          })
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await BulkExcusePost(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(false);
        expect(data.error).toContain('not scheduled as a day off');
        expect(response.status).toBe(404);
      });
    });
  });

  describe('/api/schedule/days-off', () => {
    describe('GET', () => {
      test('should return days off within date range', async () => {
        // Mock implementation
        mockScheduleService.listPlannedDays.mockReturnValueOnce([
          { dateISO: '2023-12-25', reason: 'HOLIDAY' }
        ]);
        
        // Create mock request
        const request = {
          url: 'http://localhost:3000/api/schedule/days-off?startDate=2023-12-01&endDate=2023-12-31'
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await DaysOffGet(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].dateISO).toBe('2023-12-25');
      });
      
      test('should require startDate and endDate', async () => {
        // Create mock request without params
        const request = {
          url: 'http://localhost:3000/api/schedule/days-off'
        } as unknown as NextRequest;
        
        // Call the endpoint
        const response = await DaysOffGet(request);
        const data = await response.json();
        
        // Assertions
        expect(data.success).toBe(false);
        expect(data.error).toContain('startDate and endDate parameters are required');
        expect(response.status).toBe(400);
      });
    });
  });
});
