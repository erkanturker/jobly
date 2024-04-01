const { BadRequestError } = require("../expressError");

/**
 * Converts JavaScript data to be updated into SQL-compatible format for partial updates.
 *
 * @param {Object} dataToUpdate - Data to be updated.
 * @param {Object} jsToSql - Mapping object specifying SQL-equivalent keys for JavaScript keys.
 * @returns {Object} - An object containing SQL-ready set clause and corresponding values.
 * @throws {BadRequestError} - If no data to update is provided.
 *
 * @example
 * // Returns { setCols: 'first_name=$1, last_name=$2', values: ['John', 'Doe'] }
 * sqlForPartialUpdate({ firstName: 'John', lastName: 'Doe' }, { firstName: 'first_name', lastName: 'last_name' });
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
