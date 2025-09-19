import { CLIEntrypoint } from './cli-entrypoint';

interface CommandInterface {
  name: string;
  description: string;
  execute: (args: string[]) => void;
}

describe('CLI Entrypoint Smoke Tests', () => {
  let cliEntrypoint: CLIEntrypoint;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    cliEntrypoint = new CLIEntrypoint();
    
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('Subcommand Registration Validation', () => {
    it('should register core attendance management subcommands correctly', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      const expectedCommands = [
        'mark-attendance',
        'view-attendance',
        'generate-report',
        'add-student',
        'list-students',
        'help'
      ];

      expectedCommands.forEach(commandName => {
        expect(registeredCommands.some((cmd: CommandInterface) => cmd.name === commandName))
          .toBe(true);
      });

      expect(registeredCommands.length).toBeGreaterThanOrEqual(expectedCommands.length);
    });

    it('should register attendance filtering subcommands correctly', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      const filteringCommands = [
        'filter-by-lastname',
        'filter-by-date',
        'filter-by-status',
        'late-list',
        'early-dismissal'
      ];

      filteringCommands.forEach(commandName => {
        const command = registeredCommands.find((cmd: CommandInterface) => cmd.name === commandName);
        expect(command).toBeDefined();
        expect(command?.description).toBeDefined();
        expect(typeof command?.execute).toBe('function');
      });
    });

    it('should register report management subcommands correctly', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      const reportCommands = [
        'daily-report',
        'weekly-report',
        'monthly-report',
        'student-ytd',
        'absence-alert'
      ];

      reportCommands.forEach(commandName => {
        const command = registeredCommands.find((cmd: CommandInterface) => cmd.name === commandName);
        expect(command).toBeDefined();
        expect(command?.name).toBe(commandName);
      });
    });

    it('should register scheduled days off subcommands correctly', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      const scheduledDaysCommands = [
        'add-scheduled-day-off',
        'list-scheduled-days-off',
        'remove-scheduled-day-off'
      ];

      scheduledDaysCommands.forEach(commandName => {
        const command = registeredCommands.find((cmd: CommandInterface) => cmd.name === commandName);
        expect(command).toBeDefined();
        expect(typeof command?.execute).toBe('function');
      });
    });
  });

  describe('Command Structure Validation', () => {
    it('should ensure all registered commands have required properties', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      registeredCommands.forEach((command: CommandInterface) => {
        expect(command.name).toBeDefined();
        expect(typeof command.name).toBe('string');
        expect(command.name.trim().length).toBeGreaterThan(0);
        
        expect(command.description).toBeDefined();
        expect(typeof command.description).toBe('string');
        expect(command.description.trim().length).toBeGreaterThan(0);
        
        expect(command.execute).toBeDefined();
        expect(typeof command.execute).toBe('function');
      });
    });

    it('should have unique command names', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      const commandNames = registeredCommands.map((cmd: CommandInterface) => cmd.name);
      const uniqueNames = [...new Set(commandNames)];
      
      expect(uniqueNames.length).toBe(commandNames.length);
    });

    it('should register commands with meaningful descriptions', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      registeredCommands.forEach((command: CommandInterface) => {
        expect(command.description.toLowerCase()).not.toBe(command.name.toLowerCase());
        
        expect(command.description.length).toBeGreaterThan(10);
        expect(command.description.length).toBeLessThan(200);
      });
    });
  });

  describe('CLI Initialization and Error Handling', () => {
    it('should initialize without errors', () => {
      expect(() => {
        new CLIEntrypoint();
      }).not.toThrow();
    });

    it('should handle unknown commands gracefully', () => {
      const exitCode = cliEntrypoint.executeCommand('unknown-command', []);
      
      expect(exitCode).not.toBe(0);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should provide help functionality', () => {
      const helpCommand = cliEntrypoint.getRegisteredCommands()
        .find((cmd: CommandInterface) => cmd.name === 'help');
      
      expect(helpCommand).toBeDefined();
      
      expect(() => {
        helpCommand?.execute([]);
      }).not.toThrow();
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should handle empty argument arrays', () => {
      const registeredCommands = cliEntrypoint.getRegisteredCommands();
      
      registeredCommands.forEach((command: CommandInterface) => {
        expect(() => {
          command.execute([]);
        }).not.toThrow();
      });
    });
  });

  describe('Integration Smoke Tests', () => {
    it('should execute basic attendance workflow commands without errors', () => {
      const workflowCommands = [
        { name: 'add-student', args: ['John', 'Doe', 'john.doe@school.edu'] },
        { name: 'mark-attendance', args: ['John', 'Doe', '2024-01-15', 'present'] },
        { name: 'generate-report', args: ['daily', '2024-01-15'] }
      ];

      workflowCommands.forEach(({ name, args }) => {
        const exitCode = cliEntrypoint.executeCommand(name, args);
        
        expect(typeof exitCode).toBe('number');
      });
    });

    it('should validate command argument handling', () => {
      const testScenarios = [
        { command: 'help', args: [] },
        { command: 'list-students', args: [] },
        { command: 'filter-by-date', args: ['2024-01-15'] },
        { command: 'filter-by-lastname', args: ['Smith'] }
      ];

      testScenarios.forEach(({ command, args }) => {
        expect(() => {
          cliEntrypoint.executeCommand(command, args);
        }).not.toThrow();
      });
    });

    it('should maintain CLI state consistency across commands', () => {
      const initialState = cliEntrypoint.getState();
      
      cliEntrypoint.executeCommand('help', []);
      cliEntrypoint.executeCommand('list-students', []);
      
      const finalState = cliEntrypoint.getState();
      
      expect(typeof finalState).toBe('object');
      expect(finalState).toBeDefined();
    });
  });
});