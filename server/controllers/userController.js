const { User } = require("../models");
const jwt = require("jsonwebtoken");
const axios = require("axios");

class UserController {
  // 微信登录
  async login(req, res) {
    try {
      const { code } = req.body;

      // 调用微信接口获取openid
      const response = await axios.get(
        `https://api.weixin.qq.com/sns/jscode2session`,
        {
          params: {
            appid: process.env.WX_APPID,
            secret: process.env.WX_SECRET,
            js_code: code,
            grant_type: "authorization_code",
          },
        }
      );

      const { openid } = response.data;

      // 查找或创建用户
      let user = await User.findOne({ where: { openid } });
      if (!user) {
        user = await User.create({ openid });
      }

      // 生成token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        code: 200,
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            totalQuestions: user.totalQuestions,
            correctRate: user.correctRate,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ code: 500, message: "登录失败" });
    }
  }

  // 获取用户信息
  async getUserInfo(req, res) {
    try {
      const user = req.user;
      res.json({
        code: 200,
        data: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          totalQuestions: user.totalQuestions,
          correctRate: user.correctRate,
          studyTime: user.studyTime,
          lastStudyTime: user.lastStudyTime,
        },
      });
    } catch (error) {
      console.error("Get user info error:", error);
      res.status(500).json({ code: 500, message: "获取用户信息失败" });
    }
  }

  // 更新用户信息
  async updateUserInfo(req, res) {
    try {
      const { nickname, avatar } = req.body;
      const user = req.user;

      await user.update({ nickname, avatar });

      res.json({
        code: 200,
        message: "更新成功",
        data: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Update user info error:", error);
      res.status(500).json({ code: 500, message: "更新用户信息失败" });
    }
  }
}

module.exports = new UserController();
