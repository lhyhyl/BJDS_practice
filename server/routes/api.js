const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const questionController = require("../controllers/questionController");
const subjectController = require("../controllers/subjectController");
const favoriteController = require("../controllers/favoriteController");
const errorBookController = require("../controllers/errorBookController");
const statisticsController = require("../controllers/statisticsController");
const studyPlanController = require("../controllers/studyPlanController");
const authMiddleware = require("../middlewares/authMiddleware");
const studyPlanRoutes = require("./studyPlan");

// 用户相关路由
router.post("/user/login", userController.login);
router.put("/user/settings", authMiddleware, userController.updateSettings);

// 科目相关路由
router.get("/subjects", subjectController.getSubjects);
router.get("/subjects/hot", subjectController.getHotSubjects);
router.get("/subjects/:id", subjectController.getSubjectDetail);

// 题目相关路由
router.get("/questions", questionController.getQuestions);
router.get("/questions/daily", questionController.getDailyQuestion);
router.get("/questions/search", questionController.searchQuestions);
router.get("/questions/:id", questionController.getQuestion);
router.post(
  "/questions/submit",
  authMiddleware,
  questionController.submitAnswer
);

// 收藏相关路由
router.get("/favorites", authMiddleware, favoriteController.getFavorites);
router.post("/favorites", authMiddleware, favoriteController.addFavorite);
router.delete(
  "/favorites/:questionId",
  authMiddleware,
  favoriteController.removeFavorite
);

// 错题本相关路由
router.get("/errorbook", authMiddleware, errorBookController.getErrorQuestions);
router.post("/errorbook", authMiddleware, errorBookController.addErrorQuestion);
router.delete(
  "/errorbook/:questionId",
  authMiddleware,
  errorBookController.deleteErrorQuestion
);

// 统计相关路由
router.get(
  "/statistics/progress",
  authMiddleware,
  statisticsController.getCategoryProgress
);
router.get(
  "/statistics/overview",
  authMiddleware,
  statisticsController.getUserOverview
);

// 学习计划相关路由
router.use("/study-plans", studyPlanRoutes);

module.exports = router;
