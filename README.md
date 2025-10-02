# @bemedev/upgrade-npm-package

🚀 **State Machine-Driven NPM Package Upgrader with Rollback Support**

A TypeScript CLI tool powered by state machines that provides intelligent,
dependency-aware package upgrades with automatic rollback capabilities for
Node.js projects.

## ✨ Features

### 🎯 State Machine Architecture

- **Deterministic Workflow**: Predictable upgrade process orchestrated by
  state machines
- **Incremental Upgrade Mode**: Per-dependency upgrades with decremental
  version fallback
- **Peer Dependencies Handling**: Automatic detection and upgrade of peer
  dependencies
- **Enhanced Dependency State Management**: Tracks and preserves semver
  operators throughout the process

### 🔄 Rollback & Safety

- **Automatic Rollback**: Reverts changes on script execution failures via
  state machine transitions
- **State Preservation**: Maintains original semver signs (`^`, `~`, exact
  versions) in dependency snapshots
- **Atomic Operations**: All-or-nothing approach with complete state
  restoration
- **Error Recovery**: Structured error handling with automatic dependency
  reset

### 📦 Package Manager Support

- **Multi-PM Compatible**: npm, yarn, pnpm, bun with unified interface
- **Dynamic Command Generation**: Automatically generates install commands
  based on selected package manager
- **Configurable Validation**: Custom test and build commands via CI script
  configuration
- **Version Detection**: Automatic package.json and tsconfig.json
  validation

### 📊 State-Driven Reporting

- **Real-time State Tracking**: Monitor upgrade progress through state
  transitions
- **Verbose Logging**: Detailed execution logs with state change
  notifications
- **Comprehensive Output**: Detailed upgrade reports with dependency
  versioning
- **Error Context**: Clear error messages with state machine context

## 🚀 Installation

```bash
npm install -g @bemedev/upgrade-npm-package
# or
yarn global add @bemedev/upgrade-npm-package
# or
pnpm add -g @bemedev/upgrade-npm-package
# or
bun add -g @bemedev/upgrade-npm-package
```

## 📖 Usage

### Basic Usage

```bash
# Run upgrade with default package manager (pnpm)
upgrade-npm-package

# With specific package manager
upgrade-npm-package --package pnpm
upgrade-npm-package -p npm

# Custom working directory
upgrade-npm-package --cwd ./my-project

# Verbose output (see state transitions)
upgrade-npm-package --verbose
upgrade-npm-package -v
```

### CLI Options

```bash
upgrade-npm-package [options]

Options:
  -c, --cwd <dir>          Working directory (default: current directory)
  -p, --package <pm>       Package manager: npm|yarn|pnpm|bun (default: pnpm)
  -v, --verbose            Enable verbose logging with state transitions
  --help                   Show help
  --version                Show version
```

### How It Works

The tool uses a state machine to orchestrate the upgrade process:

1. **Checking Phase**: Validates package.json and tsconfig.json existence
2. **Dependencies Analysis**: Fetches latest versions from npm registry
3. **Incremental Upgrade**: Attempts upgrades decrementally (latest →
   lowest compatible)
4. **Peer Dependencies**: Handles peer dependency upgrades
5. **Validation**: Runs CI scripts (test → build → lint)
6. **Rollback**: Automatically reverts on failure

### Advanced Examples

```bash
# Monitor state transitions in real-time
upgrade-npm-package --verbose

# Use in CI/CD pipeline
upgrade-npm-package --package npm --cwd /path/to/project

# Different package managers for different projects
upgrade-npm-package --package yarn --cwd ./frontend
upgrade-npm-package --package pnpm --cwd ./backend
upgrade-npm-package --package bun --cwd ./api

# Integrate with scripts
#!/bin/bash
if upgrade-npm-package --verbose; then
  echo "✅ All dependencies upgraded successfully"
  git add package.json pnpm-lock.yaml
  git commit -m "chore(deps): upgrade dependencies"
else
  echo "❌ Upgrade failed, dependencies rolled back"
  exit 1
fi
```

## 🏗 Architecture

