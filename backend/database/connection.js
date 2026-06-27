// backend/database/connection.js

/**
 * Arab Unity School Operations Platform
 * Database Connection
 *
 * Purpose:
 * Creates and shares one MSSQL connection pool across the backend.
 */

const sql = require("mssql");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || "OperationsPlatformDB",

  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log(
      `MSSQL connected to ${dbConfig.database} on ${dbConfig.server}:${dbConfig.port}`
    );
    return pool;
  })
  .catch((error) => {
    console.error("MSSQL connection failed:", error.message);
    throw error;
  });

module.exports = {
  sql,
  poolPromise,
};