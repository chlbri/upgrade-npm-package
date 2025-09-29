import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { UpgradeOptions } from '../../src/models/types.js';
import { UpgradeOrchestrator } from '../../src/services/upgrade-orchestrator.js';

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

describe('Multi-Package Manager Integration Tests', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(
      tmpdir(),
      `upgrade-pm-test-${Date.now()}-${Math.random()}`,
    );
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('NPM Package Manager', () => {
    it('should complete workflow with npm commands', async () => {
      const packageJson = {
        name: 'npm-test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        devDependencies: {
          typescript: '^4.9.0',
        },
        scripts: {
          test: 'echo "npm test passed"',
          build: 'echo "npm build passed"',
          lint: 'echo "npm lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'npm' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "npm test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "npm build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "npm lint passed"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.rollbackPerformed).toBe(false);
      expect(result.initialState).toHaveLength(2);
    });

    it('should handle npm install command generation', async () => {
      const packageJson = {
        name: 'npm-install-test',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
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
        packageManager: 'npm' as PackageManager,
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
        installScript: {
          type: 'shell',
          command: 'echo "npm install simulation"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.initialState).toHaveLength(1);
    });
  });

  describe('Yarn Package Manager', () => {
    it('should complete workflow with yarn commands', async () => {
      const packageJson = {
        name: 'yarn-test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        devDependencies: {
          typescript: '^4.9.0',
        },
        scripts: {
          test: 'echo "yarn test passed"',
          build: 'echo "yarn build passed"',
          lint: 'echo "yarn lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      // Create yarn.lock to indicate yarn usage
      writeFileSync(join(testDir, 'yarn.lock'), '# Yarn lockfile v1\n');

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'yarn' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "yarn test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "yarn build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "yarn lint passed"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.rollbackPerformed).toBe(false);
      expect(result.initialState).toHaveLength(2);
    });

    it('should handle yarn install command generation', async () => {
      const packageJson = {
        name: 'yarn-install-test',
        version: '1.0.0',
        dependencies: {
          express: '^4.18.2',
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
      writeFileSync(join(testDir, 'yarn.lock'), '# Yarn lockfile v1\n');

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'yarn' as PackageManager,
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
        installScript: {
          type: 'shell',
          command: 'echo "yarn install simulation"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.initialState).toHaveLength(1);
    });
  });

  describe('PNPM Package Manager', () => {
    it('should complete workflow with pnpm commands', async () => {
      const packageJson = {
        name: 'pnpm-test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        devDependencies: {
          typescript: '^4.9.0',
        },
        scripts: {
          test: 'echo "pnpm test passed"',
          build: 'echo "pnpm build passed"',
          lint: 'echo "pnpm lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      // Create pnpm-lock.yaml to indicate pnpm usage
      writeFileSync(
        join(testDir, 'pnpm-lock.yaml'),
        'lockfileVersion: 5.4\n',
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'pnpm' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "pnpm test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "pnpm build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "pnpm lint passed"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.rollbackPerformed).toBe(false);
      expect(result.initialState).toHaveLength(2);
    });

    it('should handle pnpm install command generation', async () => {
      const packageJson = {
        name: 'pnpm-install-test',
        version: '1.0.0',
        dependencies: {
          react: '^18.2.0',
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
      writeFileSync(
        join(testDir, 'pnpm-lock.yaml'),
        'lockfileVersion: 5.4\n',
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'pnpm' as PackageManager,
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
        installScript: {
          type: 'shell',
          command: 'echo "pnpm install simulation"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.initialState).toHaveLength(1);
    });
  });

  describe('Bun Package Manager', () => {
    it('should complete workflow with bun commands', async () => {
      const packageJson = {
        name: 'bun-test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
        },
        devDependencies: {
          typescript: '^4.9.0',
        },
        scripts: {
          test: 'echo "bun test passed"',
          build: 'echo "bun build passed"',
          lint: 'echo "bun lint passed"',
        },
      };

      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2),
      );

      // Create bun.lockb to indicate bun usage (we'll create a text placeholder)
      writeFileSync(
        join(testDir, 'bun.lockb'),
        'bun lockfile placeholder\n',
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'bun' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "bun test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "bun build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "bun lint passed"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.rollbackPerformed).toBe(false);
      expect(result.initialState).toHaveLength(2);
    });

    it('should handle bun install command generation', async () => {
      const packageJson = {
        name: 'bun-install-test',
        version: '1.0.0',
        dependencies: {
          axios: '^1.4.0',
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
      writeFileSync(
        join(testDir, 'bun.lockb'),
        'bun lockfile placeholder\n',
      );

      const upgradeOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'bun' as PackageManager,
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
        installScript: {
          type: 'shell',
          command: 'echo "bun install simulation"',
        },
        rollbackOnFailure: true,
      };

      const testOrchestrator = new UpgradeOrchestrator(testDir);
      const result =
        await testOrchestrator.upgradeWithRollback(upgradeOptions);

      expect(result.errors).toHaveLength(0);
      expect(result.initialState).toHaveLength(1);
    });
  });

  describe('Package Manager Migration', () => {
    it('should handle migration from npm to yarn', async () => {
      const packageJson = {
        name: 'migration-test-package',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
          express: '^4.18.2',
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

      // Start with npm setup (package-lock.json)
      writeFileSync(
        join(testDir, 'package-lock.json'),
        JSON.stringify({ lockfileVersion: 2 }, null, 2),
      );

      // First upgrade with npm
      const npmOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'npm' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "npm test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "npm build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "npm lint passed"',
        },
        rollbackOnFailure: true,
      };

      const npmOrchestrator = new UpgradeOrchestrator(testDir);
      const npmResult =
        await npmOrchestrator.upgradeWithRollback(npmOptions);
      expect(npmResult.errors).toHaveLength(0);

      // Then switch to yarn
      rmSync(join(testDir, 'package-lock.json'), { force: true });
      writeFileSync(join(testDir, 'yarn.lock'), '# Yarn lockfile v1\n');

      const yarnOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'yarn' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "yarn test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "yarn build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "yarn lint passed"',
        },
        rollbackOnFailure: true,
      };

      const yarnOrchestrator = new UpgradeOrchestrator(testDir);
      const yarnResult =
        await yarnOrchestrator.upgradeWithRollback(yarnOptions);
      expect(yarnResult.errors).toHaveLength(0);
      expect(yarnResult.initialState).toHaveLength(2);
    });

    it('should handle migration from yarn to pnpm', async () => {
      const packageJson = {
        name: 'yarn-to-pnpm-migration',
        version: '1.0.0',
        dependencies: {
          react: '^18.2.0',
        },
        devDependencies: {
          typescript: '^5.1.0',
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

      // Start with yarn setup
      writeFileSync(join(testDir, 'yarn.lock'), '# Yarn lockfile v1\n');

      const yarnOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'yarn' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "yarn test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "yarn build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "yarn lint passed"',
        },
        rollbackOnFailure: true,
      };

      const yarnOrchestrator = new UpgradeOrchestrator(testDir);
      const yarnResult =
        await yarnOrchestrator.upgradeWithRollback(yarnOptions);
      expect(yarnResult.errors).toHaveLength(0);

      // Switch to pnpm
      rmSync(join(testDir, 'yarn.lock'), { force: true });
      writeFileSync(
        join(testDir, 'pnpm-lock.yaml'),
        'lockfileVersion: 5.4\n',
      );

      const pnpmOptions: UpgradeOptions = {
        workingDir: testDir,
        packageManager: 'pnpm' as PackageManager,
        testScript: {
          type: 'shell',
          command: 'echo "pnpm test passed"',
        },
        buildScript: {
          type: 'shell',
          command: 'echo "pnpm build passed"',
        },
        lintScript: {
          type: 'shell',
          command: 'echo "pnpm lint passed"',
        },
        rollbackOnFailure: true,
      };

      const pnpmOrchestrator = new UpgradeOrchestrator(testDir);
      const pnpmResult =
        await pnpmOrchestrator.upgradeWithRollback(pnpmOptions);
      expect(pnpmResult.errors).toHaveLength(0);
      expect(pnpmResult.initialState).toHaveLength(2);
    });
  });

  describe('Cross-Package Manager Compatibility', () => {
    it('should maintain same dependency state across package managers', async () => {
      const packageJson = {
        name: 'cross-pm-compatibility',
        version: '1.0.0',
        dependencies: {
          lodash: '^4.17.20',
          express: '~4.18.1',
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

      const baseOptions = {
        workingDir: testDir,
        testScript: {
          type: 'shell' as const,
          command: 'echo "test passed"',
        },
        buildScript: {
          type: 'shell' as const,
          command: 'echo "build passed"',
        },
        lintScript: {
          type: 'shell' as const,
          command: 'echo "lint passed"',
        },
        rollbackOnFailure: true,
      };

      // Test with npm
      const npmOrchestrator = new UpgradeOrchestrator(testDir);
      const npmResult = await npmOrchestrator.upgradeWithRollback({
        ...baseOptions,
        packageManager: 'npm' as PackageManager,
      });

      // Test with yarn
      const yarnOrchestrator = new UpgradeOrchestrator(testDir);
      const yarnResult = await yarnOrchestrator.upgradeWithRollback({
        ...baseOptions,
        packageManager: 'yarn' as PackageManager,
      });

      // Test with pnpm
      const pnpmOrchestrator = new UpgradeOrchestrator(testDir);
      const pnpmResult = await pnpmOrchestrator.upgradeWithRollback({
        ...baseOptions,
        packageManager: 'pnpm' as PackageManager,
      });

      // All should capture the same initial state
      expect(npmResult.initialState).toHaveLength(3);
      expect(yarnResult.initialState).toHaveLength(3);
      expect(pnpmResult.initialState).toHaveLength(3);

      // Verify semver operators are preserved consistently
      [npmResult, yarnResult, pnpmResult].forEach(result => {
        const lodashDep = result.initialState!.find(
          dep => dep.packageName === 'lodash',
        );
        const expressDep = result.initialState!.find(
          dep => dep.packageName === 'express',
        );
        const reactDep = result.initialState!.find(
          dep => dep.packageName === 'react',
        );

        expect(lodashDep?.semverSign).toBe('^');
        expect(expressDep?.semverSign).toBe('~');
        expect(reactDep?.semverSign).toBe('exact');
      });
    });
  });
});
