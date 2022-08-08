"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const Job = require("./jobs.js");
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

/************************************** create */

describe("create", () => {
    const newJob = {
        title: "test_job_1",
        companyHandle: "c1",
        salary: 100000,
        equity: 0.8
    };

    test("should pass", async () => {
        let job = await Job.create(newJob);
        
        expect(job.id).toEqual(expect.any(Number));
    });
});