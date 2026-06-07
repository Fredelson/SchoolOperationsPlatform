// Import required packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import MSSQL connection pool
const { poolPromise } = require("./config/db");

// Import API routes
const authRoutes = require("./routes/authRoutes");

// Create Express application
const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.send("ARAB UNITY SCHOOL Photocopy Backend is running");
});

/*
|--------------------------------------------------------------------------
| Database Connection Test Route
|--------------------------------------------------------------------------
*/

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .query("SELECT GETDATE() AS CurrentDate");

    res.json({
      message: "Database connected successfully",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Database Test Error:", error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ARAB UNITY SCHOOL Backend running on port ${PORT}`);
});