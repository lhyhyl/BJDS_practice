const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const favoriteController = require("../controllers/favoriteController");

// 获取收藏夹列表
router.get("/", authMiddleware, favoriteController.getFavorites);

// 添加收藏
router.post("/", authMiddleware, favoriteController.addFavorite);

// 删除收藏
router.delete(
  "/:questionId",
  authMiddleware,
  favoriteController.removeFavorite
);

module.exports = router;
