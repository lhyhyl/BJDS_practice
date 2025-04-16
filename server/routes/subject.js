const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");

// 获取热门科目
router.get("/hot", subjectController.getHotSubjects);

// 获取科目列表
router.get("/", subjectController.getSubjects);

// 获取科目详情
router.get("/:id", subjectController.getSubjectDetail);

module.exports = router;
