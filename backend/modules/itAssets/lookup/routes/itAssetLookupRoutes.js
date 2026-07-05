const express = require("express");
const router = express.Router();

const itAssetLookupController = require("../controllers/itAssetLookupController");

router.get("/", itAssetLookupController.getITAssetLookups);

module.exports = router;