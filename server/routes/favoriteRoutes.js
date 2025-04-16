const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

// 获取收藏列表
router.get("/", favoriteController.getFavorites);

// 添加收藏
router.post("/", favoriteController.addFavorite);

// 取消收藏
router.delete("/:id", favoriteController.deleteFavorite);

module.exports = router;
