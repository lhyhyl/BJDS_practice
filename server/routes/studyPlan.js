const express = require("express");
const router = express.Router();
const studyPlanController = require("../controllers/studyPlanController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, studyPlanController.getStudyPlans);
router.post("/", authMiddleware, studyPlanController.createStudyPlan);
router.put(
  "/:planId/progress",
  authMiddleware,
  studyPlanController.updatePlanProgress
);
router.delete("/:planId", authMiddleware, studyPlanController.deleteStudyPlan);

module.exports = router;
