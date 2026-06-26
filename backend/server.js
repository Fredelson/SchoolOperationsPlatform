// ============================================
// ARAB UNITY SCHOOL
// Backend Server Entry Point
//
// Purpose:
// - Load environment variables
// - Connect to MSSQL
// - Start Express server
// ============================================

require("dotenv").config();

const app = require("./app");
const { poolPromise } = require("./config/db");

// ============================================
// Server Configuration
// ============================================

const PORT = process.env.PORT || 5000;

// ============================================
// Start Server
// ============================================

const startServer = async () => {
  try {
    await poolPromise;

    app.listen(PORT, () => {
      console.log(`🚀 ARAB UNITY SCHOOL Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to MSSQL");
    console.error(error);
    process.exit(1);
  }
};

startServer();