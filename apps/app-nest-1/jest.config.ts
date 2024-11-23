/* eslint-disable */
import type { Config } from '@jest/types';

export default {
  displayName: 'app-nest-1',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        /*
         * Disable type-checking to speed up test runs
         *
         * https://kulshekhar.github.io/ts-jest/docs/getting-started/options/
         * https://github.com/kulshekhar/ts-jest/blob/main/website/docs/getting-started/options/diagnostics.md
         * https://github.com/kulshekhar/ts-jest/issues/822#issuecomment-1961616203
         */
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/app-nest-1',
} as Config.InitialOptions;
