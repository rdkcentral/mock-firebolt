module.exports = {
  verbose: true,
  //preset: 'ts-jest',
  roots: ['<rootDir>'],
  //testEnvironment: 'jsdom',
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|mjs?|js?|tsx?|ts?)$",
  //testMatch: ['<rootDir>/**/*.test.(mjs|js|ts)'],

  //restoreMocks: true,
  //clearMocks: true,

  //setupFiles: [
  //  '<rootDir>/jest.setup.js',
  //],

  transform: {
    //'^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(mjs|js|jsx)$': 'babel-jest'
  },
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["js", "jsx", "mjs"],

  collectCoverage: true,
  coverageThreshold: {global: {lines: 77,},},
  collectCoverageFrom: [
    './src/**/*.mjs',
    '!./src/conduitKeys.mjs',
    '!./src/conduit.mjs',
    '!**<rootDir>/server/node_modules/**'
  ],
  coveragePathIgnorePatterns: [
    './src/triggers/',
    './src/routes/'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'html',
    'json',
  ]
}
