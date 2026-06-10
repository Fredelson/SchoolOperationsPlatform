// ============================================
// ARAB UNITY SCHOOL
// Backend Server
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { poolPromise } = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

const hodRoutes = require("./routes/hodRoutes");

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