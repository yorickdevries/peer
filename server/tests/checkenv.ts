// throw error if the environment is not development, test or undefined
// so it blocks running in production
if (!["development", "test", undefined].includes(process.env.NODE_ENV)) {
  throw new Error(`NODE_ENV is set to ${process.env.NODE_ENV}`);
}
