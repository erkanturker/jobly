const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", () => {
  test("should first create job", async () => {
    const newJob = {
      title: "Product Manager",
      salary: 10000,
      equity: "0.002",
      companyHandle: "c1",
    };
    const result = await Job.create(newJob);
    expect(result).toEqual(newJob);
  });

  test("should get BadRequest when it is duplicate", async () => {
    const newJob = {
      title: "Qaulity Assurance",
      salary: 10000,
      equity: "0.002",
      companyHandle: "c1",
    };

    try {
      await Job.create(newJob);
    } catch (error) {
      expect(error instanceof BadRequestError).toBeTruthy();
    }
  });

  test("should get BadRequest when company is not found", async () => {
    const newJob = {
      title: "Qaulity Assurance",
      salary: 10000,
      equity: "0.002",
      companyHandle: "test12",
    };

    try {
      await Job.create(newJob);
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