This project uses a **state machine architecture** powered by
[@bemedev/app-ts](https://github.com/chlbri/app-ts), providing
deterministic and predictable upgrade workflows.

### Core Components

- **State Machine Definition** (`src/machine.machine.ts`):
  - Defines the complete upgrade workflow as a hierarchical state machine
  - States: `idle` → `checking` → `upgrade` → `success`/`errors`
  - Handles file validation, dependency analysis, upgrades, and rollback

- **State Machine Provider** (`src/machine.machine.provider.ts`):
  - Implements all actions, guards, and async operations
  - Package manager command generation (npm, yarn, pnpm, bun)
  - Dependency version fetching from npm registry via axios
  - JSON file manipulation with edit-json-file
  - Script execution via execa

- **State Machine Service** (`src/machine.machine.service.ts`):
  - Interprets and runs the state machine
  - Manages context and persistent context
  - Provides state subscription for real-time monitoring

- **CLI Interface** (`src/cli/upgrade.ts`):
  - Command-line interface built with cmd-ts
  - Options parsing and validation
  - Entry point to the upgrade workflow

- **Main Orchestrator** (`src/upgrade.ts`):
  - Connects CLI to state machine service
  - Manages state subscriptions
  - Handles the complete upgrade lifecycle

- **Schemas & Types** (`src/schemas.ts`, `src/types.ts`):
  - Valibot schemas for runtime validation
  - TypeScript types for compile-time safety
  - Package manager, dependency, and version schemas

### State Machine Workflow

```
idle
  ↓ START event
checking
  ├── files
  │   ├── packageJson (validate existence)
  │   └── tsConfigJson (validate existence)
  └── dependencies
      ├── initials (capture current state)
      └── upgradables (fetch latest versions)
  ↓
upgrade
  ├── decremental
  │   ├── upgrade (try versions: latest → lowest)
  │   ├── validate (run CI scripts)
  │   └── reset (rollback on failure)
  └── peerDependencies
      ├── upgrade
      └── validate
  ↓
success / errors
```

### Key Features

#### Semver Preservation

The tool preserves original semver operators during upgrades using schema
validation:

```json
// Before (captured in InitialDependency state)
{
  "lodash": "^4.17.20",
  "axios": "~0.27.0",
  "typescript": "4.8.0"
}

// After upgrade (operators preserved)
{
  "lodash": "^4.17.21",
  "axios": "~0.27.2",
  "typescript": "4.9.5"
}
```

#### Decremental Upgrade Strategy

The state machine tries versions from highest to lowest:

1. Fetch all available versions for each dependency
2. Try installing the latest version
3. Run validation scripts (test → build → lint)
4. If failure: try next lower version
5. Repeat until success or no more versions
6. Collect successfully upgraded dependencies

#### Automatic Rollback

State machine-driven rollback on validation failures:

1. **Capture State**: Store initial dependencies with semver signs
2. **Perform Upgrades**: Apply decremental upgrade strategy
3. **Validate**: Execute CI scripts via state machine
4. **On Failure**: Transition to `reset` state
5. **Restore**: Reinstall original versions from captured state
6. **Report**: Log rollback completion

## 🔧 Development

### Prerequisites

- Node.js >= 22 (required)
- TypeScript 5.9.x
- pnpm (recommended) or npm, yarn, bun

### Setup

```bash
git clone https://github.com/chlbri/upgrade-npm-package
cd upgrade-npm-package
pnpm install
pnpm run build
```

### Testing

```bash
# Run all tests (includes build)
pnpm test

# Run with coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch
```

### Build

```bash
# Clean build (removes lib/ and rebuilds)
pnpm run build

# Rollup only (faster for incremental builds)
pnpm run rollup
```

### Development Scripts

```bash
# Full CI pipeline (lint + test + format)
pnpm run ci

# Lint and fix
pnpm run lint

# Format code
pnpm run prettier

# Size limit check
pnpm run size

# Clean reinstall
pnpm run rinit
```

## 📋 Configuration

### Required Files

The state machine validates these files before starting:

- **package.json**: Must exist in working directory
- **tsconfig.json**: Must exist for TypeScript projects

### CI Script Configuration

The tool looks for a `ci:admin` script in your `package.json`:

```json
{
  "scripts": {
    "ci:admin": "pnpm run test && pnpm run build && pnpm run lint",
    "test": "vitest run",
    "build": "rollup -c",
    "lint": "eslint src/**/*.ts --fix"
  }
}
```

The state machine executes this script after each upgrade attempt to
validate the changes.

### Supported Package Managers

The provider dynamically generates commands based on your selection:

| Manager  | Install Command | Run Command         |
| -------- | --------------- | ------------------- |
| **npm**  | `npm install`   | `npm run <script>`  |
| **yarn** | `yarn install`  | `yarn <script>`     |
| **pnpm** | `pnpm install`  | `pnpm run <script>` |
| **bun**  | `bun install`   | `bun run <script>`  |

### State Machine Context

The machine maintains two contexts:

- **Context**: Runtime state (errors, warnings, upgraded packages)
- **Persistent Context**: Configuration and results
  - `workingDir`: Target directory
  - `packageManager`: Selected PM
  - `verbose`: Logging level
  - `files`: Validated file paths
  - `dependencies`: Initial and upgradable dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the state machine architecture
4. Run tests: `pnpm test`
5. Commit using conventional commits (see below)
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

This project strictly follows **Conventional Commits** specification. See
`.github/copilot-instructions.md` and `.github/commit-message-editor.md`
for detailed guidelines.

**Required format:**

```
<type>(<scope>): <description>

<body>

@chlbri:bri_lvi@icloud.com
```

**Available types:** `feat`, `fix`, `hotfix`, `docs`, `build`, `chore`,
`ci`, `perf`, `refactor`, `revert`, `style`, `test`

**VS Code Extension:** Install `adam-bender.commit-message-editor` for
guided commit creation.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- [Report Bug](https://github.com/chlbri/upgrade-npm-package/issues)
- [Request Feature](https://github.com/chlbri/upgrade-npm-package/issues)
- [Documentation](https://github.com/chlbri/upgrade-npm-package)

## 🎯 Roadmap

### Completed ✅

- [x] State machine-driven architecture (@bemedev/app-ts)
- [x] Enhanced dependency state management with semver preservation
- [x] Automatic rollback mechanism with state restoration
- [x] Multi package manager support (npm, yarn, pnpm, bun)
- [x] Comprehensive CLI interface with cmd-ts
- [x] Decremental upgrade strategy
- [x] Peer dependencies handling
- [x] Runtime validation with Valibot schemas
- [x] Real-time state monitoring

### Planned 🚀

- [ ] Configuration file support (.upgraderc.yaml/.json/js/ts)
- [ ] Dependency conflict resolution strategies
- [ ] Custom validator hooks in state machine
- [ ] Parallel dependency upgrades with worker threads
- [ ] Integration with GitHub Actions
- [ ] MCP
- [ ] Web dashboard for state visualization
- [ ] Dry-run mode with upgrade preview

## � Tech Stack

- **Runtime**: Node.js >= 22
- **Language**: TypeScript 5.9.3
- **State Machine**: [@bemedev/app-ts](https://github.com/chlbri/app-ts)
  v1.2.1
- **CLI Framework**: [cmd-ts](https://github.com/Schniz/cmd-ts) v0.14.2
- **Validation**: [Valibot](https://valibot.dev/) v1.1.0
- **Process Execution**: [execa](https://github.com/sindresorhus/execa)
  v9.6.0
- **Semver**: [semver](https://github.com/npm/node-semver) v7.7.2
- **HTTP Client**: [axios](https://axios-http.com/) v1.12.2
- **JSON Editing**:
  [edit-json-file](https://github.com/IonicaBizau/edit-json-file) v1.8.1
- **Build Tool**: [Rollup](https://rollupjs.org/) v4.52.3
- **Testing**: [Vitest](https://vitest.dev/) v3.2.4

## �👨‍💻 Author

**chlbri** (bri_lvi@icloud.com)

- GitHub: [@chlbri](https://github.com/chlbri)
- Portfolio: [BemeDev](https://bemedev.vercel.app)
- Libraries:
  [BemeDev on GitHub](https://github.com/chlbri?tab=repositories)
