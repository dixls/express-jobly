"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForCreatingJob } = require("../helpers/sql");

class Job {
    /** Create a job from data, update db, return new job data.
     * 
     * data should be { title, companyHandle, salary, equity }
     * 
     * Returns { id, title, salary, equity, company_handle }
     * 
     */

    static async create(data,) {
        const jsToSql = {
            title: "title",
            companyHandle: "company_handle",
            salary: "salary",
            equity: "equity"
        }
        const { colNames, args, values } = sqlForCreatingJob(data, jsToSql);
        const result = await db.query(
            `INSERT INTO jobs
                (${colNames})
                VALUES (${args})
                RETURNING id, title, salary, equity, company_handle as "companyHandle"`,
                values);
        return result.rows[0];
    }
}

module.exports = Job;