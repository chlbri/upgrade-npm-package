import type {
  DependencyTypeSchema,
  InitialDependencySchema,
  PackageJsonDataSchema,
  PackageManagerSchema,
  SemverSignSchema,
  UpgradableDependencySchema,
  UpgradedSchema,
  VersionsSchema,
} from './schemas';

import * as v from 'valibot';

// Type inference from schemas (these will match the original TypeScript types)
export type DependencyType = v.InferOutput<typeof DependencyTypeSchema>;

export type PackageManager = v.InferOutput<typeof PackageManagerSchema>;

export type SemverSign = v.InferOutput<typeof SemverSignSchema>;

export type InitialDependency = v.InferOutput<
  typeof InitialDependencySchema
>;

export type Versions = v.InferOutput<typeof VersionsSchema>;

export type UpgradableDependency = v.InferOutput<
  typeof UpgradableDependencySchema
>;

export type Upgraded = v.InferOutput<typeof UpgradedSchema>;

export type PackageJsonData = v.InferOutput<typeof PackageJsonDataSchema>;
