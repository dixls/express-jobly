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
  test("should pass: get all jobs", async () => {
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
});

// describe("Test /POST '/jobs'", () => {

// });