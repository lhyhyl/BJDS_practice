const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const questionController = require("../controllers/questionController");
const subjectController = require("../controllers/subjectController");
const favoriteController = require("../controllers/favoriteController");
const errorBookController = require("../controllers/errorBookController");
const statisticsController = require("../controllers/statisticsController");
const auth = require("../middlewares/auth");

// 用户相关路由
router.post("/user/login", userController.login);
router.put("/user/settings", auth, userController.updateSettings);

// 科目相关路由
router.get("/subjects", subjectController.getSubjects);
router.get("/subjects/hot", subjectController.getHotSubjects);
router.get("/subjects/:id", subjectController.getSubjectDetail);

// 题目相关路由
router.get("/questions", questionController.getQuestions);
router.get("/questions/daily", questionController.getDailyQuestion);
router.get("/questions/search", questionController.searchQuestions);
router.get("/questions/:id", questionController.getQuestion);
router.post("/questions/submit", auth, questionController.submitAnswer);

// 收藏相关路由
router.get("/favorites", auth, favoriteController.getFavorites);
router.post("/favorites", auth, favoriteController.addFavorite);
router.delete("/favorites/:id", auth, favoriteController.removeFavorite);

// 错题本相关路由
router.get("/wrongquestions", auth, errorBookController.getWrongQuestions);
router.post("/errorbook", auth, errorBookController.addToErrorBook);
router.delete("/errorbook/:id", auth, errorBookController.removeFromErrorBook);

// 统计相关路由
router.get(
  "/statistics/progress",
  auth,
  statisticsController.getCategoryProgress
);
router.get("/statistics/overview", auth, statisticsController.getUserOverview);

module.exports = router;
