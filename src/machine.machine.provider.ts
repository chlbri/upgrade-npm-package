import { existsSync } from 'fs';
import { machine } from './machine.machine';
import { logStars, logTitle } from './utils/log';

export const provider = machine.provideOptions(
  ({ assign, voidAction }) => ({
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
    },

    actions: {
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
        logStars(30);
        console.log('Read package.json file ...');
        logStars(30);
        console.log();
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
        console.log('Collecting initial dependencies...');
      }),

      'internet.error': assign(
        'context.errors.internet',
        () => 'No internet connection detected',
      ),

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
        logStars(30);
        console.log('Fetch available versions from npm registry ...');
        logStars(30);
        console.log();
      }),

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
        logStars(30);
        console.log('Upgrading all dependencies at once ...');
        logStars(30);
        console.log();
      }),

      'upgradeDecrementally.error': assign(
        'context.errors.upgradeDecrementally',
        () => 'Error during decremental upgrade process',
      ),

      'upgradeDecrementally.logTitle': voidAction(() => {
        logTitle('Upgrade dependencies incrementally');
      }),

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
  }),
);
