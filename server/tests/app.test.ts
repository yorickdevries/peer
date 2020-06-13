import app from "../src/app";

test("app environment", () => {
  expect(app.get("env")).toBe("test");
});
