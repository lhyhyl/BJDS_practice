const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const practiceController = require("../controllers/practiceController");

router.get("/questions", auth, practiceController.getQuestions);
router.post("/submit", auth, practiceController.submitAnswer);
router.get("/records", auth, practiceController.getRecords);
router.get("/statistics", auth, practiceController.getStatistics);

module.exports = router;
