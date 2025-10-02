# CHANGELOG

<details>

<summary>

## Version [0.1.4] - Minor Fixes & Dependency Updates

</summary>

### 🚀 New Features

- Upgrade dependencies
- Reset dependencies on error in upgrade workflow

### **Coverage _85%_**

</details>

<br/>

<details>

<summary>

## Version [0.1.2] - Machine Architecture & Development Workflow Improvements

</summary>

### 🚀 New Features

- Upgrade dependencies

</details>

<br/>

<details>

<summary>

## Version [0.1.2] - Machine Architecture & Development Workflow Improvements

</summary>

### 🚀 New Features

#### State Machine Architecture

- ✨ **XState Integration**: Complete state machine implementation for
  upgrade workflow
- ✨ **Machine Provider System**: Modular provider pattern for actions,
  predicates, and promises
- ✨ **Enhanced State Management**: Better state transitions and error
  handling
- ✨ **Interactive Development Mode**: Real-time state monitoring and
  debugging

#### Development Workflow Enhancements

- ✨ **TypeScript ESM Support**: Enhanced tsx integration for development
- ✨ **Module Resolution**: Updated to bundler mode for better
  compatibility
- ✨ **Development Scripts**: Added `dev` script for interactive testing
- ✨ **Dependency Management**: Improved dev vs runtime dependency
  organization

### 🔧 Technical Improvements

#### Configuration Updates

- **TypeScript 5.x**: Updated module resolution to `bundler` for modern
  tooling
- **ESM Configuration**: Enhanced `ts-node` ESM support
- **Dependency Reorganization**: Better separation of dev and runtime
  dependencies
- **Development Environment**: Added tsx and ts-node for better development
  experience

#### State Machine Implementation

- **Async State Management**: Promise-based state transitions
- **Error Handling**: Comprehensive error state management with exit
  strategies
- **Internet Connectivity**: Automatic connection checks with timeout
  handling
- **Batch Operations**: Support for batched actions in state transitions

### 🧪 Testing & Development

#### Enhanced Development Experience

- **Live State Monitoring**: Real-time state value logging
- **Interactive Testing**: Manual trigger system for development
- **Timeout Management**: Configurable delays for different operations
- **Verbose Logging**: Conditional detailed logging based on configuration

### 📚 Documentation

- **State Machine Documentation**: Clear state transition documentation
- **Provider Pattern**: Examples of modular provider implementation
- **Development Setup**: Updated development workflow instructions

</details>

---

<details>

  <summary>
  
  ## Version [0.1.0] - Enhanced Dependency State Management

  </summary>

### 🚀 New Features

#### Enhanced CLI Interface

- ✨ **Package Manager Selection**: Support for npm, yarn, pnpm, and bun
- ✨ **Auto-generated Install Commands**: Automatically detects and
  configures package manager commands
- ✨ **Rollback Support**: New `--rollback` flag for enhanced safety
  (enabled by default)
- ✨ **Enhanced Reporting**: Comprehensive upgrade reports with rollback
  status
- ✨ **Verbose Logging**: Detailed execution logs with `--verbose` flag

#### Core Engine Improvements

- ✨ **Dependency State Management**: Complete state tracking and
  restoration
- ✨ **Semver Preservation**: Maintains original semver operators (`^`,
  `~`, exact)
- ✨ **Atomic Operations**: All-or-nothing upgrade approach
- ✨ **Script Execution Framework**: Configurable test/build/install script
  execution
- ✨ **Rollback Mechanism**: Automatic state restoration on failures

#### Enhanced Reporting System

- ✨ **formatEnhancedUpgradeResult()**: Comprehensive upgrade result
  formatting
- ✨ **logRollbackOperation()**: Detailed rollback status logging
- ✨ **logStateCaptureOperation()**: State management operation logging
- ✨ **Enhanced Error Reporting**: Clear error messages with context

#### Semver Utilities

- ✨ **parseSemverSign()**: Extract and preserve semver operators
- ✨ **extractCleanVersion()**: Clean version parsing
- ✨ **reconstructVersionString()**: Rebuild versions with original
  operators
- ✨ **parseDependencyVersion()**: Complete dependency version parsing

### 🔧 Technical Improvements

- **TypeScript 5.x**: Full ESM support with modern TypeScript features
- **Constitutional Compliance**: String union types for type safety
- **TDD Methodology**: Comprehensive test coverage with integration tests
- **Architecture Refactoring**: Service-oriented architecture with clear
  separation of concerns

### 📚 Documentation

- **Complete README**: Comprehensive usage guide and feature documentation
- **Architecture Documentation**: Clear component descriptions and
  interaction patterns
- **CLI Reference**: Detailed command-line options and examples
- **Contributing Guidelines**: Development setup and contribution workflow

### 🧪 Testing

- **117 Tests**: Complete test suite covering all functionality
- **Integration Tests**: End-to-end validation of rollback and script
  execution
- **Unit Tests**: Comprehensive coverage of individual components
- **Contract Tests**: API validation and compliance testing

### 🏗 Build & Development

- **Modern Toolchain**: Rollup bundling with TypeScript compilation
- **Size Optimization**: Bundle size limits and monitoring
- **Development Workflow**: Hot reloading and watch mode support
- **Quality Assurance**: ESLint, Prettier, and comprehensive testing

</details>

---

## Author

**chlbri** (bri_lvi@icloud.com)

- GitHub: [@chlbri](https://github.com/chlbri)
- Portfolio:
  [BemeDev Libraries](https://github.com/chlbri?tab=repositories)

## Liens

- [Documentation](https://github.com/chlbri/new-package)
