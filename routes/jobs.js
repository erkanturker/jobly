"use strict";

const express = require("express");
const Job = require("../models/job");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const newJobSchema = require("../schemas/jobNew.json");
const jobFilterSchema = require("../schemas/jobFilter.json");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");
const { route } = require("./users");

const router = express.Router();

router.post("/", [ensureLoggedIn, ensureAdmin], async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, newJobSchema);
    if (!validator.valid) {
      const errList = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errList);
    }
    const newJob = await Job.create(req.body);
    console.log(newJob);
    return res.status(201).json({ job: newJob });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    let { title, minSalary, hasEquity } = req.query;
    minSalary = parseInt(minSalary) || undefined;
    hasEquity = hasEquity === "true" || undefined;

    const validator = jsonschema.validate(
      { title, minSalary, hasEquity },
      jobFilterSchema
    );
    if (!validator.valid) {
      const errList = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errList);
    }
    const jobs = await Job.findAll({ title, minSalary, hasEquity });
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
