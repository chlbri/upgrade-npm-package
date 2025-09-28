// Valid package managers supported by the CLI
export const VALID_PACKAGE_MANAGERS = [
  'npm',
  'yarn',
  'pnpm',
  'bun',
] as const;

// Default package manager
export const DEFAULT_PACKAGE_MANAGER = 'npm';

// Default script timeout in milliseconds (5 minutes)
export const DEFAULT_SCRIPT_TIMEOUT = 300000;

// Package manager install commands mapping
export const INSTALL_COMMANDS: Record<string, string> = {
  npm: 'install',
  yarn: 'install',
  pnpm: 'install',
  bun: 'install',
};
