/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  transformIgnorePatterns: [
    '/node_modules/(?!(zustand|@zustand|nanoid)/).*',
  ],
  moduleNameMapper: {
    '^@dhis2/d2-i18n$': '<rootDir>/src/__mocks__/d2-i18n.ts',
    '^.+\\.module\\.(css|scss|less)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
}
