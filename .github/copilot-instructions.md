## Instructions pour de meilleurs commits

- Toujours écrire des messages de commit clairs et concis.
- Utiliser strictement l'anglais pour les messages de commit.
- Utiliser la (documentation)[.github/commit-message-editor.md] de
  l'extension "adam-bender.commit-message-editor"
- Inclure la (configuration actuelle
  utilisateur)[.github/vsix.commit-message-editor.json] de l'extension
  adam-bender.commit-message-editor, pour le format de chaque commit.

## Enhanced Dependency State Management Context

**Current Feature**: 002-spec-validate-bullet - Enhanced Dependency State
Management and Rollback

**Tech Stack**:

- Language: TypeScript 5.x with Node.js >= 20
- Framework: cmd-ts, execa, semver parsing utilities
- Storage: In-memory state management during upgrade process (no persistent
  storage)
- Project Type: Single library project - CLI tool with service layer
  architecture

**Key Components**:

- DependencyStateManager: Core state management service
- PackageManagerAdapter: Abstraction for npm/yarn/pnpm/bun
- ScriptConfig: Type-safe script execution configuration
- Rollback mechanism: Atomic operations with full state restoration

**Recent Changes**:

- Added dependency state tracking with semver sign preservation
- Implemented automatic rollback on script execution failures
- Enhanced CLI with configurable test/build script support
- Added package manager adapter pattern for PM compatibility
