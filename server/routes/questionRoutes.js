const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");

// 获取题目列表
router.get("/", questionController.getQuestions);

// 提交答案
router.post("/submit", questionController.submitAnswer);

module.exports = router;
