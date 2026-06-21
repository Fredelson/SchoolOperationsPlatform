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
const uploadRoutes = require("./routes/uploadRoutes");
const path = require("path");

// Teacher Dashboard routes
const teacherDashboardRoutes = require("./routes/teacherDashboardRoutes");

// Printing Admin routes
const printingRoutes = require("./routes/printingRoutes");
const paperStockRoutes = require("./routes/paperStockRoutes");


// Print Limit routes
const limitRoutes = require("./routes/limitRoutes");

// ============================================
// Initialize Express App
// ============================================

const app = express();

// ============================================
// Middleware
// ============================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://itrequest.arabunityschool.org",
      "https://itrequest.arabunityschool.org",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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

app.use("/api/paper-stock", paperStockRoutes);

app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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