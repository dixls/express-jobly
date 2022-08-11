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
    console.log(resp);
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
      });

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
      });

    expect(resp.statusCode).toBe(500);
    expect(resp.body).toEqual({
      error: {
        message : `insert or update on table \"jobs\" violates foreign key constraint \"jobs_company_handle_fkey\"`,
        status: 500
      }
    })
  })
});