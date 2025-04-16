const { User, UserStatistics, Subject } = require("../models/index");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const config = require("../config/config");
const { Op } = require("sequelize");
const db = require("../models");

// 内存存储验证码
const verifyCodeStore = {};

class UserController {
  // 用户注册
  async register(req, res) {
    try {
      const { username, password, phone, verifyCode, nickname } = req.body;

      // 验证必填参数
      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: "用户名和密码不能为空",
        });
      }

      // 如果提供了手机号，验证验证码
      if (phone) {
        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
          return res.status(400).json({
            code: 400,
            message: "请输入正确的手机号",
          });
        }

        // 如果提供了验证码，验证其有效性
        if (verifyCode) {
          // 验证验证码
          let isValid = false;
          if (
            process.env.NODE_ENV !== "production" &&
            verifyCode === "123456"
          ) {
            isValid = true;
          } else {
            // 获取存储的验证码
            const storedVerifyCode = verifyCodeStore[phone];
            if (
              storedVerifyCode &&
              storedVerifyCode.code === verifyCode &&
              storedVerifyCode.expireAt > Date.now()
            ) {
              isValid = true;
              // 验证成功后删除存储的验证码
              delete verifyCodeStore[phone];
            }
          }

          if (!isValid) {
            return res.status(400).json({
              code: 400,
              message: "验证码错误或已过期",
            });
          }
        }

        // 检查手机号是否已注册
        const existingPhoneUser = await User.findOne({ where: { phone } });
        if (existingPhoneUser) {
          return res.status(400).json({
            code: 400,
            message: "该手机号已被注册",
          });
        }
      }

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          code: 400,
          message: "该用户名已被注册",
        });
      }

      // 创建用户
      const user = await User.create({
        username,
        password, // 实际项目中应该使用bcrypt等库进行密码加密
        phone: phone || null,
        nickname: nickname || username,
        status: "active",
      });

      // 生成JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          phone: user.phone,
        },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        code: 0,
        data: {
          token,
          userInfo: {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            phone: user.phone,
            avatar: user.avatar,
          },
        },
        message: "注册成功",
      });
    } catch (error) {
      console.error("注册失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 发送验证码
  async sendVerifyCode(req, res) {
    try {
      const { phone } = req.body;

      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          message: "请输入正确的手机号",
        });
      }

      // 生成6位随机验证码
      const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 存储验证码，设置10分钟过期
      verifyCodeStore[phone] = {
        code: verifyCode,
        expireAt: Date.now() + 10 * 60 * 1000,
      };

      // 实际项目中这里应该调用短信服务
      console.log(`向手机号 ${phone} 发送验证码: ${verifyCode}`);

      return res.json({
        code: 0,
        message: "验证码发送成功",
      });
    } catch (error) {
      console.error("发送验证码失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 一键获取本机号码并登录
  async autoLogin(req, res) {
    try {
      const { authResult } = req.body;

      if (!authResult) {
        return res.status(400).json({
          code: 400,
          message: "参数错误，缺少认证信息",
        });
      }

      // 在实际项目中，需要调用一键登录SDK供应商的API来解析authResult获取手机号
      // 这里以中国移动/联通/电信的认证为例，需要添加相应的SDK
      let phone;

      try {
        // 生产环境，调用SDK解析手机号
        if (process.env.NODE_ENV === "production") {
          // 假装尝试引入服务
          let UniverifyService;
          try {
            UniverifyService = require("../services/univerifyService");
            const result = await UniverifyService.getPhoneNumber(authResult);
            phone = result.phone;
          } catch (serviceError) {
            console.warn(
              "警告: 无法加载 univerifyService，使用开发模式替代",
              serviceError
            );
            // 使用开发环境的手机号
            phone = "13800138000";
          }

          if (!phone) {
            throw new Error("获取手机号失败");
          }
        } else {
          // 开发环境使用模拟手机号
          phone = "13800138000";
          console.log("[开发环境] 使用模拟手机号:", phone);
        }
      } catch (error) {
        console.error("解析手机号失败:", error);
        // 开发环境下仍继续使用模拟号码
        if (process.env.NODE_ENV !== "production") {
          console.log("[开发环境] 尝试使用模拟手机号继续登录");
          phone = "13800138000";
        } else {
          return res.status(500).json({
            code: 500,
            message: "解析手机号失败，请尝试其他登录方式",
          });
        }
      }

      // 查找或创建用户
      let user = await User.findOne({ where: { phone } });

      if (!user) {
        // 用户不存在，创建新用户
        user = await User.create({
          phone,
          nickname: `用户${phone.substring(7)}`,
          status: "active",
          openid: `phone_${phone}`, // 为自动登录用户生成基于手机号的openid
        });
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          phone: user.phone,
        },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({
        code: 0,
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            phone: user.phone,
            avatar: user.avatar,
          },
        },
        message: "自动登录成功",
      });
    } catch (error) {
      console.error("自动登录失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 开发环境模拟登录（仅开发环境使用）
  async devLogin(req, res) {
    // 仅在开发环境可用
    console.log("Current NODE_ENV:", process.env.NODE_ENV);

    // 允许在未设置NODE_ENV或为development时访问
    if (
      process.env.NODE_ENV !== "development" &&
      process.env.NODE_ENV !== undefined
    ) {
      return res.status(403).json({
        code: 403,
        message: "此接口仅限开发环境使用",
      });
    }

    try {
      const { deviceId } = req.body;
      console.log("DevLogin request with deviceId:", deviceId);

      if (!deviceId) {
        return res.status(400).json({
          code: 400,
          message: "缺少设备标识",
        });
      }

      // 使用模拟手机号
      const phone = "13800138000";

      // 查找或创建用户
      let user = await User.findOne({ where: { phone } });

      if (!user) {
        user = await User.create({
          phone,
          nickname: `测试用户`,
          status: "active",
          openid: `dev_${deviceId}`,
        });
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          phone: user.phone,
        },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({
        code: 0,
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            phone: user.phone,
            avatar: user.avatar || "",
          },
        },
        message: "开发环境登录成功",
      });
    } catch (error) {
      console.error("开发环境登录失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 手机号登录
  async phoneLogin(req, res) {
    try {
      const { phone, verifyCode } = req.body;

      // 验证手机号格式
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          message: "请输入正确的手机号",
        });
      }

      // 验证验证码格式
      if (!verifyCode || verifyCode.length !== 6) {
        return res.status(400).json({
          code: 400,
          message: "请输入正确的验证码",
        });
      }

      // 验证验证码 (开发环境使用123456)
      let isValid = false;
      if (process.env.NODE_ENV !== "production" && verifyCode === "123456") {
        isValid = true;
      } else {
        // 获取存储的验证码
        const storedVerifyCode = verifyCodeStore[phone];
        if (
          storedVerifyCode &&
          storedVerifyCode.code === verifyCode &&
          storedVerifyCode.expireAt > Date.now()
        ) {
          isValid = true;
          // 验证成功后删除存储的验证码
          delete verifyCodeStore[phone];
        }
      }

      if (!isValid) {
        return res.status(400).json({
          code: 400,
          message: "验证码错误或已过期",
        });
      }

      // 查找或创建用户
      let user = await User.findOne({ where: { phone } });

      if (!user) {
        // 如果用户不存在，自动创建新用户
        user = await User.create({
          phone,
          nickname: `用户${phone.substr(7)}`,
          status: "active",
          openid: `phone_${phone}`, // 为手机登录用户生成一个基于手机号的openid
        });
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          phone: user.phone,
        },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({
        code: 0,
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            phone: user.phone,
            avatar: user.avatar,
          },
        },
        message: "登录成功",
      });
    } catch (error) {
      console.error("手机登录失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 账号密码登录
  async login(req, res) {
    try {
      const { username, password, phone, verifyCode } = req.body;

      // 支持手机号验证码登录
      if (phone && verifyCode) {
        // 直接在这里处理手机验证码登录，而不是调用this.phoneLogin

        // 验证手机号和验证码
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
          return res.status(400).json({
            code: 400,
            message: "请输入正确的手机号",
          });
        }

        if (!verifyCode || verifyCode.length !== 6) {
          return res.status(400).json({
            code: 400,
            message: "请输入正确的验证码",
          });
        }

        // 验证验证码(开发环境跳过，使用123456)
        const storedVerifyCode = verifyCodeStore[phone];
        if (process.env.NODE_ENV === "production") {
          if (
            !storedVerifyCode ||
            storedVerifyCode.code !== verifyCode ||
            storedVerifyCode.expireAt < Date.now()
          ) {
            return res.status(400).json({
              code: 400,
              message: "验证码错误或已过期",
            });
          }
        } else if (verifyCode !== "123456") {
          return res.status(400).json({
            code: 400,
            message: "验证码错误",
          });
        }

        // 验证通过后删除存储的验证码
        delete verifyCodeStore[phone];

        // 查找或创建用户
        let user = await User.findOne({ where: { phone } });

        if (!user) {
          // 如果用户不存在，自动创建新用户
          user = await User.create({
            phone,
            nickname: `用户${phone.substr(7)}`,
            status: "active",
            openid: `phone_${phone}`, // 为手机登录用户生成一个基于手机号的openid
          });
        }

        // 生成JWT token
        const token = jwt.sign(
          { id: user.id, phone: user.phone },
          config.jwtSecret,
          { expiresIn: "7d" }
        );

        return res.json({
          code: 0,
          data: {
            token,
            userInfo: {
              id: user.id,
              nickname: user.nickname,
              phone: user.phone,
              avatar: user.avatar,
            },
          },
          message: "登录成功",
        });
      }

      // 验证参数
      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: "用户名和密码不能为空",
        });
      }

      // 查找用户
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { phone: username }],
        },
      });

      if (!user) {
        return res.status(401).json({
          code: 401,
          message: "用户名或密码错误",
        });
      }

      // 验证密码
      // 实际项目中应该使用bcrypt等库进行密码加密和比对
      if (password !== user.password) {
        return res.status(401).json({
          code: 401,
          message: "用户名或密码错误",
        });
      }

      // 生成JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({
        code: 0,
        data: {
          token,
          userInfo: {
            id: user.id,
            nickname: user.nickname,
            username: user.username,
            avatar: user.avatar,
          },
        },
        message: "登录成功",
      });
    } catch (error) {
      console.error("登录失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 更新用户设置
  async updateSettings(req, res) {
    try {
      const { settings } = req.body;
      const userId = req.user.id;

      if (!settings) {
        return res.status(400).json({
          code: 400,
          message: "设置内容不能为空",
        });
      }

      // 更新用户设置
      await User.update(
        { settings: JSON.stringify(settings) },
        { where: { id: userId } }
      );

      return res.json({
        code: 0,
        message: "设置更新成功",
      });
    } catch (error) {
      console.error("更新设置失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 获取用户信息
  async getUserInfo(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: [
          "id",
          "nickname",
          "avatar",
          "phone",
          "totalQuestions",
          "correctCount",
          "streak",
        ],
      });

      if (!user) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在",
        });
      }

      return res.json({
        code: 0,
        data: user,
        message: "获取用户信息成功",
      });
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 更新用户信息
  async updateUserInfo(req, res) {
    try {
      const userId = req.user.id;
      const { nickname, avatar } = req.body;

      await User.update({ nickname, avatar }, { where: { id: userId } });

      return res.json({
        code: 0,
        message: "更新用户信息成功",
      });
    } catch (error) {
      console.error("更新用户信息失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 获取用户统计数据
  async getUserStatistics(req, res) {
    try {
      const userId = req.user.id;

      const statistics = await UserStatistics.findAll({
        where: { userId },
        include: [
          {
            model: Subject,
            attributes: ["id", "name", "code"],
          },
        ],
      });

      if (!statistics || statistics.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "未找到用户统计数据",
        });
      }

      return res.json({
        code: 0,
        data: statistics,
        message: "获取用户统计数据成功",
      });
    } catch (error) {
      console.error("获取用户统计数据错误:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 获取用户特定科目的统计数据
  async getUserStatisticsBySubject(req, res) {
    try {
      const userId = req.user.id;
      const { subjectId } = req.params;

      if (!subjectId) {
        return res.status(400).json({
          code: 400,
          message: "科目ID不能为空",
        });
      }

      const statistics = await UserStatistics.findOne({
        where: {
          userId,
          subjectId,
        },
        include: [
          {
            model: Subject,
            attributes: ["id", "name", "code"],
          },
        ],
      });

      if (!statistics) {
        return res.status(404).json({
          code: 404,
          message: "未找到该科目的用户统计数据",
        });
      }

      return res.json({
        code: 0,
        data: statistics,
        message: "获取用户科目统计数据成功",
      });
    } catch (error) {
      console.error("获取用户科目统计数据错误:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 更新用户统计数据
  async updateUserStatistics(req, res) {
    try {
      const userId = req.user.id;
      const { subjectId, questionCount, correctCount, timeSpent } = req.body;

      if (!subjectId) {
        return res.status(400).json({
          code: 400,
          message: "科目ID不能为空",
        });
      }

      // 检查科目是否存在
      const subject = await Subject.findByPk(subjectId);
      if (!subject) {
        return res.status(404).json({
          code: 404,
          message: "科目不存在",
        });
      }

      // 查找或创建用户统计数据
      const [statistics, created] = await UserStatistics.findOrCreate({
        where: { userId, subjectId },
        defaults: {
          questionCount: questionCount || 0,
          correctCount: correctCount || 0,
          timeSpent: timeSpent || 0,
          lastPracticeAt: new Date(),
        },
      });

      // 如果记录已存在，则更新
      if (!created) {
        await statistics.update({
          questionCount: statistics.questionCount + (questionCount || 0),
          correctCount: statistics.correctCount + (correctCount || 0),
          timeSpent: statistics.timeSpent + (timeSpent || 0),
          lastPracticeAt: new Date(),
        });
      }

      // 同时更新用户总体统计
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({
          totalQuestions: user.totalQuestions + (questionCount || 0),
          correctCount: user.correctCount + (correctCount || 0),
          studyTime: user.studyTime + (timeSpent || 0),
        });
      }

      return res.json({
        code: 0,
        data: statistics,
        message: "更新用户统计数据成功",
      });
    } catch (error) {
      console.error("更新用户统计数据错误:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }

  // 生成用户令牌
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        phone: user.phone,
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    );
  }

  // 发送验证码
  async sendCode(req, res) {
    try {
      const { phone } = req.body;

      // 验证手机号格式
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          message: "请输入正确的手机号",
        });
      }

      // 生成随机6位验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 存储验证码，设置10分钟过期时间
      verifyCodeStore[phone] = {
        code,
        expireAt: Date.now() + 10 * 60 * 1000,
      };

      // 开发环境下不实际发送短信，仅打印到控制台
      if (process.env.NODE_ENV !== "production") {
        console.log(`[开发环境] 发送验证码到 ${phone}: ${code}`);
        return res.json({
          code: 0,
          message: "验证码发送成功，请查看控制台输出",
        });
      }

      // 生产环境下调用短信服务发送验证码
      // 这里应该调用实际的短信服务，以下代码仅为示例
      try {
        // 实际项目中应该使用配置的短信服务商API
        // await smsService.send(phone, `您的验证码是：${code}，有效期10分钟，请勿泄露给他人。`);
        console.log(`[生产环境] 发送验证码到 ${phone}: ${code}`);

        return res.json({
          code: 0,
          message: "验证码发送成功",
        });
      } catch (smsError) {
        console.error("短信发送失败:", smsError);
        return res.status(500).json({
          code: 500,
          message: "验证码发送失败，请稍后重试",
        });
      }
    } catch (error) {
      console.error("发送验证码失败:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误，请稍后再试",
      });
    }
  }
}

module.exports = new UserController();
