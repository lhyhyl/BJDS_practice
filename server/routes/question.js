const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const auth = require("../middlewares/auth");

// 获取问题列表
router.get("/", questionController.getQuestions);

// 获取每日推荐题目
router.get("/daily", questionController.getDailyQuestions);

// 搜索题目
router.get("/search", questionController.searchQuestions);

// 获取单个问题
router.get("/:id", questionController.getQuestion);

// 提交答案
router.post("/submit", questionController.submitAnswer);

// 添加获取计划题目的路由
router.get('/plan', auth, questionController.getPlanQuestions);

module.exports = router; 