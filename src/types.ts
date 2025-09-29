export type DependencyType = 'production' | 'development' | 'optional';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export type SemverSign = '^' | '~' | '';

export type InitialDependency = {
  name: string;
  version: string;
  type: DependencyType;
  sign: SemverSign;
};

export type Versions = {
  name: string;
  nextVersions: string[];
};

export type UpgradableDependency = Versions & {
  currentVersion: string;
  type: DependencyType;
};

export type Upgraded = {
  name: string;
  from: string;
  to: string;
};

export type PackageJsonData = {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: any;
};
