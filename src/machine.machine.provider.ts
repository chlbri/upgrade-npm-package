import { existsSync } from 'fs';
import { parse, parseAsync, safeParse, string } from 'valibot';
import { machine } from './machine.machine';
import { PackageJsonDataSchema, SemverSignSchema } from './schemas';
import type {
  InitialDependency,
  UpgradableDependency,
  Upgraded,
} from './types';
import { createCmd } from './utils/cmd';
import { logTitle } from './utils/log';

export const provider = machine.provideOptions(
  ({ assign, voidAction }) => ({
    predicates: {
      verbose: ({ pContext }) => pContext.verbose === true,

      'files.packageJson.existence': ({ pContext }) => {
        const dir = pContext.files?.workingDir;
        console.log('dir', dir);
        if (!dir) return false;

        const path = `${dir}/package.json`;
        return existsSync(path);
      },

      'files.tsConfigJson.existence': ({ pContext }) => {
        const dir = pContext.files?.workingDir;
        if (!dir) return false;

        const path = `${dir}/tsconfig.json`;
        return existsSync(path);
      },

      hasBuildScript: ({ pContext }) => {
        return safeParse(
          string(),
          pContext.files?.packageJson?.data?.scripts?.build,
        ).success;
      },

      hasTestScript: ({ pContext }) => {
        return safeParse(
          string(),
          pContext.files?.packageJson?.data?.scripts?.test,
        ).success;
      },

      hasLintScript: ({ pContext }) => {
        return safeParse(
          string(),
          pContext.files?.packageJson?.data?.scripts?.lint,
        ).success;
      },
    },

    actions: {
      setWorkingDir: assign('pContext.files.workingDir', {
        START: ({ payload }) => {
          console.log('payload', payload);
          return payload.workingDir;
        },
      }),

      setPackageManager: assign('pContext.packageManager', {
        START: ({ payload }) => payload.packageManager,
      }),

      setVerbose: assign('pContext.verbose', {
        START: ({ payload }) => payload.verbose,
      }),

      logStart: voidAction(() => {
        logTitle('Starting upgrade-npm-package process ...');
      }),

      // #region Files

      'files.packageJson.notFound': assign(
        'context.errors.files.packageJson.notFound',
        () => 'package.json not found in working directory',
      ),

      'files.tsConfigJson.notFound': assign(
        'context.errors.files.tsConfigJson.notFound',
        () => 'tsconfig.json not found in working directory',
      ),

      'files.packageJson.read.error': assign(
        'context.errors.files.packageJson.read',
        () => `Error reading package.json`,
      ),

      'files.packageJson.read': assign('pContext.files.packageJson.raw', {
        'readPackageJson::then': ({ payload }) => payload,
      }),

      'files.packageJson.read.logTitle': voidAction(() => {
        logTitle('Read package.json file ...');
      }),

      'files.packageJson.read.logLength': voidAction({
        'readPackageJson::then': ({ payload }) => {
          console.log('package.json content:');
          const linesLength = payload.split('\n').length;
          console.log(`(Length: ${linesLength} lines)`);
          console.log();
        },
      }),

      'files.packageJson.invalid': assign(
        'context.errors.files.packageJson.invalid',
        () => 'package.json is not a valid JSON file',
      ),

      'files.packageJson.data': assign('pContext.files.packageJson.data', {
        'verifyPackageJson::then': ({ payload }) => payload,
      }),

      'files.packageJson.logVerification': voidAction(() => {
        console.log('Verified package.json file.');
      }),

      // #endregion

      // #region Scripts

      'scripts.testScript.missing': assign(
        'context.errors.scripts.test',
        () => 'Test script is required but missing in package.json',
      ),

      'scripts.buildScript.missing': assign(
        'context.errors.scripts.build',
        () => 'Build script is required but missing in package.json',
      ),

      'scripts.lintScript.missing': assign(
        'context.errors.scripts.lint',
        () => 'Lint script is required but missing in package.json',
      ),

      // #endregion

      // #region Promises

      // #region Initials
      'collectInitialDependencies.error': assign(
        'context.errors.collectInitialDependencies',
        () => 'Error collecting initial dependencies from package.json',
      ),

      'collectInitialDependencies.collect': assign(
        'pContext.dependencies.initials',
        {
          'collectInitialDependencies::then': ({ payload }) => payload,
        },
      ),

      'collectInitialDependencies.logTitle': voidAction(() => {
        logTitle('Collecting initial dependencies...');
      }),

      'collectInitialDependencies.logResult': voidAction({
        'collectInitialDependencies::then': ({ payload }) => {
          payload.forEach(dep => {
            console.log(` - ${dep.name} (${dep.type}): ${dep.version}`);
          });
          console.log();
        },
      }),

      'collectInitialDependencies.logLength': voidAction({
        'collectInitialDependencies::then': ({ payload }) => {
          console.log(`Total dependencies found: ${payload.length}`);
          console.log();
        },
      }),
      // #endregion

      'internet.error': assign(
        'context.errors.internet',
        () => 'No internet connection detected',
      ),

      // #region Versions

      'fetchVersions.error': assign(
        'context.errors.fetchVersions',
        () => 'Error fetching versions from npm registry',
      ),

      'fetchVersions.collect': assign(
        'pContext.dependencies.upgradables',
        {
          'fetchVersions::then': ({ payload, pContext }) => {
            return payload.map(({ name, nextVersions }) => {
              const { type, version: currentVersion } =
                pContext.dependencies!.initials!.find(
                  dep => dep.name === name,
                )!;

              return {
                name,
                nextVersions,
                currentVersion,
                type,
              };
            });
          },
        },
      ),

      'fetchVersions.logTitle': voidAction(() => {
        logTitle('Fetch available versions from npm registry ...');
      }),

      'fetchVersions.logResult': voidAction({
        'fetchVersions::then': ({ payload }) => {
          payload.forEach(({ name, nextVersions }) => {
            console.log(` - ${name}:`);
            nextVersions.forEach(version => {
              console.log(`    - ${version}`);
            });
          });
          console.log();
        },
      }),

      'fetchVersions.logLength': voidAction({
        'fetchVersions::then': ({ payload }) => {
          console.log(
            `Total upgradable dependencies found: ${payload.length}`,
          );
          console.log();
        },
      }),
      // #endregion

      // #region Upgrades

      'upgradeAll.warning': assign(
        'context.warnings.upgradeAll',
        () =>
          'Upgrading all dependencies at once may lead to compatibility issues. Consider using decremental upgrades for better stability.',
      ),

      'upgrade.collect': assign('context.upgradeds', {
        'upgradeAll::then': ({ payload }) => payload,
        'upgradeDecrementally::then': ({ payload }) => payload,
      }),

      'upgradeAll.logTitle': voidAction(() => {
        logTitle('Upgrading all dependencies at once ...');
      }),

      'upgrade.logResult': voidAction({
        'upgradeAll::then': ({ payload }) => {
          payload.forEach(({ name, from, to }) => {
            console.log(` - ${name}: ${from} -> ${to}`);
          });

          console.log();
        },
        'upgradeDecrementally::then': ({ payload }) => {
          payload.forEach(({ name, from, to }) => {
            console.log(` - ${name}: ${from} -> ${to}`);
          });

          console.log();
        },
      }),

      'upgrade.logLength': voidAction({
        'upgradeAll::then': ({ payload }) => {
          console.log(`Total dependencies upgraded: ${payload.length}`);
          console.log();
        },
        'upgradeDecrementally::then': ({ payload }) => {
          console.log(`Total dependencies upgraded: ${payload.length}`);
          console.log();
        },
      }),

      'upgradeDecrementally.error': assign(
        'context.errors.upgradeDecrementally',
        () => 'Error during decremental upgrade process',
      ),

      'upgradeDecrementally.logTitle': voidAction(() => {
        logTitle('Upgrade dependencies incrementally');
      }),

      // #endregion

      // #endregion

      notifyWarnings: voidAction(({ context: { warnings } }) => {
        if (!warnings) return;

        const filteredWarnings = Object.values(warnings).filter(Boolean);

        if (filteredWarnings.length > 0) {
          logTitle('⚠️  Some warnings were generated during the process:');

          filteredWarnings.forEach(warning => {
            console.log(` - ${warning}`);
          });

          console.log();
        }
      }),

      notifyErrors: voidAction(({ context: { errors } }) => {
        if (!errors) return;

        const filteredErrors = Object.values(errors).filter(Boolean);

        if (filteredErrors.length > 0) {
          logTitle('❌  Errors encountered:');

          filteredErrors.forEach(error => {
            console.log(` - ${error}`);
          });

          console.log();
        }
      }),

      notifySuccess: voidAction(() => {
        console.log('🎉 All operations completed successfully!');
      }),
    },

    promises: {
      readPackageJson: async ({ pContext }) => {
        const dir = pContext.files!.workingDir!;

        const path = `${dir}/package.json`;

        return import('fs/promises').then(fs =>
          fs.readFile(path, 'utf-8'),
        );
      },

      verifyPackageJson: async ({ pContext }) => {
        console.log(
          'pContext.files?.packageJson?.raw',
          pContext.files?.packageJson?.raw,
        );
        return parseAsync(
          PackageJsonDataSchema,
          pContext.files?.packageJson?.raw,
        );
      },

      collectInitialDependencies: async ({ pContext }) => {
        const data = pContext.files!.packageJson!.data!;
        const out: InitialDependency[] = [];

        const MAPPER = [
          ['dependencies', 'production'],
          ['devDependencies', 'development'],
          ['optionalDependencies', 'optional'],
        ] as const;

        MAPPER.forEach(([key, type]) => {
          Object.entries(data[key] || {}).forEach(([name, _version]) => {
            const sign = parse(
              SemverSignSchema,
              _version.charAt(0) === '^' || _version.charAt(0) === '~'
                ? _version.charAt(0)
                : '',
            );

            const version =
              sign === '^' || sign === '~' ? _version.slice(1) : _version;
            out.push({
              name,
              version,
              type,
              sign,
            });
          });
        });

        return out;
      },

      checkInternetConnection: async () => {
        const lookup = await import('dns').then(dns => dns.lookup);

        return new Promise<void>((resolve, reject) => {
          lookup('registry.npmjs.org', err => {
            if (err && err.code === 'ENOTFOUND') {
              reject(new Error('No internet connection'));
            } else {
              resolve();
            }
          });
        });
      },

      fetchVersions: async ({ pContext }) => {
        const initials = pContext.dependencies!.initials!;
        console.log('initials', initials);

        const out: UpgradableDependency[] = [];

        console.log('AXIOS');

        const gt = await import('semver').then(s => s.gt);
        const axios = await import('axios').then(m => m.default);

        await Promise.all(
          initials.map(async ({ name, version, type }) => {
            const { data, status } = await axios.get(
              `https://registry.npmjs.org/${name}`,
            );
            console.log('res.status', status, name);

            if (data && data.versions) {
              const allVersions = Object.keys(data.versions) as string[];

              // Filter versions that are greater than the current version
              const nextVersions = allVersions.filter(v => {
                return gt(v, version);
              });

              if (nextVersions.length > 0) {
                out.push({
                  name,
                  nextVersions: nextVersions.sort((a, b) =>
                    a.localeCompare(b, undefined, {
                      numeric: true,
                      sensitivity: 'base',
                    }),
                  ),
                  type,
                  currentVersion: version,
                });
              }
            }
          }),
        );

        return out;
      },

      upgradeAll: async ({ pContext }) => {
        const upgradables = pContext.dependencies!.upgradables!;
        const cwd = pContext.files!.workingDir!;
        const packageManager = pContext.packageManager!;

        const out: Upgraded[] = [];

        await Promise.all(
          upgradables.map(
            async ({ name, nextVersions, currentVersion }) => {
              const latestVersion = nextVersions[nextVersions.length - 1];

              const cmd = createCmd(packageManager, name, latestVersion);

              if (cmd) {
                const { execa } = await import('execa');
                await execa(cmd, { cwd });

                out.push({
                  name,
                  from: currentVersion,
                  to: latestVersion,
                });
              }
            },
          ),
        );

        return out;
      },

      upgradeDecrementally: async ({ pContext }) => {
        const upgradables = pContext.dependencies!.upgradables!;
        const cwd = pContext.files!.workingDir!;
        const packageManager = pContext.packageManager!;

        const out: Upgraded[] = [];

        for (const {
          name,
          nextVersions,
          currentVersion: from,
        } of upgradables) {
          for (let index = nextVersions.length - 1; index >= 0; index--) {
            const to = nextVersions[index];

            const cmd = createCmd(packageManager, name, to);

            const { execa } = await import('execa');
            const { exitCode } = await execa(cmd, { cwd });

            if (exitCode !== 0) continue;
            if (to === from) break;

            out.push({
              name,
              from,
              to,
            });
          }
        }
      },
    },

    delays: {
      '10min': 10 * 60 * 1000, // 10 minutes in milliseconds
      '2H': 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    },
  }),
);
