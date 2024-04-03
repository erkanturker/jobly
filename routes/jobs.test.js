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
