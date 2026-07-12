// Compatibility export for legacy repositories. All backend data access now
// shares the single pool configured in database/connection.js.
module.exports = require("../database/connection");
