const express = require("express");

const managementRoutes = require("./routes/printingManagementRoutes");
const queueRoutes = require("./routes/printingRoutes");
const operationsRoutes = require("./routes/printingOperationsRoutes");

const router = express.Router();

router.use(managementRoutes);
router.use(queueRoutes);
router.use(operationsRoutes);

module.exports = router;
