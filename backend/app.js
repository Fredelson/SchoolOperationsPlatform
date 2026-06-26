// ============================================
// ARAB UNITY SCHOOL
// Express App Configuration
//
// Purpose:
// - Configure middleware
// - Register API routes
// - Serve uploads
// - Define health check
// ============================================

const errorMiddleware = require("./middleware/errorMiddleware");
const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRoutes = require("./routes");

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

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ARAB UNITY SCHOOL Backend API Running",
  });
});

// All API routes
app.use("/api", apiRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

app.use(errorMiddleware);

module.exports = app;