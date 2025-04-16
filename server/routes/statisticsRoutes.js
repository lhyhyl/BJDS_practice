const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// 获取学习统计
router.get("/", authMiddleware, statisticsController.getStatistics);

module.exports = router;
