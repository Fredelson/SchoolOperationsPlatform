/* =========================================================
   IT Asset Validation Helper
========================================================= */

const isValidId = (value) => {
  return value !== undefined && value !== null && Number(value) > 0;
};

module.exports = {
  isValidId,
};