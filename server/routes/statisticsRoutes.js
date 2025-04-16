const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

// 获取学习统计
router.get("/", statisticsController.getStatistics);

module.exports = router;
