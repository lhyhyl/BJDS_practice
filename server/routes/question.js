const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

// 获取问题列表
router.get("/", questionController.getQuestions);

// 获取单个问题
router.get("/:id", questionController.getQuestion);

// 提交答案
router.post("/submit", questionController.submitAnswer);

module.exports = router; 