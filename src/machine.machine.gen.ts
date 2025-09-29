/**
 *
 * All paths of the concerned files
 *
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 *
 * This file is auto-generated. Do not edit manually.
 */
export type _AllPaths = {
  machine:
    | '/'
    | '/idle'
    | '/checking'
    | '/checking/files'
    | '/checking/files/packageJson'
    | '/checking/files/tsConfigJson'
    | '/checking/readPackageJson'
    | '/checking/readPackageJson/read'
    | '/checking/readPackageJson/parse'
    | '/checking/readPackageJson/verify'
    | '/checking/scripts'
    | '/checking/scripts/test'
    | '/checking/scripts/build'
    | '/checking/scripts/lint'
    | '/initials'
    | '/versions'
    | '/versions/internet'
    | '/versions/fetch'
    | '/upgrade'
    | '/upgrade/all'
    | '/upgrade/all/internet'
    | '/upgrade/all/fetch'
    | '/upgrade/decremental'
    | '/upgrade/decremental/internet'
    | '/upgrade/decremental/fetch'
    | '/errors'
    | '/success';
};
/**
 *
 * Constants as type helpers for the concerned file.
 * Don't use it as values, just for typings
 *
 * ### Author
 *
 * chlbri (bri_lvi@icloud.com)
 *
 * [My GitHub](https://github.com/chlbri?tab=repositories)
 *
 * <br/>
 *
 * ### Documentation
 *
 * Link to machine lib [here](https://www.npmjs.com/package/@bemedev/app-ts).
 *
 * Link to this lib [here](https://www.npmjs.com/package/@bemedev/app-cli)
 *
 * NB: This file is auto-generated. Do not edit manually.
 */
export const SCHEMAS = {
  machine: {
    __tsSchema: undefined as unknown as {
      readonly targets: Exclude<_AllPaths['machine'], '/'>;
      readonly states: {
        readonly idle: {
          readonly targets: Exclude<_AllPaths['machine'], '/idle'>;
        };
        readonly checking: {
          readonly targets: Exclude<_AllPaths['machine'], '/checking'>;
          readonly states: {
            readonly files: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/checking/files'
              >;
              readonly states: {
                readonly packageJson: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/files/packageJson'
                  >;
                };
                readonly tsConfigJson: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/files/tsConfigJson'
                  >;
                };
              };
              readonly initial: 'packageJson' | 'tsConfigJson';
            };
            readonly readPackageJson: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/checking/readPackageJson'
              >;
              readonly states: {
                readonly read: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/readPackageJson/read'
                  >;
                };
                readonly parse: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/readPackageJson/parse'
                  >;
                };
                readonly verify: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/readPackageJson/verify'
                  >;
                };
              };
              readonly initial: 'read' | 'parse' | 'verify';
            };
            readonly scripts: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/checking/scripts'
              >;
              readonly states: {
                readonly test: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/scripts/test'
                  >;
                };
                readonly build: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/scripts/build'
                  >;
                };
                readonly lint: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/checking/scripts/lint'
                  >;
                };
              };
              readonly initial: 'test' | 'build' | 'lint';
            };
          };
          readonly initial: 'files' | 'readPackageJson' | 'scripts';
        };
        readonly initials: {
          readonly targets: Exclude<_AllPaths['machine'], '/initials'>;
        };
        readonly versions: {
          readonly targets: Exclude<_AllPaths['machine'], '/versions'>;
          readonly states: {
            readonly internet: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/versions/internet'
              >;
            };
            readonly fetch: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/versions/fetch'
              >;
            };
          };
          readonly initial: 'internet' | 'fetch';
        };
        readonly upgrade: {
          readonly targets: Exclude<_AllPaths['machine'], '/upgrade'>;
          readonly states: {
            readonly all: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/upgrade/all'
              >;
              readonly states: {
                readonly internet: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/upgrade/all/internet'
                  >;
                };
                readonly fetch: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/upgrade/all/fetch'
                  >;
                };
              };
              readonly initial: 'internet' | 'fetch';
            };
            readonly decremental: {
              readonly targets: Exclude<
                _AllPaths['machine'],
                '/upgrade/decremental'
              >;
              readonly states: {
                readonly internet: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/upgrade/decremental/internet'
                  >;
                };
                readonly fetch: {
                  readonly targets: Exclude<
                    _AllPaths['machine'],
                    '/upgrade/decremental/fetch'
                  >;
                };
              };
              readonly initial: 'internet' | 'fetch';
            };
          };
          readonly initial: 'all' | 'decremental';
        };
        readonly errors: {
          readonly targets: Exclude<_AllPaths['machine'], '/errors'>;
        };
        readonly success: {
          readonly targets: Exclude<_AllPaths['machine'], '/success'>;
        };
      };
      readonly initial:
        | 'idle'
        | 'checking'
        | 'initials'
        | 'versions'
        | 'upgrade'
        | 'errors'
        | 'success';
    },
  },
};
