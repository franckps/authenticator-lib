module.exports = {
  roots: ["<rootDir>"],
  clearMocks: true,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    "!<rootDir>/src/domain/**",
    "!<rootDir>/src/main/**",
    "!<rootDir>/src/**/protocols/**",
    "!<rootDir>/src/**/models/**",
    "!<rootDir>/src/**/interfaces/**",
    "!<rootDir>/src/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  transform: {
    ".+\\.ts$": "ts-jest",
  },
};
