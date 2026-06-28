// ============================================
// ARAB UNITY SCHOOL
// Express Application Configuration
// ============================================
//
// Purpose:
// - Configure Express application.
// - Register global middleware.
// - Serve static files.
// - Register the central API router.
// - Configure global error handling.
//
// Architecture:
//
// server.js
//      ↓
// app.js
//      ↓
// routes/index.js
//      ↓
// Feature Modules
//
// Rules:
// - No business logic.
// - No SQL.
// - No route definitions except the API gateway.
// ============================================

const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes");
const errorMiddleware = require("./middleware/errorMiddleware");

// ============================================
// Create Express Application
// ============================================

const app = express();

// ============================================
// Global Middleware
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

// Parse JSON requests
app.use(express.json({ limit: "50mb" }));

// Parse URL encoded requests
app.use(express.urlencoded({ extended: true }));

// ============================================
// Static File Hosting
// ============================================
//
// Uploaded attachments
//

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ============================================
// Health Check
// ============================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Arab Unity School Operations Platform API",
    version: "1.0.0",
  });
});

// ============================================
// API Gateway
// ============================================
//
// Every backend module is registered through
// routes/index.js.
//
// Example:
//
// /api/auth
// /api/users
// /api/roles
// /api/assignments
//
// ============================================

app.use("/api", apiRoutes);

// ============================================
// 404 Handler
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.originalUrl,
  });
});

// ============================================
// Global Error Handler
// ============================================
//
// Must always be the LAST middleware.
//

app.use(errorMiddleware);

// ============================================
// Export Express App
// ============================================

module.exports = app;