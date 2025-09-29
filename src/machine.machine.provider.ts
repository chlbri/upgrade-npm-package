import { existsSync } from 'fs';
import { machine } from './machine.machine';

export const provider = machine.provideOptions(
  ({ assign, voidAction }) => ({
    predicates: {
      verbose: ({ pContext }) => pContext.verbose === true,

      'files.packageJson.existence': ({ pContext }) => {
        const checkWorkingDir = pContext.files?.workingDir;
        if (!checkWorkingDir) return false;

        const path = `${checkWorkingDir}/package.json`;
        return existsSync(path);
      },

      'files.tsConfigJson.existence': ({ pContext }) => {
        const checkWorkingDir = pContext.files?.workingDir;
        if (!checkWorkingDir) return false;

        const path = `${checkWorkingDir}/tsconfig.json`;
        return existsSync(path);
      },
    },

    actions: {
      'files.packageJson.notFound': assign(
        'context.errors',
        ({ context }) => ({
          ...context.errors,
          packageJson: 'package.json not found in working directory',
        }),
      ),

      'files.tsConfigJson.notFound': assign(
        'context.errors',
        ({ context }) => ({
          ...context.errors,
          tsConfigJson: 'tsconfig.json not found in working directory',
        }),
      ),

      'files.packageJson.read.error': assign(
        'context.errors',
        ({ context }) => ({
          ...context.errors,
          packageJson: `Error reading package.json`,
        }),
      ),

      'files.packageJson.read': assign('pContext.files.packageJson.raw', {
        'readPackageJson::then': ({ payload }) => payload,
      }),

      'files.packageJson.read.logTitle': voidAction(() => {
        
        console.log('Read package.json file ...');
      }),
    },
  }),
);
