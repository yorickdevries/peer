module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["jest-date-mock", "./tests/setTestEnv.ts"],
  coverageThreshold: {
    global: {
      lines: 50,
    },
  },
  testTimeout: 60000,
};
