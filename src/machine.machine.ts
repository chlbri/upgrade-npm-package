import { createMachine, typings } from '@bemedev/app-ts';
import { SCHEMAS } from './machine.machine.gen';
import {
  Upgraded,
  type InitialDependency,
  type PackageJsonData,
  type PackageManager,
  type UpgradableDependency,
  type Versions,
} from './types';

export const machine = createMachine(
  {
    __tsSchema: SCHEMAS.machine.__tsSchema,
    __longRuns: true,
    initial: 'idle',

    states: {
      idle: {
        on: {
          START: {
            target: '/checking',
            actions: [
              'setWorkingDir',
              'setPackageManager',
              'setVerbose',
              'logStart',
            ],
          },
        },
      },

      checking: {
        initial: 'files',

        states: {
          files: {
            initial: 'packageJson',
            states: {
              packageJson: {
                always: [
                  {
                    guards: 'files.packageJson.existence',
                    target: '/checking/files/tsConfigJson',
                  },
                  {
                    target: '/errors',
                    actions: 'files.packageJson.notFound',
                  },
                ],
              },

              tsConfigJson: {
                always: [
                  {
                    guards: 'files.tsConfigJson.existence',
                    target: '/checking/readPackageJson',
                  },
                  {
                    target: '/errors',
                    actions: 'files.tsConfigJson.notFound',
                  },
                ],
              },
            },
          },

          readPackageJson: {
            initial: 'read',

            states: {
              read: {
                promises: {
                  src: 'readPackageJson',
                  catch: {
                    target: '/errors',
                    actions: 'files.packageJson.read.error',
                  },
                  then: {
                    target: '/checking/readPackageJson/verify',
                    actions: ['files.packageJson.read'],
                  },
                  finally: [
                    {
                      guards: 'verbose',
                      actions: [
                        'files.packageJson.read.logTitle',
                        'files.packageJson.read.logLength',
                      ],
                    },
                    {
                      actions: ['files.packageJson.read.logTitle'],
                    },
                  ],
                },
              },

              verify: {
                promises: {
                  src: 'verifyPackageJson',
                  catch: {
                    target: '/errors',
                    actions: 'files.packageJson.invalid',
                  },
                  then: {
                    target: '/checking/scripts',
                    actions: 'files.packageJson.data',
                  },
                  finally: [
                    {
                      guards: 'verbose',
                      actions: ['files.packageJson.logVerification'],
                    },
                  ],
                },
              },
            },
          },

          scripts: {
            initial: 'test',

            states: {
              test: {
                always: [
                  {
                    guards: 'hasTestScript',
                    target: '/checking/scripts/build',
                  },
                  {
                    target: '/errors',
                    actions: 'scripts.testScript.missing',
                  },
                ],
              },

              build: {
                always: [
                  {
                    guards: 'hasBuildScript',
                    target: '/checking/scripts/lint',
                  },
                  {
                    target: '/errors',
                    actions: 'scripts.buildScript.missing',
                  },
                ],
              },

              lint: {
                always: [
                  {
                    guards: 'hasLintScript',
                    target: '/initials',
                  },
                  {
                    target: '/errors',
                    actions: 'scripts.lintScript.missing',
                  },
                ],
              },
            },
          },
        },
      },

      initials: {
        promises: {
          src: 'collectInitialDependencies',
          catch: {
            target: '/errors',
            actions: 'collectInitialDependencies.error',
          },
          then: {
            target: '/versions',
            actions: ['collectInitialDependencies.collect'],
          },
          finally: [
            {
              guards: 'verbose',
              actions: [
                'collectInitialDependencies.logTitle',
                'collectInitialDependencies.logResult',
                'collectInitialDependencies.logLength',
              ],
            },
            {
              actions: [
                'collectInitialDependencies.logTitle',
                'collectInitialDependencies.logLength',
              ],
            },
          ],
        },
      },

      versions: {
        initial: 'internet',
        states: {
          internet: {
            promises: {
              src: 'checkInternetConnection',
              catch: { target: '/errors', actions: 'internet.error' },
              then: '/versions/fetch',
              max: 'INTERNET_PING',
            },
          },

          fetch: {
            promises: {
              src: 'fetchVersions',
              catch: {
                target: '/errors',
                actions: 'fetchVersions.error',
              },
              then: [
                {
                  guards: 'hasUpgradables',
                  target: '/upgrade',
                  actions: ['fetchVersions.collect'],
                },
                {
                  target: '/success',
                  actions: [
                    'fetchVersions.collect',
                    'fetchVersions.warning',
                  ],
                },
              ],
              finally: [
                {
                  guards: 'verbose',
                  actions: [
                    'fetchVersions.logTitle',
                    'fetchVersions.logResult',
                    'fetchVersions.logLength',
                  ],
                },
                {
                  actions: [
                    'fetchVersions.logTitle',
                    'fetchVersions.logLength',
                  ],
                },
              ],
            },
          },
        },
      },

      upgrade: {
        initial: 'all',
        states: {
          all: {
            initial: 'internet',
            states: {
              internet: {
                promises: {
                  src: 'checkInternetConnection',
                  catch: { target: '/errors', actions: 'internet.error' },
                  then: '/upgrade/all/fetch',
                  max: 'INTERNET_PING',
                },
              },
              fetch: {
                promises: {
                  max: '10min',
                  src: 'upgradeAll',
                  catch: {
                    target: '/upgrade/reset',
                    actions: 'upgradeAll.warning',
                  },
                  then: {
                    target: '/upgrade/peerDependencies',
                    actions: ['upgrade.collect'],
                  },
                  finally: [
                    {
                      guards: 'verbose',
                      actions: [
                        'upgradeAll.logTitle',
                        'upgrade.logResult',
                        'upgrade.logLength',
                      ],
                    },
                    {
                      actions: [
                        'upgradeAll.logTitle',
                        'upgrade.logLength',
                      ],
                    },
                  ],
                },
              },
            },
          },

          reset: {
            promises: {
              src: 'resetDependencies',
              description: 'Resetting dependencies to initial state',
              catch: {
                target: '/errors',
                actions: 'resetDependencies.error',
              },
              then: {
                target: '/upgrade/decremental',
              },
              max: '10min',
              finally: [
                {
                  guards: 'verbose',
                  actions: ['resetDependencies.logCompletion'],
                },
              ],
            },
          },

          peerDependencies: {
            always: {
              target: '/success',
              actions: 'updatePeerDependencies',
            },
          },

          decremental: {
            initial: 'internet',
            states: {
              internet: {
                promises: {
                  src: 'checkInternetConnection',
                  catch: { target: '/errors', actions: 'internet.error' },
                  then: '/upgrade/decremental/fetch',
                  max: 'INTERNET_PING',
                },
              },
              fetch: {
                promises: {
                  max: '2H',
                  src: 'upgradeDecrementally',
                  description: `
                    Very long-running process that attempts to upgrade each dependency

                    one at a time, starting from the highest version down to the lowest.
                    `,
                  catch: {
                    target: '/errors',
                    actions: 'upgradeDecrementally.error',
                  },
                  then: {
                    target: '/upgrade/peerDependencies',
                    actions: ['upgrade.collect'],
                  },
                  finally: [
                    {
                      guards: 'verbose',
                      actions: [
                        'upgradeDecrementally.logTitle',
                        'upgrade.logResult',
                        'upgrade.logLength',
                      ],
                    },
                    {
                      actions: [
                        'upgradeDecrementally.logTitle',
                        'upgrade.logLength',
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },

      errors: {
        entry: ['notifyWarnings', 'notifyErrors', 'exit'],
      },
      success: {
        entry: ['notifyWarnings', 'notifySuccess', 'exit'],
      },
    },
  },
  typings({
    eventsMap: {
      START: {
        packageManager: typings.custom<PackageManager>(),
        workingDir: 'string',
        verbose: 'boolean',
      },
    },

    pContext: typings.partial({
      files: typings.partial({
        packageJson: typings.partial({
          data: typings.custom<PackageJsonData>(),
          raw: 'string',
        }),
        workingDir: 'string',
        packageManager: typings.custom<PackageManager>(),
      }),
      verbose: 'boolean',
      dependencies: typings.partial({
        initials: [typings.custom<InitialDependency>()],
        upgradables: [typings.custom<UpgradableDependency>()],
      }),
      packageManager: typings.custom<PackageManager>(),
    }),

    context: typings.partial({
      errors: typings.partial({
        files: typings.partial({
          packageJson: typings.partial({
            notFound: 'string',
            read: 'string',
            invalid: 'string',
          }),
          tsConfigJson: typings.partial({
            notFound: 'string',
          }),
        }),
        scripts: typings.partial({
          build: 'string',
          lint: 'string',
          test: 'string',
        }),
        collectInitialDependencies: 'string',
        resetDependencies: 'string',
        internet: 'string',
        fetchVersions: 'string',
        upgradeAll: 'string',
        upgradeDecrementally: 'string',
      }),
      warnings: typings.partial({
        upgradeAll: 'string',
        fetchVersions: 'string',
      }),
      upgradeds: [typings.custom<Upgraded>()],
    }),

    promiseesMap: {
      readPackageJson: {
        then: 'string',
        catch: 'undefined',
      },

      verifyPackageJson: {
        then: typings.custom<PackageJsonData>(),
        catch: 'undefined',
      },

      collectInitialDependencies: {
        then: typings.custom<InitialDependency[]>(),
        catch: 'undefined',
      },

      checkInternetConnection: {
        then: 'undefined',
        catch: 'undefined',
      },

      fetchVersions: {
        then: [typings.custom<Versions>()],
        catch: 'undefined',
      },

      upgradeAll: {
        then: [typings.custom<Upgraded>()],
        catch: 'undefined',
      },

      upgradeDecrementally: {
        then: [typings.custom<Upgraded>()],
        catch: 'undefined',
      },
    },
  }),
);
