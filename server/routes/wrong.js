const express = require("express");
const router = express.Router();
const wrongController = require("../controllers/wrongController");
const authMiddleware = require("../middlewares/authMiddleware");

// 获取用户的错题列表
router.get("/", authMiddleware, wrongController.getWrongQuestions);

// 添加错题
router.post("/", authMiddleware, wrongController.addWrongQuestion);

// 删除错题
router.delete(
  "/:questionId",
  authMiddleware,
  wrongController.removeWrongQuestion
);

module.exports = router;
