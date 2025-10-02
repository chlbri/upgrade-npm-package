import axios from 'axios';
import { execa } from 'execa';
import { existsSync } from 'fs';
import { gt } from 'semver';
import { parse, parseAsync, safeParse, string } from 'valibot';
import { machine } from './machine.machine';
import { PackageJsonDataSchema, SemverSignSchema } from './schemas';
import type {
  InitialDependency,
  UpgradableDependency,
  Upgraded,
} from './types';
import { createCI } from './utils/cmd';
import { logTitle } from './utils/log';
import editJsonFile from 'edit-json-file';

export const provider = machine.provideOptions(
  ({ assign, voidAction, batch }) => ({
    predicates: {
      verbose: ({ pContext }) => pContext.verbose === true,

      'files.packageJson.existence': ({ pContext }) => {
        const dir = pContext.files?.workingDir;
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

      hasUpgradables: {
        'fetchVersions::then': ({ payload }) => {
          return payload.length > 0;
        },
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

      'fetchVersions.error': batch(
        assign(
          'context.errors.fetchVersions',
          () => 'Error fetching versions from npm registry',
        ),
        voidAction({
          'fetchVersions::catch': ({ payload }) => {
            console.error('Fetch versions error details:', payload);
          },
        }),
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

      'fetchVersions.warning': assign(
        'context.warnings.fetchVersions',
        () => 'No need to upgrade dependencies, all are up-to-date !!!',
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

      'resetDependencies.error': assign(
        'context.errors.resetDependencies',
        () => 'Error resetting dependencies to original versions',
      ),

      'resetDependencies.logCompletion': voidAction(() => {
        console.log(
          'All Dependencies have been reset to their original versions.',
        );
        console.log();
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

      exit: voidAction(() => {
        console.log('Exiting the process. Goodbye!');
        // process.exit(0);
      }),

      updatePeerDependencies: voidAction(
        ({ pContext, context: { upgradeds } }) => {
          const peerDeps = pContext.dependencies?.initials?.filter(
            dep => dep.type === 'peer',
          );

          if (!peerDeps || peerDeps.length < 1) return;
          console.log('peerNames', peerDeps);
          const checkUpgrades = !upgradeds || upgradeds.length < 1;
          if (checkUpgrades) return;

          const currentPeers = upgradeds
            .filter(dep => peerDeps.some(d => d.name === dep.name))
            .map(d => {
              const sign =
                peerDeps.find(i => i.name === d.name)?.sign || '';
              return { ...d, sign } as const;
            });

          if (currentPeers.length < 1) return;
          const path = `${pContext.files!.workingDir!}/package.json`;
          const file = editJsonFile(path);

          const previous = file.get('peerDependencies');
          const current = Object.fromEntries(
            currentPeers.map(
              dep => [dep.name, `${dep.sign}${dep.to}`] as const,
            ),
          );
          const value = {
            ...previous,
            ...current,
          };

          file.set('peerDependencies', value);

          file.save();
        },
      ),
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
          ['peerDependencies', 'peer'],
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
        const out: UpgradableDependency[] = [];

        await Promise.all(
          initials.map(async ({ name, version, type }) => {
            const { data } = await axios.get(
              `https://registry.npmjs.org/${name}`,
            );

            if (data && data.versions) {
              const allVersions = Object.entries(data.versions)
                .filter(([, v]) => (v as any).deprecated === undefined)
                .map(([k]) => k);

              // Filter versions that are greater than the current version
              const nextVersions = allVersions
                .filter(v => !v.includes('-'))
                .filter(v => {
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

        console.log('out', out);

        return out;
      },

      upgradeAll: async ({ pContext }) => {
        const cwd = pContext.files!.workingDir!;
        const packageManager = pContext.packageManager!;

        const upgradeds = pContext.dependencies!.upgradables!.map(
          ({ nextVersions, name, currentVersion: from }) => {
            const to = nextVersions[nextVersions.length - 1];
            return { name, from, to };
          },
        );

        // Préparer la commande et les arguments séparément
        let cmd: string;

        const cmds: [string, string[]][] = [];

        const packages = upgradeds.map(dep => `${dep.name}@${dep.to}`);

        switch (packageManager) {
          case 'npm':
            cmd = 'npm';
            cmds.push([cmd, ['install', ...packages]]);
            cmds.push([cmd, ['run', 'lint']]);
            cmds.push([cmd, ['run', 'build']]);
            cmds.push([cmd, ['run', 'lint']]);
            cmds.push([cmd, ['run', 'test']]);
            cmds.push([cmd, ['run', 'lint']]);
            break;
          case 'yarn':
            cmd = 'yarn';
            cmds.push([cmd, ['add', ...packages]]);
            cmds.push([cmd, ['lint']]);
            cmds.push([cmd, ['build']]);
            cmds.push([cmd, ['lint']]);
            cmds.push([cmd, ['test']]);
            cmds.push([cmd, ['lint']]);
            break;
          case 'pnpm':
            cmd = 'pnpm';
            cmds.push([cmd, ['add', ...packages]]);
            cmds.push([cmd, ['run', 'lint']]);
            cmds.push([cmd, ['run', 'build']]);
            cmds.push([cmd, ['run', 'lint']]);
            cmds.push([cmd, ['run', 'test']]);
            cmds.push([cmd, ['run', 'lint']]);
            break;
          case 'bun':
            cmd = 'bun';
            cmds.push([cmd, ['add', ...packages]]);
            cmds.push([cmd, ['run', 'lint']]);
            cmds.push([cmd, ['run', 'build']]);
            cmds.push([cmd, ['run', 'lint']]);
            cmds.push([cmd, ['run', 'test']]);
            cmds.push([cmd, ['run', 'lint']]);
        }

        console.log('Try to upgrade all');

        for (const [cmd, args] of cmds) {
          const { exitCode } = await execa(cmd, args, { cwd });

          if (exitCode !== 0) continue;
        }

        console.log('Everything is upgraded, on stone to many !!');

        return upgradeds;
      },

      resetDependencies: async ({ pContext }) => {
        const initials = pContext.dependencies!.initials!;
        const cwd = pContext.files!.workingDir!;
        const packageManager = pContext.packageManager!;
        let cmds: [string, string[]];

        const packages = initials.map(({ name, version }) =>
          `${name}@${version}`.replace('@@', '@'),
        );

        switch (packageManager) {
          case 'npm':
            cmds = ['npm', ['install', ...packages]];
            break;
          case 'yarn':
            cmds = ['yarn', ['add', ...packages]];
            break;
          case 'pnpm':
            cmds = ['pnpm', ['add', ...packages]];
            break;
          case 'bun':
            cmds = ['bun', ['add', ...packages]];
        }

        logTitle(`Resetting dependencies to their original versions ...`);

        const { exitCode } = await execa(...cmds, { cwd });

        if (exitCode !== 0) {
          console.log('Failed to reset dependencies');
          throw new Error('Failed to reset dependencies');
        }

        console.log('Dependencies have been reset.');
      },

      upgradeDecrementally: async ({ pContext }) => {
        const upgradables = pContext.dependencies!.upgradables!;
        const cwd = pContext.files!.workingDir!;
        const packageManager = pContext.packageManager!;

        const upgradeds: Upgraded[] = [];

        for (const {
          name,
          nextVersions,
          currentVersion: from,
        } of upgradables) {
          loopConcerned: for (
            let index = nextVersions.length - 1;
            index >= 0;
            index--
          ) {
            const to = nextVersions[index];
            if (to === from) break;

            const cmds = createCI(packageManager, name, to);

            console.log(
              `Try updating ${name} from "${from}" to "${to}" ...`,
            );

            for (const element of cmds) {
              const [cmd, args] = element;
              const { exitCode } = await execa(cmd, args, { cwd });

              if (exitCode !== 0) continue loopConcerned;
            }

            console.log(`Successfully updated ${name} to "${to}"`);

            upgradeds.push({
              name,
              from,
              to,
            });
          }
        }

        if (upgradeds.length < 1) {
          throw new Error('All incremental upgrade attempts failed');
        }

        return upgradeds;
      },
    },

    delays: {
      '10min': 10 * 60 * 1000, // 10 minutes in milliseconds
      '2H': 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      INTERNET_PING: 10_000,
    },
  }),
);
