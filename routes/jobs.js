"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, requireAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");

const router = new express.Router();


/** POST / { job } => { job }
 * 
 * job should be { title, companyHandle, salary, equity }
 * title and companyHandle required
 * 
 * returns 
 */
router.post("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ company });
    } catch (err) {
        return next(err);
    }
});

/** GET / =>
 *  { jobs: [ { id, title, companyHandle} ]}
 */
router.get("/", async function (req, res, next) {
    try {
        if (Object.keys(req.query).length === 0) {
            const jobs = await Job.findAll();
            return res.json({ jobs })
        } else {
            const jobs = await Job.findWith(req.query);
            return res.json({ jobs })
        }
    } catch (err) {
        return next(err);
    }
})


module.exports = router;