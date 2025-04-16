const express = require("express");
const router = express.Router();
const wrongQuestionController = require("../controllers/wrongQuestionController");
const authMiddleware = require("../middlewares/authMiddleware");

// 获取错题列表
router.get("/", wrongQuestionController.getWrongQuestions);

// 删除错题
router.delete("/:id", wrongQuestionController.deleteWrongQuestion);

module.exports = router;
