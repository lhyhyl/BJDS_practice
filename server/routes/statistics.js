const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

// 获取学习统计
router.get("/", statisticsController.getStatistics);

// 获取科目统计
router.get("/subject/:id", statisticsController.getSubjectStatistics);

module.exports = router;
