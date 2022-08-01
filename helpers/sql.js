const { BadRequestError } = require("../expressError");

// This function takes an object containing data to be updated and an
// object that contains the name of the js property and the name of the 
// corresponding db column. It returns the columns set to a variable
// formatted for SQL and an array of the values to set.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      // looks for either a key of the same name in jsToSql as the key
      // of the data being passed or uses the key name of the data itself
      // to designate the name of the column and sets its value to the index of that value + 1
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
