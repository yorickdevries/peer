import ParseNetID from "../../src/util/parseNetID";

describe("ParseNetID tests", () => {
  // normalnetid
  test("normal netid", async () => {
    const result = ParseNetID("normalnetid");
    expect(result).toBe("normalnetid");
  });

  // normalnetid with @ something
  test("normal netid with @something", async () => {
    const result = ParseNetID("normalnetid@tudelft.nl");
    expect(result).toBe("normalnetid");
  });

  // normalnetid with numbers
  test("normal netid with numbers", async () => {
    const result = ParseNetID("normalnetid123");
    expect(result).toBe("normalnetid123");
  });

  // normalnetid with numbers 2
  test("normal netid with numbers 2", async () => {
    const result = ParseNetID("n0rmaln3tid5");
    expect(result).toBe("n0rmaln3tid5");
  });

  // invalid netid
  test("invalid netid", async () => {
    const resultfunction = () => {
      return ParseNetID("invalid netid");
    };
    expect(resultfunction).toThrow();
  });
});
