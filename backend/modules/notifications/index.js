/* =========================================================
   Notifications Module Entry Point
   ========================================================= */

const express = require("express");
const router = express.Router();

const notificationReadRoutes = require("./routes/notificationReadRoutes");

router.use(notificationReadRoutes);

module.exports = router;
