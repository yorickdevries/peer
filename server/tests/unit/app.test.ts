import app from "../../src/app";

describe("App", () => {
  test("app environment", () => {
    expect(app.get("env")).toBe("test");
  });
});
