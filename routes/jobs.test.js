const request = require("supertest");
const Job = require("../models/job");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", () => {
  const newJob = {
    title: "Business Analayst",
    salary: 10000,
    equity: 0.002,
    companyHandle: "c1",
  };

  test("create jobs", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(201);
    newJob.equity = newJob.equity.toString();
    expect(resp.body).toEqual({ job: newJob });
  });

  test("should 403 is not admin", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(403);
  });

  test("should 401 is not log in", async () => {
    const resp = await request(app).post("/jobs").send(newJob);
    expect(resp.statusCode).toBe(401);
  });

  test("should 400 when missing title", async () => {
    delete newJob.title;
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toBe(400);
  });
});

describe("GET /jobs", () => {
  test("should all Jobs", async () => {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Business Analyst",
          salary: 6000,
          equity: "0",
          companyHandle: "c2",
        },
        {
          title: "Product Manager",
          salary: 10000,
          equity: "0.002",
          companyHandle: "c1",
        },
        {
          title: "Sofware Engineer",
          salary: 9000,
          equity: "0.23",
          companyHandle: "c2",
        },
      ],
    });
  });
  test("should filter Job by name", async () => {
    const resp = await request(app).get("/jobs").query({ title: "Product" });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Product Manager",
          salary: 10000,
          equity: "0.002",
          companyHandle: "c1",
        },
      ],
    });
  });
  test("should filter Job by salary and equity", async () => {
    const resp = await request(app)
      .get("/jobs")
      .query({ minSalary: 7000, hasEquity: true });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          title: "Product Manager",
          salary: 10000,
          equity: "0.002",
          companyHandle: "c1",
        },
        {
          title: "Sofware Engineer",
          salary: 9000,
          equity: "0.23",
          companyHandle: "c2",
        },
      ],
    });
  });
  test("should get 400 error when name is empty", async () => {
    const resp = await request(app).get("/jobs").query({ title: "" });
    expect(resp.statusCode).toBe(400);
  });
});
