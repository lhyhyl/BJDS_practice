const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/phone-login", userController.phoneLogin);
router.post("/auto-login", userController.autoLogin);

// 发送验证码
router.post("/send-code", userController.sendCode);

// 开发环境登录路由 - 在控制器中检查环境
router.post("/dev-login", userController.devLogin);

// Protected routes
router.get("/profile", authMiddleware, userController.getUserInfo);
router.post("/settings", authMiddleware, userController.updateSettings);
router.put("/profile", authMiddleware, userController.updateUserInfo);
router.get("/statistics", authMiddleware, userController.getUserStatistics);

module.exports = router;
