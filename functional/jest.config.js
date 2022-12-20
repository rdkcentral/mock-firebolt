module.exports = {
  verbose: true,
  roots: ['<rootDir>'],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|mjs?|js?|tsx?|ts?)$",

  transform: {
    '^.+\\.(mjs|js|jsx)$': 'babel-jest'
  },
  testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["js", "jsx", "mjs"],

  collectCoverage: false
}
