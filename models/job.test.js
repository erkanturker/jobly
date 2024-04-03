const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { request } = require("../app.js");

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

describe("get", () => {
  test("should get all jobs", async () => {
    const result = await Job.findAll({});
    expect(result).toEqual([
      {
        title: "Mechanic Engineer",
        salary: 70000,
        equity: "0.01",
        companyHandle: "c3",
      },
      {
        title: "Qaulity Assurance",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        title: "Software Engineer",
        salary: 110000,
        equity: "0.02",
        companyHandle: "c2",
      },
    ]);
  });
  test("should filter by name", async () => {
    const result = await Job.findAll({ title: "engineer" });
    expect(result).toEqual([
      {
        title: "Mechanic Engineer",
        salary: 70000,
        equity: "0.01",
        companyHandle: "c3",
      },
      {
        title: "Software Engineer",
        salary: 110000,
        equity: "0.02",
        companyHandle: "c2",
      },
    ]);
  });
  test("should filter by name, salary and has equity", async () => {
    const result = await Job.findAll({
      title: "engineer",
      minSalary: 100000,
      hasEquity: true,
    });
    expect(result).toEqual([
      {
        title: "Software Engineer",
        salary: 110000,
        equity: "0.02",
        companyHandle: "c2",
      },
    ]);
  });
});

describe("GET /jobs/:title", () => {
  test("should first job by title", async () => {
    const result = await db.query(
      `SELECT id from JOBS WHERE title='Software Engineer'`
    );

    const id = result.rows[0].id;
    const job = await Job.get(id);
    expect(job).toEqual({
      id,
      title: "Software Engineer",
      salary: 110000,
      equity: "0.02",
      companyHandle: "c2",
    });
  });

  test("should first get not found", async () => {
    try {
      await Job.get(121212);
    } catch (error) {
      expect(error instanceof NotFoundError).toBeTruthy();
    }
  });
});
