const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const questionController = require("../controllers/questionController");
const auth = require("../middlewares/auth");

// 用户相关路由
router.post("/user/login", userController.login);
router.put("/user/settings", auth, userController.updateSettings);

// 题目相关路由
router.get("/questions", auth, questionController.getQuestions);
router.post("/questions/submit", auth, questionController.submitAnswer);

module.exports = router;
