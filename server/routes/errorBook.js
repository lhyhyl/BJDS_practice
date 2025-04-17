const express = require("express");
const router = express.Router();
const errorBookController = require("../controllers/errorBookController");
const authMiddleware = require("../middlewares/authMiddleware");

// 获取错题本列表
router.get("/", authMiddleware, errorBookController.getErrorQuestions);

// 添加错题到错题本
router.post("/", authMiddleware, errorBookController.addErrorQuestion);

// 从错题本删除错题
router.delete("/:questionId", authMiddleware, errorBookController.deleteErrorQuestion);

module.exports = router; 