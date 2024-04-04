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

describe("GET /jobs/:id", () => {
  test("should get job by id", async () => {
    const result = await db.query(
      `SELECT id from JOBS WHERE title='Sofware Engineer'`
    );
    const id = result.rows[0].id;
    const resp = await request(app).get(`/jobs/${id}`);
    expect(resp.statusCode).toBe(200);
  });
});

describe("PATCH /jobs/:id", () => {
  const updateData = {
    title: "Developer",
    salary: 12222,
    equity: 0.2,
    companyHandle: "c2",
  };

  test("should update", async () => {
    const result = await db.query(
      `SELECT id from JOBS WHERE title='Sofware Engineer'`
    );
    const id = result.rows[0].id;

    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send(updateData)
      .set("authorization", `${adminToken}`);

    updateData.equity = updateData.equity.toString();

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ job: { id, ...updateData } });
  });

  test("should forbidden error user is not admin", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send(updateData)
      .set("authorization", `${u1Token}`);

    expect(resp.statusCode).toBe(403);
  });

  test("should unauthorized error user is not logged in", async () => {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({ ...updateData, equity: 0.2 });

    expect(resp.statusCode).toBe(401);
  });

  test("should get not found error", async () => {
    const resp = await request(app)
      .patch(`/jobs/1231`)
      .send({ title: "Update" })
      .set("authorization", `${adminToken}`);

    expect(resp.statusCode).toBe(404);
  });

  test("should get bad request error", async () => {
    const result = await db.query(
      `SELECT id from JOBS WHERE title='Sofware Engineer'`
    );
    const id = result.rows[0].id;

    updateData.title = "";

    const resp = await request(app)
      .patch(`/jobs/${id}`)
      .send(updateData)
      .set("authorization", `${adminToken}`);

    expect(resp.statusCode).toBe(400);
  });
});

describe("DELETE /jobs/:id", () => {
  test("should first", async () => {
    const result = await db.query(
      `SELECT id from JOBS WHERE title='Sofware Engineer'`
    );
    const id = result.rows[0].id;

    const resp = await request(app)
      .delete(`/jobs/${id}`)
      .set(`authorization`, `${adminToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ deleted: `${id}` });
  });

  test("should get 404 not found", async () => {
    const id = 123;
    const resp = await request(app)
      .delete(`/jobs/${id}`)
      .set(`authorization`, `${adminToken}`);

    expect(resp.statusCode).toBe(404);
  });

  test("should get 403 user is not admin", async () => {
    const id = 123;
    const resp = await request(app)
      .delete(`/jobs/${id}`)
      .set(`authorization`, `${u1Token}`);

    expect(resp.statusCode).toBe(403);
  });

  test("should get 401 user is not logged in", async () => {
    const id = 123;
    const resp = await request(app).delete(`/jobs/${id}`);

    expect(resp.statusCode).toBe(401);
  });
});

describe("POST /users/:username/jobs/:jobId", () => {
  test("should first create an application", async () => {
    const result = await db.query(
      `SELECT id from JOBS WHERE title='Business Analyst'`
    );
    let jobId = result.rows[0].id;

    const resp = await request(app)
      .post(`/users/u1/jobs/${jobId}`)
      .set("authorization", u1Token);

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({ applied: jobId });
  });

  test("should get 401 unathorized error", async () => {
    const resp = await request(app).post(`/users/u1/jobs/1`);

    expect(resp.statusCode).toBe(401);
  });

  test("should get 401 unathorized error", async () => {
    const resp = await request(app)
      .post(`/users/u2/jobs/1`)
      .set("authorization", u1Token);

    expect(resp.statusCode).toBe(403);
  });
});
