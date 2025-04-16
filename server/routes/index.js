const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// 导入路由模块
const userRoutes = require("./user");
const questionRoutes = require("./question");
const subjectRoutes = require("./subject");
const errorRoutes = require("./error");
const favoriteRoutes = require("./favorite");
const statisticsRoutes = require("./statistics");

// 注册路由
router.use("/user", userRoutes);
router.use("/questions", questionRoutes);
router.use("/subjects", subjectRoutes);
router.use("/errors", errorRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/statistics", statisticsRoutes);

module.exports = router;
