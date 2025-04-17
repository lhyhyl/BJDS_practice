const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// 导入路由模块
const userRoutes = require("./userRoutes");
const questionRoutes = require("./question");
const subjectRoutes = require("./subject");
const errorBookRoutes = require("./errorBook");
const favoriteRoutes = require("./favorite");
const statisticsRoutes = require("./statistics");

// 注册路由
router.use("/user", userRoutes);
router.use("/questions", questionRoutes);
router.use("/subjects", subjectRoutes);
router.use("/errorbook", authMiddleware, errorBookRoutes);
router.use("/favorites", authMiddleware, favoriteRoutes);
router.use("/statistics", authMiddleware, statisticsRoutes);

module.exports = router;
