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
    initial: 'idle',

    states: {
      idle: {
        on: {
          START: '/checking',
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
                    target: '/checking/scripts',
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
                        'files.packageJson.read.logResult',
                        'files.packageJson.read.logLength',
                      ],
                    },
                    {
                      actions: [
                        'files.packageJson.read.logTitle',
                        'files.packageJson.read.logLength',
                      ],
                    },
                  ],
                },
              },

              verify: {
                promises: {
                  src: 'verifyPackageJson',
                  catch: {
                    target: '/errors',
                    actions: 'packageJson.invalid',
                  },
                  then: {
                    target: '/checking/scripts',
                    actions: 'packageJson.data',
                  },
                  finally: [
                    {
                      guards: 'verbose',
                      actions: ['packageJson.logVerification'],
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
                    target: '/checking/scripts/build',
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
                    target: '/checking/scripts/lint',
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
                    target: '/initials',
                    actions: 'scripts.lintScript.missing',
                  },
                ],
              },
            },
          },
        },
      },

      initials: {
        promises: [
          {
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
                  'collectInitialDependencies.logResult',
                  'collectInitialDependencies.logLength',
                ],
              },
              'collectInitialDependencies.logLength',
            ],
          },
        ],
      },

      versions: {
        initial: 'internet',
        states: {
          internet: {
            promises: {
              src: 'checkInternetConnection',
              catch: { target: '/errors', actions: 'internet.error' },
              then: '/versions/fetch',
            },
          },

          fetch: {
            promises: {
              src: 'fetchVersions',
              catch: { target: '/errors', actions: 'fetchVersions.error' },
              then: {
                target: '/upgrade',
                actions: ['fetchVersions.collect'],
              },
              finally: [
                {
                  guards: 'verbose',
                  actions: [
                    'fetchVersions.logResult',
                    'fetchVersions.logLength',
                  ],
                },
                'fetchVersions.logLength',
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
                },
              },
              fetch: {
                promises: [
                  {
                    src: 'upgradeAll',
                    catch: {
                      target: '/upgrade/decremental',
                      actions: 'upgradeAll.warning',
                    },
                    then: '/success',
                    finally: [
                      {
                        guards: 'verbose',
                        actions: [
                          'upgardeAll.logResult',
                          'upgardeAll.logLength',
                        ],
                      },
                      'upgardeAll.logLength',
                    ],
                  },
                ],
              },
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
                },
              },
              fetch: {
                promises: [
                  {
                    src: 'upgradeDecrementally',
                    description: `
                    Very long-running process that attempts to upgrade each dependency

                    one at a time, starting from the highest version down to the lowest.
                    `,
                    catch: {
                      target: '/errors',
                      actions: 'upgradeDecrementally.error',
                    },
                    then: '/success',
                    finally: [
                      {
                        guards: 'verbose',
                        actions: [
                          'upgradeDecrementally.logResult',
                          'upgradeDecrementally.logLength',
                        ],
                      },
                      'upgradeDecrementally.logLength',
                    ],
                  },
                ],
              },
            },
          },
        },
      },

      errors: { entry: 'notifyErrors' },
      success: { entry: 'notifySuccess' },
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
    }),

    context: typings.partial({
      errors: typings.partial({}),
      warnings: typings.partial({}),
      dependencies: typings.partial({
        initiats: [typings.custom<InitialDependency>()],
        upgradables: [typings.custom<UpgradableDependency>()],
        upgradeds: [typings.custom<Upgraded>()],
      }),
    }),

    promiseesMap: {
      readPackageJson: {
        then: 'string',
        catch: 'undefined',
      },

      verifyPackageJson: {
        then: 'undefined',
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
