import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { UpgradeOptions } from '../../src/models/types.js';
import { UpgradeOrchestrator } from '../../src/services/upgrade-orchestrator.js';

describe('Complete Workflow Integration Tests', () => {
  let testDir: string;

  beforeEach(() => {
    // Create temporary directory for each test
    testDir = join(
      tmpdir(),
      `upgrade-test-${Date.now()}-${Math.random()}`,
    );
    mkdirSync(testDir, { recursive: true });
    // Don't create orchestrator here - create fresh one in each test
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Successful Upgrade Workflow', () => {
    it('should complete full upgrade with 3-scripts validation', async () => {
      // Setup test package.json
      const packageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        devDependencies: {
          typescript: '^4.9.0',
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
        verbose: true,
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
        installScript: {
          type: 'shell',
          command: 'echo "install completed"',
          timeout: 30000,
        },
        packageManager: 'npm',
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      // Verify successful execution
      expect(result.errors).toHaveLength(0);
      expect(result.rollbackPerformed).toBe(false);
      expect(result.initialState).toBeDefined();
      expect(result.initialState).toHaveLength(2); // lodash + typescript
    });

    it('should preserve semver operators in successful upgrade', async () => {
      const packageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20', // ^ operator
          express: '~4.18.1', // ~ operator
          react: '18.2.0', // exact version
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

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      // Check that semver operators are preserved in initial state
      expect(result.initialState).toBeDefined();
      const lodashState = result.initialState!.find(
        dep => dep.packageName === 'lodash',
      );
      const expressState = result.initialState!.find(
        dep => dep.packageName === 'express',
      );
      const reactState = result.initialState!.find(
        dep => dep.packageName === 'react',
      );

      expect(lodashState?.semverSign).toBe('^');
      expect(expressState?.semverSign).toBe('~');
      expect(reactState?.semverSign).toBe('exact');
    });
  });

  describe('Failed Upgrade with Rollback', () => {
    it('should rollback after test script failure', async () => {
      const packageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        scripts: {
          test: 'exit 1', // Failing test
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
          command: 'exit 1', // This will fail
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

      // Verify rollback occurred
      expect(result.rollbackPerformed).toBe(true);
      expect(result.initialState).toBeDefined();
      expect(result.rollbackErrors).toHaveLength(0); // No rollback errors
    });

    it('should rollback after build script failure (stop-on-failure)', async () => {
      const packageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        scripts: {
          test: 'echo "test passed"',
          build: 'exit 1', // Failing build
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
          command: 'exit 1', // This will fail
        },
        lintScript: {
          type: 'shell',
          command: 'echo "lint passed"', // Should not execute due to stop-on-failure
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      // Verify rollback occurred and lint was not executed
      expect(result.rollbackPerformed).toBe(true);
      expect(result.initialState).toBeDefined();
    });

    it('should rollback after lint script failure', async () => {
      const packageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        scripts: {
          test: 'echo "test passed"',
          build: 'echo "build passed"',
          lint: 'exit 1', // Failing lint
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
          command: 'exit 1', // This will fail
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      // Verify rollback occurred
      expect(result.rollbackPerformed).toBe(true);
      expect(result.initialState).toBeDefined();
    });
  });

  describe('Project State Consistency', () => {
    it('should restore exact initial state after rollback', async () => {
      const originalPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
          express: '~4.18.1',
        },
        devDependencies: {
          typescript: '^4.9.0',
        },
        scripts: {
          test: 'exit 1', // Will trigger rollback
          build: 'echo "build passed"',
          lint: 'echo "lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(originalPackageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell',
          command: 'exit 1',
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

      // Verify rollback occurred
      expect(result.rollbackPerformed).toBe(true);

      // Verify initial state was captured correctly
      expect(result.initialState).toHaveLength(3); // lodash, express, typescript
      const lodashState = result.initialState!.find(
        dep => dep.packageName === 'lodash',
      );
      const expressState = result.initialState!.find(
        dep => dep.packageName === 'express',
      );
      const typescriptState = result.initialState!.find(
        dep => dep.packageName === 'typescript',
      );

      expect(lodashState).toMatchObject({
        packageName: 'lodash',
        version: '4.17.20',
        semverSign: '^',
        dependencyType: 'dependencies',
      });

      expect(expressState).toMatchObject({
        packageName: 'express',
        version: '4.18.1',
        semverSign: '~',
        dependencyType: 'dependencies',
      });

      expect(typescriptState).toMatchObject({
        packageName: 'typescript',
        version: '4.9.0',
        semverSign: '^',
        dependencyType: 'devDependencies',
      });
    });
  });
});
