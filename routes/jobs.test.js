const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** /GET /jobs */

describe("Test /GET '/jobs'", () => {
  test("should pass: get all jobs, no filters", async () => {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'j1',
          companyHandle: 'c1',
          salary: 100000,
          equity: "0.1"
        },
        {
          id: expect.any(Number),
          title: 'j2',
          companyHandle: 'c2',
          salary: 200000,
          equity: null
        },
        {
          id: expect.any(Number),
          title: 'j1',
          companyHandle: 'c3',
          salary: null,
          equity: "0.4",
        }
      ]
    });
  });

  test("should pass: get jobs with salary min", async () => {
    const resp = await request(app).get("/jobs?minSalary=180000");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: 'j2',
          companyHandle: 'c2',
          salary: 200000,
          equity: null
        },
      ]
    });
  });

  test("should return not found error when no matches", async () => {
    const resp = await request(app).get("/jobs?minSalary=180000&hasEquity=true");

    expect(resp.statusCode).toEqual(404);
    expect(resp.body).toEqual({
      error: {
        "message": "No Jobs found with those parameters",
        "status": 404
      }
    });
  });
});

describe("Test /POST '/jobs'", () => {
  test("should pass: return created job listing", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "test_job",
        companyHandle: "c1",
        salary: 200000,
        equity: .2
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "test_job",
        companyHandle: "c1",
        salary: 200000,
        equity: "0.2"
      }
    });
  });

  test("should pass: missing salary", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "test_job2",
        companyHandle: "c1",
        equity: .3
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "test_job2",
        companyHandle: "c1",
        salary: null,
        equity: "0.3"
      }
    });
  });

  test("should fail: no job title", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        companyHandle: "c1",
        salary: 100,
        equity: .2
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toBe(400);
    expect(resp.body).toEqual({
      error: {
        "message": [
          "instance requires property \"title\"",
        ],
        "status": 400,
      }
    });
  });

  test("should fail: company handle doesn't match existing company", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "test_job",
        companyHandle: "not_a_co",
        salary: 100,
        equity: .2
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toBe(500);
    expect(resp.body).toEqual({
      error: {
        message: `insert or update on table \"jobs\" violates foreign key constraint \"jobs_company_handle_fkey\"`,
        status: 500
      }
    });
  });
});

describe("Test GET '/jobs/[id]'", () => {
  test("should pass: valid id", async () => {
    const resp = await request(app).get("/jobs/1");

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        companyHandle: "c1",
        salary: 100000,
        equity: "0.1"
      }
    });
  });

  test("should error: invalid id", async () => {
    const resp = await request(app).get("/jobs/666");

    expect(resp.statusCode).toBe(404);
  });
});

describe("Test PATCH '/jobs/[id]'", () => {
  test("should pass: appropriate parameters for update", async () => {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({
        title: "test_title",
      })
      .set("authorization", `Bearer ${u1Token}`);

    // expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "test_title",
        companyHandle: "c1",
        salary: 100000,
        equity: "0.1"
      }
    });
  });

  test("should error: changing companyHandle not allowed", async () => {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({
        companyHandle: "c2"
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.status).toBe(400);
    expect(resp.body).toEqual({
      error: {
        message: [
          "instance additionalProperty \"companyHandle\" exists in instance when not allowed"
        ],
        status: 400
      }
    });
  });
});

describe("Test DELETE '/jobs/[id]'", () => {
  test("should pass: valid id & auth", async () => {
    const resp = await request(app).delete("/jobs/1")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      deleted: "1"
    });
  });

  test("should error: not found", async () => {
    const resp = await request(app).delete("/jobs/666")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.status).toBe(404);
    expect(resp.body).toEqual({
      error: {
        message: "No job found matching id: 666",
        status: 404
      }
    })
  });

  test("should error: not admin", async () => {
    const resp = await request(app).delete("/jobs/1")
      .set("authorization", `Bearer ${u2Token}`);
    
      expect(resp.status).toBe(401);
      expect(resp.body).toEqual({
        error: {
          message: "Unauthorized",
          status: 401
        }
      });
  });
});