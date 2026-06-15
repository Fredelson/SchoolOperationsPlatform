// ============================================
// ARAB UNITY SCHOOL
// Backend Server
// Main Express API entry point
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
const lookupRoutes = require("./routes/lookupRoutes");
const userRoutes = require("./routes/userRoutes");

// Teacher Dashboard routes
const teacherDashboardRoutes = require("./routes/teacherDashboardRoutes");

// Printing Admin routes
const printingRoutes = require("./routes/printingRoutes");

// Print Limit routes
const limitRoutes = require("./routes/limitRoutes");

// ============================================
// Initialize Express App
// ============================================

const app = express();

// ============================================
// Middleware
// ============================================

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ============================================
// Health Check Route
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
app.use("/api/lookups", lookupRoutes);

// User Management API route
app.use("/api/users", userRoutes);

// Teacher Dashboard API route
app.use("/api/teacher/dashboard", teacherDashboardRoutes);

// Printing Admin API route
app.use("/api/printing", printingRoutes);

// Print Limit API route
app.use("/api/limits", limitRoutes);

// ============================================
// Start Server
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
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