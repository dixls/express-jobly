"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForCreatingJob, sqlForFilteringQuery } = require("../helpers/sql");

class Job {
    /** Create a job from data, update db, return new job data.
     * 
     * data should be { title, companyHandle, salary, equity }
     * 
     * Returns { id, title, salary, equity, companyHandle }
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

    /** Find all Jobs
     * 
     * returns [{id, title, salary, equity, companyHandle}, ...]
     */

    static async findAll() {
        const jobs = await db.query(
            `SELECT id, title, salary, equity, company_handle as "companyHandle"
            FROM jobs
            ORDER BY id`);
        return jobs.rows;
    }

    /** Find jobs with filters
     * 
     * returns [{id, title, salary, equity, companyHandle}, ...]
     * Where query params match the companies
     */

    static async findWith(filterParams) {
        const jsToSql = {
            companyHandle: {
                sql: "company_handle",
                operator: "like"
            },
            minSalary: {
                sql: "salary",
                operator: ">="
            },
            hasEquity: {
                sql: "equity",
                operator: ">"
            },
            title: {
                sql: "title",
                operator: "like"
            }
        };
        const {setCols, values} = sqlForFilteringQuery(filterParams, jsToSql);
        const query = `SELECT id,
                              title,
                              company_handle as "companyHandle",
                              salary,
                              equity
                        FROM jobs
                        WHERE ${setCols}`;
        const result = await db.query(query, values);
        const jobs = result.rows;

        if (jobs.length === 0) throw new NotFoundError(`No Jobs found with those parameters`);

        return jobs;
    }
}

module.exports = Job;