const { sqlForPartialUpdate } = require("./sql");

describe("testing sqlPartial Upddate ", () => {
  test("should first return columName=$", () => {
    const testData = {
      username: "test",
      firstName: "Test",
      lastName: "Data",
      email: "test@gmail.com",
      isAdmin: false,
    };
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    };
    const updateData = sqlForPartialUpdate(testData, jsToSql);
    expect(updateData.setCols).toEqual(
      '"username"=$1, "first_name"=$2, "last_name"=$3, "email"=$4, "is_admin"=$5'
    );
    expect(updateData.values).toEqual([
      "test",
      "Test",
      "Data",
      "test@gmail.com",
      false,
    ]);
  });
});
