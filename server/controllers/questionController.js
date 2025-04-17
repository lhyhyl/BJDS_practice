const {
  Question,
  UserQuestion,
  Subject,
  StudyPlan,
} = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

class QuestionController {
  // 获取题目列表
  async getQuestions(req, res) {
    try {
      const { mode, subjectId, page = 1, pageSize = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      const where = {};
      if (subjectId) {
        where.subjectId = subjectId;
      }

      let order = [];
      if (mode === "random") {
        order = [sequelize.fn("RAND")];
      } else {
        order = [["id", "ASC"]];
      }

      const { count, rows } = await Question.findAndCountAll({
        where,
        order,
        limit,
        offset,
        include: [
          {
            model: Subject,
            attributes: ["name"],
          },
        ],
      });

      let questions = rows.map((question) => question.toJSON());

      // 如果用户已登录，获取用户答题记录
      if (req.user) {
        const userId = req.user.id;
        // 获取用户答题记录
        const userQuestions = await UserQuestion.findAll({
          where: {
            userId,
            questionId: {
              [Op.in]: rows.map((q) => q.id),
            },
          },
        });

        questions = rows.map((question) => {
          const userQuestion = userQuestions.find(
            (uq) => uq.questionId === question.id
          );
          return {
            ...question.toJSON(),
            userAnswer: userQuestion?.answer,
            isCorrect: userQuestion?.isCorrect,
          };
        });
      }

      res.json({
        code: 0,
        data: {
          total: count,
          list: questions,
          hasMore: offset + rows.length < count,
        },
      });
    } catch (error) {
      console.error("Get questions error:", error);
      res.status(500).json({ code: 500, message: "获取题目列表失败" });
    }
  }

  // 获取单个题目
  async getQuestion(req, res) {
    try {
      const { id } = req.params;

      const question = await Question.findByPk(id, {
        include: [
          {
            model: Subject,
            attributes: ["name"],
          },
        ],
      });

      if (!question) {
        return res.status(404).json({ code: 404, message: "题目不存在" });
      }

      let result = question.toJSON();

      // 如果用户已登录，获取用户答题记录
      if (req.user) {
        const userId = req.user.id;
        // 获取用户答题记录
        const userQuestion = await UserQuestion.findOne({
          where: {
            userId,
            questionId: id,
          },
        });

        if (userQuestion) {
          result = {
            ...result,
            userAnswer: userQuestion.answer,
            isCorrect: userQuestion.isCorrect,
          };
        }
      }

      res.json({
        code: 0, // 修改为前端期望的返回码
        data: result,
      });
    } catch (error) {
      console.error("Get question error:", error);
      res.status(500).json({ code: 500, message: "获取题目详情失败" });
    }
  }

  // 提交答案
  async submitAnswer(req, res) {
    try {
      const { questionId, answer, timeSpent = 0 } = req.body;

      if (!questionId) {
        return res.status(400).json({ code: 400, message: "缺少题目ID" });
      }

      if (!req.user) {
        return res.status(401).json({ code: 401, message: "请先登录" });
      }

      const userId = req.user.id;

      const question = await Question.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ code: 404, message: "题目不存在" });
      }

      const isCorrect = answer === question.answer;

      // 查找是否已存在答题记录
      let userQuestion = await UserQuestion.findOne({
        where: {
          userId,
          questionId,
        },
      });

      if (userQuestion) {
        // 更新现有记录
        await userQuestion.update({
          answer,
          isCorrect,
          timeSpent: userQuestion.timeSpent + (timeSpent || 0),
          lastPracticeAt: new Date(),
        });
      } else {
        // 创建新记录
        userQuestion = await UserQuestion.create({
          userId,
          questionId,
          answer,
          isCorrect,
          timeSpent: timeSpent || 0,
          lastPracticeAt: new Date(),
        });
      }

      // 如果答错，自动添加到错题本
      if (!isCorrect) {
        try {
          const ErrorBook = require("../models/errorBook");
          // 检查是否已存在于错题本
          const existingError = await ErrorBook.findOne({
            where: { userId, questionId },
          });

          // 不存在则添加
          if (!existingError) {
            await ErrorBook.create({
              userId,
              questionId,
            });
            console.log(
              `题目 ${questionId} 已自动添加到用户 ${userId} 的错题本`
            );
          }
        } catch (errorBookError) {
          console.error("添加到错题本失败:", errorBookError);
          // 不中断主流程
        }
      }

      // 尝试更新用户统计
      try {
        if (req.user.update) {
          const totalQuestions = (req.user.totalQuestions || 0) + 1;
          const correctCount = isCorrect
            ? (req.user.correctCount || 0) + 1
            : req.user.correctCount || 0;
          const correctRate = Math.round((correctCount / totalQuestions) * 100);

          await req.user.update({
            totalQuestions,
            correctCount,
            correctRate,
            studyTime: (req.user.studyTime || 0) + (timeSpent || 0),
            lastStudyTime: new Date(),
          });
        }
      } catch (updateError) {
        console.error("Update user statistics error:", updateError);
        // 不中断流程，继续返回答题结果
      }

