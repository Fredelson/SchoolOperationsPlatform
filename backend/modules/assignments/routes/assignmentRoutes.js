// backend/modules/assignments/routes/assignmentRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Routes
 * ============================================================
 *
 * Current API:
 * GET /api/assignments/types
 *
 * Future API:
 * GET    /api/assignments/users/:userId
 * POST   /api/assignments/users/:userId
 * PUT    /api/assignments/:assignmentId
 * DELETE /api/assignments/:assignmentId
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const {
  getAssignmentTypes,
  getUserAssignments,
  createUserAssignment,
} = require("../controllers/assignmentController");

const { protect } = require("../../../middleware/authMiddleware");

router.use(protect);

router.get("/types", getAssignmentTypes);

router.get("/users/:userId", getUserAssignments);
router.post("/users/:userId", createUserAssignment);

module.exports = router;