const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");
const auth = require("../middlewares/auth");

// 获取学习统计
router.get("/", statisticsController.getStatistics);

// 获取学习进度
router.get("/progress", statisticsController.getProgress);

// 获取科目统计
router.get("/subject/:id", statisticsController.getSubjectStatistics);

// 添加每日统计和连续打卡相关路由
router.get("/daily", auth, statisticsController.getDailyStatistics);
router.post("/streak/update", auth, statisticsController.updateStreak);

module.exports = router;
