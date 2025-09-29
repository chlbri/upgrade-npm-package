import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { UpgradeOptions } from '../../src/models/types.js';
import { UpgradeOrchestrator } from '../../src/services/upgrade-orchestrator.js';

describe('Performance Integration Tests', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(
      tmpdir(),
      `upgrade-perf-test-${Date.now()}-${Math.random()}`,
    );
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('State Capture Performance', () => {
    it('should capture state in under 5 seconds for project with 10 dependencies', async () => {
      // Create package.json with 10 dependencies
      const packageJson = {
        name: 'test-package-10-deps',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
          express: '^4.18.2',
          react: '^18.2.0',
          axios: '^1.4.0',
          'date-fns': '^2.30.0',
        },
        devDependencies: {
          typescript: '^5.1.0',
          vitest: '^0.33.0',
          eslint: '^8.44.0',
          prettier: '^3.0.0',
          '@types/node': '^20.4.0',
        },
        scripts: {
          test: 'echo "test passed"',
          build: 'echo "build passed"',
          lint: 'echo "lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'echo "test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "lint passed"',
        },
        rollbackOnFailure: true,
      };

      const startTime = Date.now();
      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);
      const duration = Date.now() - startTime;

      // Should complete state capture and upgrade in under 5 seconds
      expect(duration).toBeLessThan(5000);
      expect(result.initialState).toHaveLength(10);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle project with 100 dependencies efficiently', async () => {
      // Generate 100 dependencies
      const dependencies: Record<string, string> = {};
      const devDependencies: Record<string, string> = {};

      // Generate 50 regular and 50 dev dependencies
      for (let i = 1; i <= 50; i++) {
        dependencies[`package-${i}`] = `^1.0.${i}`;
        devDependencies[`dev-package-${i}`] = `^2.0.${i}`;
      }

      const packageJson = {
        name: 'test-package-100-deps',
        version: '1.0.0',
        dependencies,
        devDependencies,
        scripts: {
          test: 'echo "test passed"',
          build: 'echo "build passed"',
          lint: 'echo "lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'echo "test passed"',
          timeout: 30000,
        },
        buildScript: {
          type: 'shell',
          command: 'echo "build passed"',
          timeout: 30000,
        },
        lintScript: {
          type: 'shell',
          command: 'echo "lint passed"',
          timeout: 30000,
        },
        rollbackOnFailure: true,
      };

      const startTime = Date.now();
      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);
      const duration = Date.now() - startTime;

      // Should still complete efficiently (allow more time for 100 deps)
      expect(duration).toBeLessThan(15000); // 15 seconds max
      expect(result.initialState).toHaveLength(100);
    });
  });

  describe('Rollback Performance', () => {
    it('should perform rollback in under 30 seconds', async () => {
      const packageJson = {
        name: 'test-rollback-performance',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
          express: '^4.18.2',
          react: '^18.2.0',
          axios: '^1.4.0',
          'date-fns': '^2.30.0',
        },
        devDependencies: {
          typescript: '^5.1.0',
          vitest: '^0.33.0',
          eslint: '^8.44.0',
        },
        scripts: {
          test: 'sleep 2 && exit 1', // Fail after 2 seconds to trigger rollback
          build: 'echo "build passed"',
          lint: 'echo "lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'sleep 2 && exit 1', // This will fail after 2 seconds
          timeout: 10000,
        },
        buildScript: {
          type: 'shell',
          command: 'echo "build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "lint passed"',
        },
        rollbackOnFailure: true,
      };

      const startTime = Date.now();
      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);
      const duration = Date.now() - startTime;

      // Should complete rollback in under 30 seconds
      expect(duration).toBeLessThan(30000);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.rollbackErrors).toHaveLength(0);
    });
  });

  describe('Memory Management', () => {
    it('should handle memory efficiently during large dependency processing', async () => {
      // Monitor memory usage during large operation
      const initialMemory = process.memoryUsage();

      // Create a project with many dependencies
      const dependencies: Record<string, string> = {};
      for (let i = 1; i <= 100; i++) {
        dependencies[`memory-test-package-${i}`] = `^1.0.${i}`;
      }

      const packageJson = {
        name: 'memory-test-package',
        version: '1.0.0',
        dependencies,
        scripts: {
          test: 'echo "test passed"',
          build: 'echo "build passed"',
          lint: 'echo "lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'echo "test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "lint passed"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);
      const finalMemory = process.memoryUsage();

      // Memory increase should be reasonable (less than 100MB for 100 deps)
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB

      expect(result.initialState).toHaveLength(100);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Script Timeout Handling', () => {
    it('should respect script timeouts and fail gracefully', async () => {
      const packageJson = {
        name: 'timeout-test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        scripts: {
          test: 'sleep 10', // Long running script
          build: 'echo "build passed"',
          lint: 'echo "lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'sleep 10', // 10 second sleep
          timeout: 3000, // But only 3 second timeout
        },
        buildScript: {
          type: 'shell',
          command: 'echo "build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "lint passed"',
        },
        rollbackOnFailure: true,
      };

      const startTime = Date.now();
      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);
      const duration = Date.now() - startTime;

      // Should timeout and trigger rollback within reasonable time
      expect(duration).toBeLessThan(10000); // Should not wait full 10 seconds
      expect(result.rollbackPerformed).toBe(true);
    });

    it('should handle multiple script timeouts efficiently', async () => {
      const packageJson = {
        name: 'multi-timeout-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        scripts: {
          test: 'echo "test passed"',
          build: 'sleep 5', // Will timeout
          lint: 'sleep 5', // Would timeout but won't run due to stop-on-failure
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'echo "test passed"',
          timeout: 5000,
        },
        buildScript: {
          type: 'shell',
          command: 'sleep 5',
          timeout: 2000, // 2 second timeout for 5 second sleep
        },
        lintScript: {
          type: 'shell',
          command: 'sleep 5',
          timeout: 2000,
        },
        rollbackOnFailure: true,
      };

      const startTime = Date.now();
      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);
      const duration = Date.now() - startTime;

      // Should fail on build timeout and not execute lint
      expect(duration).toBeLessThan(15000);
      expect(result.rollbackPerformed).toBe(true);
    });
  });
});
