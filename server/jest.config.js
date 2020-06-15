module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [
    "./tests/checkenv.ts"
  ]
};