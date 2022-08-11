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

describe("test get", () => {
    test("should pass", async () => {
        const jobs = await Job.findAll();
        const jobToFind = jobs[0]
        const job = await Job.get(jobToFind.id);

        expect(job).toEqual({
            companyHandle: "c1",
            equity: "0.1",
            id: expect.any(Number),
            salary: 100000,
            title: "j1"
        });
    });

    test("should fail: not found", async () => {
        try {
            const job = await Job.get(666);
        } catch (err) {
            expect(err.status).toEqual(404);
        }
    });
});

describe("test update", () => {
    test("should pass: update job with appropriate params", async () => {
        const job = await Job.update(1, {
            title: "test_update"
        });

        expect(job).toEqual({
            id: 1,
            title: "test_update",
            companyHandle: "c1",
            salary: 100000,
            equity: "0.1"
        });
    });
    test("should error: not found job", async () => {
        try{
            const job = await Job.update(666, {
                title: "test_update"
            });
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });
});

describe("test remove", () => {
    test("should pass: delete job that exists", async () => {
        const jobs = await Job.findAll();
        const job = jobs[0];

        const delJob = await Job.remove(job.id);

        expect(delJob).toBe(true);
        try {
            const deletedJob = await Job.get(job.id);
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    test("should error: delete job that does not exist", async () => {
        try {
            const delJob = await Job.remove(666);
        } catch (err) {
            expect(err.status).toBe(404);
        }

    })
});