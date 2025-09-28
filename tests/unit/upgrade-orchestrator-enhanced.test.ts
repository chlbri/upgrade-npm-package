import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScriptConfig, UpgradeOptions } from '../../src/models/types.js';
import { UpgradeOrchestrator } from '../../src/services/upgrade-orchestrator.js';

// Mock the dependencies
vi.mock('../../src/services/ci-runner.js');
vi.mock('../../src/services/package-json.js');
vi.mock('../../src/services/dependency-state-manager.js');
vi.mock('../../src/services/script-execution.js');
vi.mock('../libs/semver-utils.js');
vi.mock('../services/registry.js');

describe('Unit: Enhanced UpgradeOrchestrator', () => {
  let orchestrator: UpgradeOrchestrator;
  let mockOptions: UpgradeOptions;

  beforeEach(() => {
    orchestrator = new UpgradeOrchestrator('/test/dir');

    const testScript: ScriptConfig = {
      type: 'npm',
      command: 'test',
      timeout: 30000,
    };

    const buildScript: ScriptConfig = {
      type: 'npm',
      command: 'run build',
      timeout: 60000,
    };

    const installScript: ScriptConfig = {
      type: 'npm',
      command: 'install',
      timeout: 120000,
    };

    mockOptions = {
      workingDir: '/test/dir',
      testScript,
      buildScript,
      installScript,
      rollbackOnFailure: true,
    };
  });

  describe('upgradeWithRollback()', () => {
    it('should initialize with enhanced dependencies', async () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator).toBeInstanceOf(UpgradeOrchestrator);
    });

    it('should handle upgrade options with required scripts', async () => {
      // Mock the state manager and script execution service methods
      const mockCaptureState = vi.fn().mockResolvedValue([]);
      const mockExecuteScript = vi
        .fn()
        .mockResolvedValue({ success: true });

      // Access private properties for testing (TypeScript will warn but it works)
      (orchestrator as any).stateManager = {
        captureInitialState: mockCaptureState,
      };
      (orchestrator as any).scriptExecutionService = {
        executeScript: mockExecuteScript,
      };
      (orchestrator as any).ciRunner = {
        runCiAdmin: vi.fn().mockResolvedValue({ success: true }),
      };

      const result = await orchestrator.upgradeWithRollback(mockOptions);

      expect(result).toBeDefined();
      expect(result.rollbackPerformed).toBe(false);
      expect(result.initialState).toBeDefined();
      expect(mockCaptureState).toHaveBeenCalled();
    });

    it('should handle rollback on failure when enabled', async () => {
      const mockCaptureState = vi.fn().mockResolvedValue([
        {
          packageName: 'test',
          version: '1.0.0',
          semverSign: '^' as const,
          dependencyType: 'dependencies' as const,
        },
      ]);
      const mockRollback = vi.fn().mockResolvedValue(undefined);
      const mockExecuteScript = vi
        .fn()
        .mockRejectedValue(new Error('Script failed'));

      (orchestrator as any).stateManager = {
        captureInitialState: mockCaptureState,
        rollbackToState: mockRollback,
      };
      (orchestrator as any).scriptExecutionService = {
        executeScript: mockExecuteScript,
      };

      const result = await orchestrator.upgradeWithRollback({
        ...mockOptions,
        rollbackOnFailure: true,
        additionalScripts: [mockOptions.testScript],
      });

      expect(result.rollbackPerformed).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(mockRollback).toHaveBeenCalled();
    });

    it('should disable rollback when rollbackOnFailure is false', async () => {
      const mockCaptureState = vi.fn().mockResolvedValue([]);
      const mockRollback = vi.fn();
      const mockExecuteScript = vi
        .fn()
        .mockRejectedValue(new Error('Script failed'));

      (orchestrator as any).stateManager = {
        captureInitialState: mockCaptureState,
        rollbackToState: mockRollback,
      };
      (orchestrator as any).scriptExecutionService = {
        executeScript: mockExecuteScript,
      };

      const result = await orchestrator.upgradeWithRollback({
        ...mockOptions,
        rollbackOnFailure: false,
        additionalScripts: [mockOptions.testScript],
      });

      expect(result.rollbackPerformed).toBe(false);
      expect(mockRollback).not.toHaveBeenCalled();
    });

    it('should handle rollback errors gracefully', async () => {
      const mockCaptureState = vi.fn().mockResolvedValue([]);
      const mockRollback = vi
        .fn()
        .mockRejectedValue(new Error('Rollback failed'));
      const mockExecuteScript = vi
        .fn()
        .mockRejectedValue(new Error('Script failed'));

      (orchestrator as any).stateManager = {
        captureInitialState: mockCaptureState,
        rollbackToState: mockRollback,
      };
      (orchestrator as any).scriptExecutionService = {
        executeScript: mockExecuteScript,
      };

      const result = await orchestrator.upgradeWithRollback({
        ...mockOptions,
        rollbackOnFailure: true,
        additionalScripts: [mockOptions.testScript],
      });

      expect(result.rollbackPerformed).toBe(false);
      expect(result.rollbackErrors).toHaveLength(1);
      expect(result.rollbackErrors?.[0]).toContain('Rollback failed');
    });
  });

  describe('constructor', () => {
    it('should initialize all enhanced services', () => {
      const testOrchestrator = new UpgradeOrchestrator('/custom/dir');

      expect(testOrchestrator).toBeDefined();
      // Verify that private properties are set (we can't access them directly but can test the behavior)
      expect(testOrchestrator).toBeInstanceOf(UpgradeOrchestrator);
    });
  });

  describe('backward compatibility', () => {
    it('should maintain backward compatibility with existing upgrade() method', async () => {
      // Mock the CI runner for the legacy upgrade method
      (orchestrator as any).ciRunner = {
        runCiAdmin: vi.fn().mockResolvedValue({ success: true }),
      };

      const result = await orchestrator.upgrade();

      expect(result).toBeDefined();
      expect(result.upgraded).toBeDefined();
      expect(result.skipped).toBeDefined();
      expect(result.remainingOutdated).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
  });
});
