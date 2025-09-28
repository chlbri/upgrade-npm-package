# Enhanced Dependency State Management - Quickstart Guide

**Feature**: 002-spec-validate-bullet  
**Date**: 2025-09-28

This quickstart guide demonstrates the enhanced dependency state management
with simplified script configuration and automatic rollback functionality.

## Prerequisites

- Node.js >= 22
- Package manager: npm, yarn, pnpm, or bun
- Working upgrade-npm-package installation
- Sample project with dependencies

## Core Concepts

### Simplified Script Configuration

The system now requires only **two user-provided scripts**:

- **Test Script**: Your project's test command
- **Build Script**: Your project's build command

All other scripts (install, dependency upgrades) are automatically
generated based on detected package manager.

### Automatic Package Manager Detection

The system detects your package manager from:

- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `bun.lockb` → bun
- `package-lock.json` → npm

## Basic Usage

### Scenario 1: Auto-Detection with Default Scripts

**Setup**:

```bash
# Create test project
mkdir test-upgrade-simplified
cd test-upgrade-simplified
pnpm init

# Add test dependencies
pnpm add lodash@4.17.20 express@4.18.1
pnpm add -D typescript@4.9.0

# Add only test and build scripts
pnpm pkg set scripts.test="echo 'Tests passed'"
pnpm pkg set scripts.build="echo 'Build completed'"
```

**Execution**:

```bash
# Auto-detect package manager and use default scripts
upgrade-npm-package

# Expected behavior:
# 1. Detects pnpm as package manager
# 2. Auto-generates: pnpm install --frozen-lockfile
# 3. Captures initial state (lodash@^4.17.20, express@^4.18.1, typescript@^4.9.0)
# 4. Runs upgrade process with test/build validation
# 5. Additional scripts used for integration testing only
```

**Validation**:

- Check package.json shows upgraded versions with preserved semver signs
- Verify node_modules contains upgraded packages
- Confirm no rollback warnings in output

### Scenario 2: Custom Script Configuration

**Setup**:

```bash
# Create test project with custom scripts
mkdir test-custom-scripts
cd test-custom-scripts
yarn init -y

# Add dependencies
yarn add lodash@4.17.20 express@4.18.1

# Add custom scripts
yarn config set scripts.test "jest --passWithNoTests"
yarn config set scripts.build "./custom-build.sh"

# Create custom build script
echo '#!/bin/bash\necho "Custom build successful"' > custom-build.sh
chmod +x custom-build.sh
```

**Execution**:

```bash
# Run with custom script configuration
upgrade-npm-package \
  --test-script "jest --passWithNoTests" \
  --build-script "./custom-build.sh"

# Expected behavior:
# 1. Detects yarn as package manager
# 2. Auto-generates: yarn install --frozen-lockfile
# 3. Uses custom test and build scripts
# 4. Additional dependency upgrade scripts handled internally
```

### Scenario 3: Failed Upgrade with Automatic Rollback

**Setup**:

```bash
# Create test project with failing test script
mkdir test-upgrade-rollback
cd test-upgrade-rollback
npm init -y

# Add dependencies
npm install lodash@4.17.20 express@4.18.1

# Add failing test script
npm pkg set scripts.test="exit 1"
npm pkg set scripts.build="echo 'Build completed'"
```

**Execution**:

```bash
# Run upgrade (will trigger rollback)
upgrade-npm-package --test-script "npm test" --build-script "npm run build"

# Expected behavior:
# 1. Captures initial dependency state
# 2. Auto-generates install script: npm ci
# 3. Attempts dependency upgrades
# 4. Test script fails (exit 1)
# 5. Automatic rollback triggered
# 6. Dependencies restored to exact initial state
```

**Validation**:

- Confirm package.json matches original state exactly
- Verify node_modules reverted to original versions
- Check rollback success message in output
- Ensure project is in working state

### Scenario 4: Package Manager Auto-Detection

**Test Different Package Managers**:

```bash
# Test NPM detection
mkdir test-npm && cd test-npm
npm init -y
npm install lodash@4.17.20
npm pkg set scripts.test="echo 'NPM test passed'"
npm pkg set scripts.build="echo 'NPM build completed'"

# Test Yarn detection
mkdir ../test-yarn && cd ../test-yarn
yarn init -y
yarn add lodash@4.17.20
yarn config set scripts.test "echo 'Yarn test passed'"
yarn config set scripts.build "echo 'Yarn build completed'"

# Test PNPM detection
mkdir ../test-pnpm && cd ../test-pnpm
pnpm init
pnpm add lodash@4.17.20
pnpm pkg set scripts.test="echo 'PNPM test passed'"
pnpm pkg set scripts.build="echo 'PNPM build completed'"
```

