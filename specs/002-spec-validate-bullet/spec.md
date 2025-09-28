# Feature Specification: Enhanced Dependency State Management and Rollback

**Feature ID**: 002-spec-validate-bullet  
**Priority**: High  
**Status**: Draft  
**Date**: 2025-09-28

## Overview

This feature enhances the upgrade-npm-package tool with advanced dependency
state management, rollback capabilities, and configurable script execution.
The system will track dependency versions with their semver signs, provide
rollback functionality when upgrades fail, and support configurable
test/build scripts.

## User Stories

### Primary User Story

As a developer using the upgrade tool, I want the system to automatically
rollback dependencies to their previous state if the admin script fails, so
that my project remains in a working state.

### Supporting User Stories

1. As a developer, I want the tool to remember the initial state of all
   dependencies (version + semver sign) before any upgrades
2. As a developer, I want to configure custom test and build scripts for
   validation
3. As a developer, I want the tool to perform incremental updates rather
   than major version jumps
4. As a developer, I want support for different package managers (npm,
   yarn, pnpm, bun)

## Functional Requirements

### FR1: Dependency State Tracking

- **REQ-001**: System MUST capture initial state of all dependencies
  including:
  - Package name
  - Current version
  - Semver sign ("^", "~", or exact)
- **REQ-002**: State tracking MUST occur before any upgrade operations
- **REQ-003**: State MUST be stored in memory during upgrade process

### FR2: Rollback Mechanism

- **REQ-004**: When admin script fails, system MUST restore all
  dependencies to initial state
- **REQ-005**: Rollback process MUST:
  1. Write dependencies to package.json without semver signs
  2. Run package manager install/add command
  3. Manually add back the original semver signs
  4. Run package manager install again to apply signs

### FR3: Script Configuration

- **REQ-006**: System MUST accept exactly 3 required inner scripts:
  - Test script (for validation)
  - Build script (for compilation/bundling)
  - Install script (for dependency installation)
- **REQ-007**: Additional optional scripts MAY be provided as array
  parameter
- **REQ-008**: Each script MUST specify:
  - Script type: "npm", "yarn", "pnpm", "bun", or "shell"
  - Script command: the actual command to execute

### FR4: Incremental Updates

- **REQ-009**: System MUST perform decremental updates (minor/patch before
  major)
- **REQ-010**: Version fetching MUST be done from package manager registry
- **REQ-011**: Updates MUST respect semver constraints

## Non-Functional Requirements

### NFR1: Reliability

- System MUST guarantee rollback capability in case of failures
- All state changes MUST be atomic (succeed completely or rollback
  completely)

### NFR2: Performance

- Dependency state capture MUST complete within 5 seconds for typical
  projects
- Rollback operations MUST complete within 30 seconds

### NFR3: Compatibility

- MUST support npm, yarn, pnpm, and bun package managers
- MUST work with Node.js >= 20
- MUST maintain backward compatibility with existing CLI interface

## Technical Constraints

### TC1: Package Manager Integration

- MUST integrate with native package manager commands
- MUST handle package manager-specific syntax differences
- MUST support workspace configurations

### TC2: State Management

- State storage MUST be in-memory (no persistent files)
- State MUST be garbage collected after successful completion
- MUST handle concurrent dependency modifications

## Success Criteria

### SC1: State Management

- [ ] System successfully captures dependency state for 100+ dependency
      projects
- [ ] Rollback restores exact previous state in 100% of test cases
- [ ] No dependency version drift after rollback operations

### SC2: Script Execution

- [ ] All script types (npm, yarn, pnpm, bun, shell) execute correctly
- [ ] Script failures trigger appropriate rollback mechanisms
- [ ] Custom script configurations work across different project types

### SC3: Integration

- [ ] Existing CLI interface remains unchanged for basic usage
- [ ] New features integrate seamlessly with current upgrade flow
- [ ] Performance impact < 10% for standard upgrade operations

## Acceptance Criteria

### AC1: Happy Path

```gherkin
Given a project with mixed dependencies and semver signs
When I run the upgrade command with admin mode
And the admin script passes
Then all dependencies are upgraded according to semver constraints
And no rollback is performed
```

### AC2: Rollback Path

```gherkin
Given a project with mixed dependencies and semver signs
When I run the upgrade command with admin mode
And the admin script fails
Then all dependencies are restored to their exact initial state
And the package.json contains original semver signs
And the project is in the same state as before upgrade
```

### AC3: Script Configuration

```gherkin
Given I configure custom test and build scripts
When the upgrade process executes
Then the custom scripts are used instead of defaults
And script failures are properly handled
```

## API Changes

### Enhanced UpgradeOrchestrator Interface

```typescript
interface DependencyState {
  packageName: string;
  version: string;
  semverSign: '^' | '~' | 'exact';
}

interface ScriptConfig {
  type: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell';
  command: string;
}

interface UpgradeOptions {
  testScript: ScriptConfig; // Required
  buildScript: ScriptConfig; // Required
  installScript: ScriptConfig; // Required
  additionalScripts?: ScriptConfig[];
  workingDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
}
```

## Dependencies

### External Dependencies

- Current package manager detection utilities
- Semver parsing and manipulation libraries
- Process execution utilities (execa)

### Internal Dependencies

- Existing UpgradeOrchestrator service
- CiRunnerService for script execution
- Registry services for version fetching

## Risks & Mitigations

### Risk 1: Rollback Failures

**Risk**: Rollback process itself could fail, leaving project in broken
state **Mitigation**: Implement backup state storage and multi-step
rollback verification

### Risk 2: Package Manager Differences

**Risk**: Different package managers handle semver signs differently  
**Mitigation**: Create package manager-specific adapters with comprehensive
testing

### Risk 3: Concurrent Modifications

**Risk**: External processes modifying dependencies during upgrade
**Mitigation**: File system watching and conflict detection

## Out of Scope

- Persistent state storage between sessions
- GUI interface for script configuration
- Integration with CI/CD systems beyond current capabilities
- Support for package managers other than npm, yarn, pnpm, bun

## Clarifications

### Session 1: Script Configuration Details

**Q**: How should script arrays be passed to the CLI?  
**A**: The 3 required scripts should be configurable via CLI flags with
JSON syntax:
`--test-script='{"type":"npm","command":"test"}' --build-script='{"type":"npm","command":"build"}' --install-script='{"type":"npm","command":"install"}'`

**Q**: Should the tool auto-detect common script patterns? **A**: Yes,
detect standard scripts from package.json (test, build, lint) as fallbacks
when custom scripts not provided

**Q**: How to handle script timeouts? **A**: Each script type should have
configurable timeout (default 5 minutes), with graceful termination and
rollback on timeout

### Session 2: Rollback Mechanism Details

**Q**: What if package.json is modified externally during upgrade? **A**:
Implement file watching to detect external changes and abort with clear
error message

**Q**: Should rollback include devDependencies and optionalDependencies?
**A**: Yes, all dependency types should be tracked and rolled back to
maintain complete project state

**Q**: How to handle dependencies that were added/removed during upgrade?
**A**: Track additions/removals separately and reverse these operations
during rollback
