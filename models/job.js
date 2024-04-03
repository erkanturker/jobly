const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Job {
  /** Create a job (from data), update db, return new job data.
   * data should be { title, salary, equity, companyHandle }
   * Returns { title, salary, equity, companyHandle }
   * Throws BadRequestError if job already with the same company in database.
   * Throws NotFoundError if company is not found
   * */
  static async create({ title, salary, equity, companyHandle }) {
    const checkHandle = await db.query(
      `SELECT handle FROM companies
       where handle=$1 `,
      [companyHandle]
    );

    if (checkHandle.rows.length !== 1) {
      throw new NotFoundError(`The company: ${companyHandle} is not found`);
    }

    const checkDuplicate = await db.query(
      `SELECT title,company_handle FROM jobs
       WHERE title=$1 and company_handle=$2`,
      [title, companyHandle]
    );

    if (checkDuplicate.rows[0]) {
      throw new BadRequestError(
        `Duplite Job with the same Company, Job:${title} Company:${companyHandle} `
      );
    }

    const result = await db.query(
      `INSERT INTO jobs 
         (title, salary, equity, company_handle)
         VALUES ($1, $2, $3, $4)
         RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, parseFloat(equity), companyHandle]
    );

    const job = result.rows[0];

    return job;
  }

  /**
   * Find All Jobs
   * This method retrieves all jobs from the database with optional filtering based on title, minimum salary, and whether the job has equity.
   * @param {object} options - Filtering criteria.
   * @param {string} options.title - Title of the job to filter by (case-insensitive).
   * @param {number} options.minSalary - Minimum salary of the job to filter by.
   * @param {boolean} options.hasEquity - Indicates whether the job must have equity.
   * @returns {Array} - Filtered list of jobs.
   */

  static async findAll({ title, minSalary, hasEquity }) {
    const jobs = await db.query(
      `SELECT title,
        salary, 
        equity,
        company_handle AS "companyHandle"
      FROM jobs 
      ORDER BY title`
    );

    const filteredJobs = jobs.rows.filter((job) => {
      const titleCheck =
        !title || job.title.toLowerCase().includes(title.toLowerCase());

      const minSalaryCheck = !minSalary || job.salary > minSalary;

      const checkHasEquity = !hasEquity || job.equity > 0;

      return titleCheck && minSalaryCheck && checkHasEquity;
    });

    return filteredJobs;
  }

  /**
   * Retrieve a Job by ID
   * This method retrieves a job from the database based on the provided id.
   * @param {int} id - The id  of the job to retrieve.
   * @returns {object} - The job object containing title, salary, equity, and companyHandle.
   * @throws {NotFoundError} - If no job with the provided title is found in the database.
   */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary, 
              equity,
              company_handle AS "companyHandle"
        FROM jobs 
        WHERE id=$1 `,
      [id]
    );

    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No Job:${id} is found`);

    return job;
  }
}

module.exports = Job;