**Execution**:

```bash
# Test each package manager auto-detection
cd test-npm && upgrade-npm-package
cd ../test-yarn && upgrade-npm-package
cd ../test-pnpm && upgrade-npm-package

# Expected behavior:
# 1. NPM: Detects package-lock.json → generates "npm ci"
# 2. Yarn: Detects yarn.lock → generates "yarn install --frozen-lockfile"
# 3. PNPM: Detects pnpm-lock.yaml → generates "pnpm install --frozen-lockfile"
```

### Scenario 5: Integration Testing Workflow

**Setup**:

```bash
# Create project to test additional scripts positioning
mkdir test-integration-scripts
cd test-integration-scripts
pnpm init
pnpm add lodash@4.17.20 express@4.18.1
pnpm add -D jest@29.0.0

# Add user-provided scripts only
pnpm pkg set scripts.test="jest"
pnpm pkg set scripts.build="tsc && rollup -c"
```

**Execution**:

```bash
# Run upgrade to see additional scripts in integration testing phase
upgrade-npm-package --verbose

# Expected behavior:
# 1. User scripts (test, build) used for validation during upgrade
# 2. Additional dependency upgrade scripts execute during integration testing
# 3. Additional scripts NOT used at startup - only for testing workflow
```

**Validation**:

- Verify user scripts run during dependency validation
- Confirm additional scripts execute in integration testing phase
- Check that additional scripts don't interfere with startup process

## Expected Outputs

### Successful Upgrade

```
🔍 Capturing initial dependency state...
✅ State captured: 3 dependencies
🚀 Running admin CI check...
✅ Admin CI passed
📦 Upgrading dependencies incrementally...
  ✅ lodash: 4.17.20 → 4.17.21 (patch)
  ✅ express: 4.18.1 → 4.18.2 (patch)
  ✅ typescript: 4.9.0 → 4.9.5 (patch)
✅ Upgrade completed successfully
```

### Failed Upgrade with Rollback

```
🔍 Capturing initial dependency state...
✅ State captured: 2 dependencies
🚀 Running admin CI check...
❌ Admin CI failed (exit code: 1)
🔄 Rolling back to initial state...
  📝 Restoring package.json...
  📦 Running package manager install...
  🔧 Applying semver signs...
  ✅ Rollback completed successfully
⚠️  Upgrade failed but project restored to working state
```

### Custom Script Execution

```
🔍 Capturing initial dependency state...
✅ State captured: 1 dependency
🛠️  Executing custom test script (npm test)...
✅ Test script completed (200ms)
🛠️  Executing custom build script (shell ./custom-build.sh)...
✅ Build script completed (150ms)
📦 Upgrading dependencies...
```

## Validation Steps

After running each scenario:

1. **State Consistency**: Verify package.json and node_modules are
   consistent
2. **Rollback Integrity**: Confirm rolled-back projects match initial state
   exactly
3. **Script Execution**: Check custom scripts executed with correct
   parameters
4. **Error Handling**: Ensure failures provide clear error messages and
   recovery steps
5. **Performance**: Validate operations complete within expected timeframes

## Troubleshooting

### Common Issues

**Issue**: State capture fails **Solution**: Ensure valid package.json
exists and dependencies are installed

**Issue**: Rollback fails **Solution**: Check file permissions and package
manager availability

**Issue**: Custom scripts fail **Solution**: Verify script configuration
syntax and executable permissions

**Issue**: Package manager not detected **Solution**: Ensure appropriate
lock files exist (package-lock.json, yarn.lock, pnpm-lock.yaml)

### Debug Mode

```bash
# Enable debug output for detailed troubleshooting
DEBUG=upgrade-npm-package:* upgrade-npm-package --verbose --admin
```

## Success Criteria

- [ ] All test scenarios complete without errors
- [ ] Rollback restores exact initial state in failure cases
- [ ] Custom script configurations work correctly
- [ ] Incremental updates follow semver best practices
- [ ] All package managers supported and detected correctly
- [ ] Performance meets specified targets (< 5s state capture, < 30s
      rollback)

This quickstart validates the complete enhanced dependency state management
and rollback functionality across different scenarios and configurations.
