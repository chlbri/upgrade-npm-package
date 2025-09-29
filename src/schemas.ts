import * as v from 'valibot';

// Schema for DependencyType
export const DependencyTypeSchema = v.union([
  v.literal('production'),
  v.literal('development'),
  v.literal('optional'),
]);

// Schema for PackageManager
export const PackageManagerSchema = v.union([
  v.literal('npm'),
  v.literal('yarn'),
  v.literal('pnpm'),
  v.literal('bun'),
]);

// Schema for SemverSign
export const SemverSignSchema = v.union([
  v.literal('^'),
  v.literal('~'),
  v.literal(''),
]);

// Schema for InitialDependency
export const InitialDependencySchema = v.object({
  name: v.string(),
  version: v.string(),
  type: DependencyTypeSchema,
  sign: SemverSignSchema,
});

// Schema for Versions
export const VersionsSchema = v.object({
  name: v.string(),
  nextVersions: v.array(v.string()),
});

// Schema for UpgradableDependency
export const UpgradableDependencySchema = v.object({
  name: v.string(),
  nextVersions: v.array(v.string()),
  currentVersion: v.string(),
  type: DependencyTypeSchema,
});

// Schema for Upgraded
export const UpgradedSchema = v.object({
  name: v.string(),
  from: v.string(),
  to: v.string(),
});

// Schema for PackageJsonData
export const PackageJsonDataSchema = v.pipe(
  v.string(),
  v.parseJson(),
  v.looseObject({
    name: v.optional(v.string()),
    version: v.optional(v.string()),
    scripts: v.optional(v.record(v.string(), v.string())),
    dependencies: v.optional(v.record(v.string(), v.string())),
    devDependencies: v.optional(v.record(v.string(), v.string())),
    optionalDependencies: v.optional(v.record(v.string(), v.string())),
    // Allow additional properties for any other package.json fields
  }),
);
