const express = require("express");
const router = express.Router();
const errorBookController = require("../controllers/errorBookController");

// 获取错题列表
router.get("/", errorBookController.getErrorQuestions);

// 添加错题
router.post("/", errorBookController.addErrorQuestion);

// 删除错题
router.delete("/:id", errorBookController.deleteErrorQuestion);

module.exports = router; 