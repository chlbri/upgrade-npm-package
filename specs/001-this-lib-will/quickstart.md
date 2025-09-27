# Quickstart: Safe dependency upgrader with fallback

This quickstart outlines the end-to-end validation scenarios from the spec.

## Admin Fast Path

1. Ensure project has scripts `ci` and `ci:admin`.
2. Run the tool in admin mode.
3. Expected: The tool runs `pnpm run ci:admin`. If it passes, dependencies
   are updated accordingly (per project policy) and process exits without
   per-version iteration.
4. Output: Summary report with upgraded/unchanged packages, warnings if any
   (e.g., custom registry).

## Iterative Upgrade Mode

1. Run the tool in iterative mode.
2. The tool lists all direct dependencies (including optionalDependencies)
   and fetches newer stable versions from npmjs.org.
3. For each package with newer versions, the tool attempts upgrades from
   newest to oldest newer, running `pnpm run ci` after each attempt.
4. On CI pass: accept upgrade (preserve semver operator, bump minimal
   version), sync lockfile.
5. On CI fail: revert to previous package.json/lockfile state for this
   package and try next lower version.
6. After processing all packages, the tool prints a summary report:
   upgraded, skipped (with reasons), remaining outdated, and warnings
   (e.g., custom registry detected).

## Edge Cases

- No newer versions: tool reports “up to date” and exits.
- Pre-releases excluded unless a future flag is present.
- Peer conflicts cause revert and continue; no automatic peer adjustments.
- Only direct dependencies are considered.

---

Based on Constitution v1.1.0# Quickstart (Phase 1)

1. Ensure Node >= 20 and pnpm installed.
2. Run fast path:
   - `pnpm run ci:admin`
   - If green, stop. Otherwise continue to iterative mode.
3. Iterative mode:
   - List newer stable versions for direct deps (deps/dev/optional) from
     npmjs.org
   - For each dep: try newest → oldest newer
     - After each bump: `pnpm run ci`
     - On fail: revert and try next lower
     - On pass: persist and continue
4. Summary report: upgraded, skipped (with reasons), warnings.

## CLI Usage with cmd-ts

```bash
# Basic usage
upgrade-npm-package

# Admin mode (fast-path)
upgrade-npm-package --admin

# Dry run mode
upgrade-npm-package --dry-run

# Verbose output
upgrade-npm-package --verbose

# Specify working directory
upgrade-npm-package --working-dir /path/to/project
```

**Features:**

- Type-safe argument parsing via cmd-ts
- Clear error messages and help text
- Progress reporting during operations
- Structured summary output
