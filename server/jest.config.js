module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["jest-date-mock", "./tests/setTestEnv.ts"],
  reporters: ["default", "jest-junit"],
  coverageThreshold: {
    global: {
      lines: 50,
    },
  },
  coverageReporters: ["clover", "json", "lcov", "text", "text-summary", "cobertura"],
  testTimeout: 60000,
  bail: 1,
};
