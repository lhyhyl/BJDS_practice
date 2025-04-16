const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 微信登录
router.post("/login", userController.login);

// 获取用户信息
router.get("/info", userController.getUserInfo);

// 更新用户信息
router.put("/info", userController.updateUserInfo);

module.exports = router;
