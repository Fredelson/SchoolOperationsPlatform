// ============================================
// ARAB UNITY SCHOOL
// Backend Server
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { poolPromise } = require("./config/db");

// ============================================
// Routes
// ============================================
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const hodRoutes = require("./routes/hodRoutes");
const hosRoutes = require("./routes/hosRoutes");

// Printing Admin routes
const printingRoutes = require("./routes/printingRoutes");

const app = express();

// ============================================
// Middleware
// ============================================
app.use(cors());

// Allow large JSON request bodies
app.use(
  express.json({
    limit: "50mb",
  })
);

// Allow URL encoded form data
app.use(
  express.urlencoded({
    extended: true,
  })
);

// ============================================
// Health Check
// ============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ARAB UNITY SCHOOL Backend API Running",
  });
});

// ============================================
// API Routes
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/hos", hosRoutes);

// Printing Admin API route
app.use("/api/printing", printingRoutes);

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Make sure MSSQL connection is ready before starting API
    await poolPromise;

    app.listen(PORT, () => {
      console.log(
        `🚀 ARAB UNITY SCHOOL Backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to connect to MSSQL");
    console.error(error);
  }
};

startServer();