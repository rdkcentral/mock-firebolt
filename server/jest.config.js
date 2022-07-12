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
  collectCoverageFrom: [
    '<rootDir>/server/src/**/*.js',
    '!<rootDir>/server/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'html',
    'json',
  ]
}
