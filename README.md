# upgrade-npm-package

🚀 **Enhanced NPM Package Upgrader with Rollback Support**

A TypeScript CLI tool that provides intelligent, dependency-aware package
upgrades with automatic rollback capabilities for Node.js projects.

## ✨ Features

### 🎯 Smart Upgrade Modes

- **Fast-path Admin Mode**: Quick upgrade validation using CI/admin scripts
- **Iterative Mode**: Per-dependency upgrades with individual validation
- **Enhanced Dependency State Management**: Tracks and preserves semver
  operators

### 🔄 Rollback & Safety

- **Automatic Rollback**: Reverts changes on script execution failures
- **State Preservation**: Maintains original semver signs (`^`, `~`, exact
  versions)
- **Atomic Operations**: All-or-nothing approach for safe upgrades

### 📦 Package Manager Support

- **Multi-PM Compatible**: npm, yarn, pnpm, bun
- **Auto-detection**: Automatically generates install commands based on
  selected package manager
- **Configurable Scripts**: Customizable test, build, and install commands

### 📊 Enhanced Reporting

- **Comprehensive Output**: Detailed upgrade reports with rollback status
- **Verbose Logging**: Optional detailed execution logs
- **Error Tracking**: Clear error reporting with rollback information

## 🚀 Installation

```bash
npm install -g upgrade-npm-package
# or
yarn global add upgrade-npm-package
# or
pnpm add -g upgrade-npm-package
```

## 📖 Usage

### Basic Usage

```bash
# Fast-path mode (recommended for most projects)
upgrade-npm-package --admin

# Iterative mode (per-dependency upgrades)
upgrade-npm-package

# With specific package manager
upgrade-npm-package --package-manager pnpm --admin

# Verbose output
upgrade-npm-package --verbose --admin
```

### CLI Options

```bash
upgrade-npm-package [options]

Options:
  --admin                 Enable fast-path admin mode
  --package-manager <pm>  Package manager (npm|yarn|pnpm|bun)
  --working-dir <dir>     Working directory (default: current)
  --rollback             Enable rollback on failure (default: true)
  --test-script <cmd>    Custom test script command
  --build-script <cmd>   Custom build script command
  --verbose              Enable verbose logging
  --help                 Show help
  --version              Show version
```

### Advanced Configuration

```bash
# Custom working directory
upgrade-npm-package --working-dir ./my-project --admin

# Custom scripts with specific package manager
upgrade-npm-package \
  --package-manager yarn \
  --test-script "yarn test:unit" \
  --build-script "yarn build:prod" \
  --admin

# Disable rollback (not recommended)
upgrade-npm-package --no-rollback --admin
```

## 🏗 Architecture

### Core Components

- **CLI Interface** (`src/cli/upgrade.ts`): Command-line interface with
  enhanced options
- **Upgrade Orchestrator** (`src/services/upgrade-orchestrator.ts`): Main
  orchestration logic
- **Dependency State Manager**
  (`src/services/dependency-state-manager.ts`): State tracking and rollback
- **Package Manager Adapter** (`src/services/package-manager-adapter.ts`):
  Multi-PM abstraction
- **Enhanced Reporting** (`src/libs/report.ts`): Comprehensive output
  formatting

### Key Features

#### Semver Preservation

The tool preserves original semver operators during upgrades:

```json
// Before
{
  "lodash": "^4.17.20",
  "axios": "~0.27.0",
  "typescript": "4.8.0"
}

// After upgrade (operators preserved)
{
  "lodash": "^4.17.21",
  "axios": "~0.27.2",
  "typescript": "4.9.4"
}
```

#### Rollback Safety

Automatic rollback on script failures:

1. Capture initial dependency state
2. Perform upgrades
3. Execute validation scripts
4. On failure: restore original state
5. Report rollback status

## 🔧 Development

### Prerequisites

- Node.js >= 20
- TypeScript 5.x
- One of: npm, yarn, pnpm, bun

### Setup

```bash
git clone https://github.com/chlbri/upgrade-npm-package
cd upgrade-npm-package
npm install
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test tests/integration

# Run with coverage
npm run test:coverage
```

### Build

```bash
# Build library
npm run build

# Build and watch
npm run build:watch
```

## 📋 Configuration

### Project Scripts

The tool looks for these scripts in your `package.json`:

```json
{
  "scripts": {
    "ci:admin": "npm run test && npm run build",
    "test": "vitest run",
    "build": "tsc"
  }
}
```

### Supported Package Managers

- **npm**: `npm install`, `npm run <script>`
- **yarn**: `yarn install`, `yarn <script>`
- **pnpm**: `pnpm install`, `pnpm run <script>`
- **bun**: `bun install`, `bun run <script>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

This project uses conventional commits. See
`.github/commit-message-editor.md` for detailed format guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- [Report Bug](https://github.com/chlbri/upgrade-npm-package/issues)
- [Request Feature](https://github.com/chlbri/upgrade-npm-package/issues)
- [Documentation](https://github.com/chlbri/upgrade-npm-package)

## 🎯 Roadmap

- [x] Enhanced dependency state management
- [x] Automatic rollback mechanism
- [x] Multi package manager support
- [x] Comprehensive CLI interface
- [ ] Configuration file support
- [ ] Plugin system for custom validators
- [ ] Integration with popular CI/CD platforms

## 👨‍💻 Author

**chlbri** (bri_lvi@icloud.com)

- GitHub: [@chlbri](https://github.com/chlbri)
- Portfolio:
  [BemeDev Libraries](https://github.com/chlbri?tab=repositories)
