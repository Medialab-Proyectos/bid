module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
  collectCoverage: false,
  coverageReporters: [
    'clover',
    'cobertura',
    'text',
    'html',
    'lcov',
    ['text', { skipFull: true }],
    'text-summary',
  ],
  coverageDirectory: 'coverage/fiduciary-interface-webapp',
  moduleNameMapper: {
    '@core/(.*)$': '<rootDir>/src/app/core/$1',
    '@fiduciary-interface/(.*)$': '<rootDir>/src/$1',
    '@fiduciary-interface-test': '<rootDir>/src/test/index.ts',
    '@fiduciary-interface-api-interfaces':
      '<rootDir>/src/app/core/api-interfaces/src/index.ts',
    '@fiduciary-interface-contracts/(.*)$':
      '<rootDir>/src/app/features/procurement/features/procurement-process/features/process-contracts/$1',
  },
};
