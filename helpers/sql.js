const { BadRequestError } = require("../expressError");
/** 
 * 
 * This function takes an object containing data to be updated and an
 * object that contains the name of the js property and the name of the 
 * corresponding db column.
 * 
 * returns: {
 *    setCols: formatted SQL string for a VALUES clause in a SET statement,
 *    values: values for the parameters being set
 * }
 * 
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** 
 * 
 * This function takes an object containing data to be updated and an
 * object that contains the name of the js property and the name of the 
 * corresponding db column and sql operator.
 * 
 * returns: {
 *    setCols: formatted SQL string for a WHERE clause,
 *    values: values for parameters being set, changed to `%value%` for name filters
 * }
 * 
 */
function sqlForFilteringQuery(filterParams, jsToSql) {
  const keys = Object.keys(filterParams);
  let values = Object.values(filterParams);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `${jsToSql[colName].sql || colName} ${jsToSql[colName].operator || '='} $${idx + 1}`,
  );
  values = values.map((value, idx) => {
    if(keys[idx] == "name") {
      return `%${value.toLowerCase()}%`;
    } else {
      return value;
    }
  });
  return {
    setCols: cols.join(" AND "),
    values: values,
  };
}

module.exports = { sqlForPartialUpdate, sqlForFilteringQuery };
