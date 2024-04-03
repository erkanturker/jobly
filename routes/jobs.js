"use strict";

const express = require("express");
const Job = require("../models/job");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const newJobSchema = require("../schemas/jobNew.json");
const jsonschema = require("jsonschema");
const { BadRequestError } = require("../expressError");

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
    return res.json({ job: newJob });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
