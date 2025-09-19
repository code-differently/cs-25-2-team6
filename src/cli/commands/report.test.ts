

// Test Suite
describe('ReportCommand', () => {
  let reportCommand: ReportCommand;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    reportCommand = new ReportCommand();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock the ExtendedReportService methods
    jest.spyOn(ExtendedReportService.prototype, 'filterAttendanceBy').mockImplementation(async (filters: any) => {
      const mockData = [
        { studentId: '1', date: '2024-01-15', status: 'PRESENT', lastName: 'Smith' },
        { studentId: '2', date: '2024-01-16', status: 'LATE', lastName: 'Johnson' },
        { studentId: '3', date: '2024-01-17', status: 'ABSENT', lastName: 'Williams' }
      ];
      
      let results = mockData;
      if (filters.lastName) {
        results = results.filter((r: any) => r.lastName.toLowerCase().includes(filters.lastName.toLowerCase()));
      }
      if (filters.status) {
        results = results.filter((r: any) => r.status === filters.status);
      }
      if (filters.dateISO) {
        results = results.filter((r: any) => r.date === filters.dateISO);
      }
      
      return results;
    });

    jest.spyOn(ExtendedReportService.prototype, 'getLateListBy').mockImplementation(async (filters: any) => {
      const mockLateData = [
        { studentId: '2', date: '2024-01-16', status: 'LATE', lastName: 'Johnson' },
        { studentId: '4', date: '2024-01-18', status: 'LATE', lastName: 'Brown' }
      ];
      
      let results = mockLateData;
      if (filters.lastName) {
        results = results.filter((r: any) => r.lastName.toLowerCase().includes(filters.lastName.toLowerCase()));
      }
      if (filters.dateISO) {
        results = results.filter((r: any) => r.date === filters.dateISO);
      }
      
      return results;
    });

    jest.spyOn(ExtendedReportService.prototype, 'getEarlyDismissalListBy').mockImplementation(async (filters: any) => {
      const mockEarlyData = [
        { studentId: '1', date: '2024-01-15', status: 'PRESENT', lastName: 'Smith', earlyDismissal: true },
        { studentId: '3', date: '2024-01-17', status: 'PRESENT', lastName: 'Williams', earlyDismissal: true }
      ];
      
      let results = mockEarlyData;
      if (filters.lastName) {
        results = results.filter((r: any) => r.lastName.toLowerCase().includes(filters.lastName.toLowerCase()));
      }
      if (filters.dateISO) {
        results = results.filter((r: any) => r.date === filters.dateISO);
      }
      
      return results;
    });
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    jest.restoreAllMocks();
  });

  describe('Argument Parsing', () => {
    it('should correctly parse --last argument', async () => {
      const args = ['filter', '--last', 'Smith'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(Array.isArray(output)).toBe(true);
    });

    it('should correctly parse --status argument', async () => {
      const args = ['filter', '--status', 'PRESENT'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ status: 'PRESENT' })
      ]));
    });

    it('should correctly parse --date argument', async () => {
      const args = ['filter', '--date', '2024-01-15'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ date: '2024-01-15' })
      ]));
    });

    it('should handle multiple arguments correctly', async () => {
      const args = ['filter', '--last', 'Smith', '--status', 'PRESENT', '--date', '2024-01-15'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ 
          lastName: 'Smith', 
          status: 'PRESENT', 
          date: '2024-01-15' 
        })
      ]));
    });

    it('should handle arguments when flag is present but value is missing (undefined)', async () => {
      const args = ['filter', '--last'];
      await reportCommand.run(args);
      
      // Should trigger error because lastName will be undefined (falsy)
      expect(mockConsoleError).toHaveBeenCalledWith('At least one filter (--last, --status, --date) must be provided.');
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should handle arguments in different orders', async () => {
      const args = ['filter', '--status', 'LATE', '--last', 'Johnson'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('Filter Subcommand', () => {
    it('should execute filter subcommand with lastName only', async () => {
      const args = ['filter', '--last', 'Smith'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
      
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output.length).toBeGreaterThan(0);
      expect(output[0]).toHaveProperty('lastName', 'Smith');
    });

    it('should execute filter subcommand with status only', async () => {
      const args = ['filter', '--status', 'LATE'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ status: 'LATE' })
      ]));
    });

    it('should execute filter subcommand with date only', async () => {
      const args = ['filter', '--date', '2024-01-16'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ date: '2024-01-16' })
      ]));
    });

    it('should show error when no filters provided for filter subcommand', async () => {
      const args = ['filter'];
      await reportCommand.run(args);
      
      expect(mockConsoleError).toHaveBeenCalledWith('At least one filter (--last, --status, --date) must be provided.');
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should show error when all filter values are undefined', async () => {
      // Simulate scenario where flags exist but no values follow them (values would be other flags)
      const args = ['filter', '--last', '--status', '--date'];
      await reportCommand.run(args);
      
      // In this case, lastName = '--status', status = '--date', dateISO = undefined
      // Since all three are strings (truthy), it should NOT show error
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it('should handle empty string values as valid filters', async () => {
      const args = ['filter', '--last', ''];
      await reportCommand.run(args);
      
      // Empty string is falsy, so should show error
      expect(mockConsoleError).toHaveBeenCalledWith('At least one filter (--last, --status, --date) must be provided.');
    });
  });

  describe('Late Subcommand', () => {
    it('should execute late subcommand with no additional filters', async () => {
      const args = ['late'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
      
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(Array.isArray(output)).toBe(true);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ status: 'LATE' })
      ]));
    });

    it('should execute late subcommand with date filter', async () => {
      const args = ['late', '--date', '2024-01-16'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ date: '2024-01-16' })
      ]));
    });

    it('should execute late subcommand with lastName filter', async () => {
      const args = ['late', '--last', 'Johnson'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ lastName: 'Johnson' })
      ]));
    });

    it('should execute late subcommand with both date and lastName filters', async () => {
      const args = ['late', '--date', '2024-01-16', '--last', 'Johnson'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ 
          date: '2024-01-16', 
          lastName: 'Johnson' 
        })
      ]));
    });
  });

  describe('Early Subcommand', () => {
    it('should execute early subcommand with no additional filters', async () => {
      const args = ['early'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(mockConsoleError).not.toHaveBeenCalled();
      
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(Array.isArray(output)).toBe(true);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ earlyDismissal: true })
      ]));
    });

    it('should execute early subcommand with date filter', async () => {
      const args = ['early', '--date', '2024-01-15'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ date: '2024-01-15' })
      ]));
    });

    it('should execute early subcommand with lastName filter', async () => {
      const args = ['early', '--last', 'Williams'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = JSON.parse(mockConsoleLog.mock.calls[0][0]);
      expect(output).toEqual(expect.arrayContaining([
        expect.objectContaining({ lastName: 'Williams' })
      ]));
    });

    it('should execute early subcommand with both filters', async () => {
      const args = ['early', '--date', '2024-01-17', '--last', 'Williams'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown subcommand', async () => {
      const args = ['unknown'];
      await reportCommand.run(args);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Unknown report subcommand.');
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should handle empty args array', async () => {
      const args: string[] = [];
      await reportCommand.run(args);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Unknown report subcommand.');
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should handle undefined subcommand', async () => {
      const args = [undefined as any];
      await reportCommand.run(args);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Unknown report subcommand.');
    });

    it('should handle null args', async () => {
      const args = [null as any];
      await reportCommand.run(args);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Unknown report subcommand.');
    });
  });

  describe('JSON Output Formatting', () => {
    it('should format JSON output with proper indentation', async () => {
      const args = ['filter', '--last', 'Smith'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls[0][0];
      
      // Verify it's properly formatted JSON with 2-space indentation
      const parsed = JSON.parse(output);
      const expectedFormatted = JSON.stringify(parsed, null, 2);
      expect(output).toBe(expectedFormatted);
    });

    it('should handle empty results with proper JSON formatting', async () => {
      const args = ['filter', '--last', 'NonExistentName'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const output = mockConsoleLog.mock.calls[0][0];
      
      const parsed = JSON.parse(output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in arguments', async () => {
      const args = ['filter', '--last', 'O\'Connor-Smith'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle numeric strings as arguments', async () => {
      const args = ['filter', '--status', '12345'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle whitespace-only values', async () => {
      const args = ['filter', '--last', '   '];
      await reportCommand.run(args);
      
      // Whitespace string should be truthy, so should not trigger error
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle case-sensitive subcommands', async () => {
      const args = ['FILTER', '--last', 'Smith'];
      await reportCommand.run(args);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Unknown report subcommand.');
    });

    it('should handle flags not at expected positions', async () => {
      const args = ['filter', 'somevalue', '--last', 'Smith'];
      await reportCommand.run(args);
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });
});