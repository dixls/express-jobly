"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
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
    test("should error", async () => {
        try {
            let job = await Job.create({
                companyHandle: "c1",
                salary: 100000,
                equity: 0.8
            });
        } catch (err) {
            expect(err);
        }
    });
});

describe("findAll", () => {
    test("works: no filter", async () => {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
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
        ]);
    });
});

describe("findWith", () => {
    test("works: filter by title", async () => {
        let jobs = await Job.findWith({
            title: "j1"
        });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'j1',
                companyHandle: 'c1',
                salary: 100000,
                equity: "0.1"
            },
            {
                id: expect.any(Number),
                title: 'j1',
                companyHandle: 'c3',
                salary: null,
                equity: "0.4",
            }
        ]);
    });

    test("works: filter by hasEquity", async () => {
        let jobs = await Job.findWith({
            hasEquity: true
        });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'j1',
                companyHandle: 'c1',
                salary: 100000,
                equity: "0.1"
            },
            {
                id: expect.any(Number),
                title: 'j1',
                companyHandle: 'c3',
                salary: null,
                equity: "0.4",
            }
        ]);
    });

    test("works: filter by minSalary", async () => {
        let jobs = await Job.findWith({
            minSalary: 170000
        });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'j2',
                companyHandle: 'c2',
                salary: 200000,
                equity: null
            }
        ]);
    });

    test("error: no matching results", async () => {
        try {
            let jobs = await Job.findWith([
                {
                    minSalary: 180000,
                    hasEquity: true
                }
            ]);
        } catch (err) {
            expect(err);
        }
    });

});