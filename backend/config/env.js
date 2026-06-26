// ============================================
// ARAB UNITY SCHOOL
// Environment Configuration
// ============================================

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  DB: {
    SERVER: process.env.DB_SERVER,
    PORT: Number(process.env.DB_PORT),
    DATABASE: process.env.DB_DATABASE,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
  },

  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",
  },

  UPLOADS: {
    MAX_SIZE: Number(process.env.MAX_UPLOAD_SIZE) || 52428800,
  },

  CORS: {
    ORIGINS: [
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL,
    ].filter(Boolean),
  },
};