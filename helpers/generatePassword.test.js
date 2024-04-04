const randomPassword = require("./generatePassword");

describe("Generate Random Password", () => {
  test("should first generate random password", () => {
    expect(randomPassword).toBeTruthy();
  });
});
