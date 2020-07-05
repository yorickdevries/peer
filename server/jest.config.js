module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["jest-date-mock", "./tests/setTestEnv.ts"],
};