      res.json({
        code: 0,
        data: {
          isCorrect,
          correctAnswer: question.answer,
          analysis: question.analysis,
          statistics: {
            totalQuestions: req.user.totalQuestions || 0,
            correctCount: req.user.correctCount || 0,
            correctRate: req.user.correctRate || 0,
          },
          addedToErrorBook: !isCorrect, // 通知前端错题已自动添加
        },
      });
    } catch (error) {
      console.error("Submit answer error:", error);
      res.status(500).json({ code: 500, message: "提交答案失败" });
    }
  }

  // 获取每日一题
  async getDailyQuestion(req, res) {
    try {
      // 使用当天日期作为随机种子，确保当天所有用户看到同一道题
      const today = new Date();
      const dateString = `${today.getFullYear()}-${
        today.getMonth() + 1
      }-${today.getDate()}`;

      // 简单的哈希函数，将日期字符串转为数字
      const seed = Array.from(dateString).reduce(
        (acc, char) => acc + char.charCodeAt(0),
        0
      );

      // 获取题目总数
      const count = await Question.count();

      // 使用日期种子计算今天的题目索引
      const dailyIndex = seed % count;

      // 获取对应索引的题目
      const questions = await Question.findAll({
        limit: 1,
        offset: dailyIndex,
        include: [
          {
            model: Subject,
            attributes: ["name"],
          },
        ],
      });

      if (!questions || questions.length === 0) {
        return res.status(404).json({ code: 404, message: "未能获取每日一题" });
      }

      const dailyQuestion = questions[0];

      let result = dailyQuestion.toJSON();
      result.isDaily = true;

      // 如果用户已登录，获取用户答题记录
      if (req.user) {
        const userId = req.user.id;

        const userQuestion = await UserQuestion.findOne({
          where: {
            userId,
            questionId: dailyQuestion.id,
          },
        });

        if (userQuestion) {
          result.userAnswer = userQuestion.answer;
          result.isCorrect = userQuestion.isCorrect;
        }
      }

      res.json({
        code: 0,
        data: result,
      });
    } catch (error) {
      console.error("Get daily question error:", error);
      res.status(500).json({ code: 500, message: "获取每日一题失败" });
    }
  }

  // 搜索题目
  async searchQuestions(req, res) {
    try {
      const { keyword } = req.query;
      if (!keyword) {
        return res
          .status(400)
          .json({ code: 400, message: "搜索关键词不能为空" });
      }

      const questions = await Question.findAll({
        where: {
          [Op.or]: [
            { content: { [Op.like]: `%${keyword}%` } },
            { analysis: { [Op.like]: `%${keyword}%` } },
          ],
        },
        limit: 20,
        include: [
          {
            model: Subject,
            attributes: ["name"],
          },
        ],
      });

      res.json({
        code: 0,
        data: questions,
      });
    } catch (error) {
      console.error("Search questions error:", error);
      res.status(500).json({ code: 500, message: "搜索题目失败" });
    }
  }

  // 获取每日推荐题目
  async getDailyQuestions(req, res) {
    try {
      const { count = 10 } = req.query;
      const limit = parseInt(count) || 10;

      // 根据当天日期生成一个随机种子，保证每天推荐不同的题目，但一天内保持相同
      const today = new Date();
      const seed = `${today.getFullYear()}${
        today.getMonth() + 1
      }${today.getDate()}`;

      const questions = await Question.findAll({
        order: sequelize.literal(`RAND(${parseInt(seed.substring(0, 8))})`),
        limit,
        include: [
          {
            model: Subject,
            attributes: ["name"],
          },
        ],
      });

      res.json({
        code: 0,
        data: questions,
      });
    } catch (error) {
      console.error("Get daily questions error:", error);
      res.status(500).json({ code: 500, message: "获取每日推荐题目失败" });
    }
  }

  // 根据学习计划获取题目
  async getPlanQuestions(req, res) {
    try {
      const userId = req.user.id;
      const { planId } = req.query;

      if (!planId) {
        return res.status(400).json({
          code: 400,
          message: "计划ID不能为空",
        });
      }

      // 查找计划
      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
      });

      if (!plan) {
        return res.status(404).json({
          code: 404,
          message: "计划不存在",
        });
      }

      // 获取该分类下的题目，数量为计划的每日题目数
      const questions = await Question.findAll({
        where: {
          subjectId: plan.categoryId,
        },
        order: sequelize.literal("RAND()"),
        limit: plan.questionsPerDay,
      });

      return res.json({
        code: 0,
        data: questions,
        message: "获取计划题目成功",
      });
    } catch (error) {
      console.error("获取计划题目失败:", error);
      return res.status(500).json({
        code: 500,
        message: "获取计划题目失败",
      });
    }
  }
}

module.exports = new QuestionController();
