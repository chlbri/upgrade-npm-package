import { aliasTs } from '@bemedev/vitest-alias';
import { exclude } from '@bemedev/vitest-exclude';
import { defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json';

export default defineConfig({
  plugins: [
    aliasTs(tsconfig as any),
    exclude({
      ignoreCoverageFiles: [
        '**/index.ts',
        '**/types.ts',
        '**/libs/bemedev/**',
      ],
    }),
  ],
  test: {
    bail: 10,
    maxConcurrency: 10,
    passWithNoTests: true,
    slowTestThreshold: 3000,
    fileParallelism: false,
    globals: true,
    logHeapUsage: true,
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    coverage: {
      enabled: true,
      extension: 'ts',
      reportsDirectory: '.coverage',
      all: true,
      provider: 'v8',
    },
  },
});
