const { UserQuestion, Question, Subject, User } = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

class StatisticsController {
  // 获取学习统计
  async getStatistics(req, res) {
    try {
      const userId = req.user.id;
      const user = req.user;

      let subjectStats = [];
      let dailyStats = [];

      try {
        // 获取科目统计
        subjectStats = await UserQuestion.findAll({
          attributes: [
            "Question.subjectId",
            [
              sequelize.fn("COUNT", sequelize.col("UserQuestion.id")),
              "questionCount",
            ],
            [
              sequelize.fn(
                "SUM",
                sequelize.literal("CASE WHEN isCorrect THEN 1 ELSE 0 END")
              ),
              "correctCount",
            ],
          ],
          where: { userId },
          include: [
            {
              model: Question,
              attributes: [],
              include: [
                {
                  model: Subject,
                  attributes: ["name"],
                },
              ],
            },
          ],
          group: ["Question.subjectId"],
          raw: true,
        });

        // 获取每日统计
        dailyStats = await UserQuestion.findAll({
          attributes: [
            [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
            [sequelize.fn("COUNT", sequelize.col("id")), "questionCount"],
            [
              sequelize.fn(
                "SUM",
                sequelize.literal("CASE WHEN isCorrect THEN 1 ELSE 0 END")
              ),
              "correctCount",
            ],
          ],
          where: {
            userId,
            createdAt: {
              [Op.gte]: sequelize.literal(
                "DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
              ),
            },
          },
          group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
          order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]],
          raw: true,
        });
      } catch (error) {
        // 如果表不存在，则返回空数据
        if (
          error.name === "SequelizeDatabaseError" &&
          error.parent &&
          error.parent.code === "ER_NO_SUCH_TABLE"
        ) {
          console.warn("学习统计表不存在，返回空数据");
          subjectStats = [];
          dailyStats = [];
        } else {
          // 如果是其他错误，则抛出
          throw error;
        }
      }

      return res.json({
        code: 0,
        data: {
          totalQuestions: user.totalQuestions || 0,
          totalTime: user.studyTime || 0,
          correctRate: user.correctRate || 0,
          subjectStats: subjectStats.map((stat) => ({
            subjectId: stat["Question.subjectId"],
            subjectName: stat["Question.Subject.name"],
            questionCount: parseInt(stat.questionCount || 0),
            correctRate:
              parseInt(stat.questionCount) > 0
                ? (parseInt(stat.correctCount || 0) /
                    parseInt(stat.questionCount)) *
                  100
                : 0,
          })),
          dailyStats: dailyStats.map((stat) => ({
            date: stat.date,
            questionCount: parseInt(stat.questionCount || 0),
            correctCount: parseInt(stat.correctCount || 0),
          })),
        },
        message: "获取统计信息成功",
      });
    } catch (error) {
      console.error("Get statistics error:", error);
      return res.status(500).json({
        code: 500,
        message: "获取统计信息失败",
      });
    }
  }

  // 获取科目统计
  async getSubjectStatistics(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params; // 科目ID

      if (!id) {
        return res.status(400).json({ code: 400, message: "科目ID不能为空" });
      }

      // 验证科目是否存在
      const subject = await Subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({ code: 404, message: "科目不存在" });
      }

      let stats = [{ totalQuestions: 0, correctCount: 0, averageTime: 0 }];
      let recentRecords = [];

      try {
        // 获取该科目的统计数据
        stats = await UserQuestion.findAll({
          attributes: [
            [
              sequelize.fn("COUNT", sequelize.col("UserQuestion.id")),
              "totalQuestions",
            ],
            [
              sequelize.fn(
                "SUM",
                sequelize.literal("CASE WHEN isCorrect THEN 1 ELSE 0 END")
              ),
              "correctCount",
            ],
            [sequelize.fn("AVG", sequelize.col("timeSpent")), "averageTime"],
          ],
          where: {
            userId,
            "$Question.subjectId$": id,
          },
          include: [
            {
              model: Question,
              attributes: [],
              where: { subjectId: id },
            },
          ],
          raw: true,
        });

        // 获取最近做题记录
        recentRecords = await UserQuestion.findAll({
          where: {
            userId,
            "$Question.subjectId$": id,
          },
          include: [
            {
              model: Question,
              attributes: ["id", "content", "options", "answer"],
              where: { subjectId: id },
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 5,
        });
      } catch (error) {
        // 如果表不存在，则返回空数据
        if (
          error.name === "SequelizeDatabaseError" &&
          error.parent &&
          error.parent.code === "ER_NO_SUCH_TABLE"
        ) {
          console.warn("学习统计表不存在，返回空数据");
          stats = [{ totalQuestions: 0, correctCount: 0, averageTime: 0 }];
          recentRecords = [];
        } else {
          // 如果是其他错误，则抛出
          throw error;
        }
      }

      const totalQuestions = parseInt(stats[0]?.totalQuestions || 0);
      const correctCount = parseInt(stats[0]?.correctCount || 0);

      return res.json({
        code: 0,
        data: {
          subject: subject.name,
          totalQuestions,
          correctCount,
          correctRate:
            totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0,
          averageTime: parseFloat(stats[0]?.averageTime || 0).toFixed(2),
          recentRecords: recentRecords.map((record) => ({
            id: record.id,
            questionId: record.questionId,
            question: record.Question.content,
            answer: record.answer,
            isCorrect: record.isCorrect,
            time: record.timeSpent,
            date: record.createdAt,
          })),
        },
        message: "获取科目统计信息成功",
      });
    } catch (error) {
      console.error("Get subject statistics error:", error);
      return res
        .status(500)
        .json({ code: 500, message: "获取科目统计信息失败" });
    }
  }

  // 获取学习进度
  async getProgress(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ code: 401, message: "请先登录" });
      }

      const userId = req.user.id;

      // 获取所有科目
      const subjects = await Subject.findAll({
        attributes: ["id", "name"],
      });

      let userQuestions = [];
      let questionCounts = [];

      try {
        // 获取用户答题记录
        userQuestions = await UserQuestion.findAll({
          where: {
            userId,
          },
          include: [
            {
              model: Question,
              attributes: ["subjectId"],
            },
          ],
        });

        // 获取每个科目的总题目数
        questionCounts = await Question.findAll({
          attributes: [
            "subjectId",
            [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          ],
          group: ["subjectId"],
          raw: true,
        });
      } catch (error) {
        // 如果表不存在，则使用空数据
        if (
          error.name === "SequelizeDatabaseError" &&
          error.parent &&
          error.parent.code === "ER_NO_SUCH_TABLE"
        ) {
          console.warn("学习统计表不存在，返回空数据");
          userQuestions = [];
          questionCounts = [];
        } else {
          // 如果是其他错误，则抛出
          throw error;
        }
      }

      // 创建总题目数映射
      const totalQuestionsMap = {};
      questionCounts.forEach((item) => {
        totalQuestionsMap[item.subjectId] = parseInt(item.count);
      });

      // 计算每个科目的进度
      const progressMap = {};
      subjects.forEach((subject) => {
        const subjectId = subject.id;
        // 获取该科目的答题记录
        const answeredQuestions = userQuestions.filter(
          (uq) => uq.Question?.subjectId === subjectId
        );
        // 计算进度
        const total = totalQuestionsMap[subjectId] || 0;
        const answered = answeredQuestions.length;
        progressMap[subjectId] = {
          id: subjectId,
          name: subject.name,
          total,
          answered,
          progress: total > 0 ? Math.round((answered / total) * 100) : 0,
        };
      });

      // 转为数组
      const progressData = Object.values(progressMap);

      return res.json({
        code: 0,
        data: progressData,
        message: "获取学习进度成功",
      });
    } catch (error) {
      console.error("Get progress error:", error);
      return res.status(500).json({ code: 500, message: "获取学习进度失败" });
    }
  }

  // 获取用户每日统计和连续打卡信息
  async getDailyStatistics(req, res) {
    try {
      const userId = req.user.id;

      // 获取用户
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在",
        });
      }

      // 获取最近7天的日期
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      // 获取最近7天的做题记录
      const dailyStats = await UserQuestion.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          userId,
          createdAt: {
            [Op.gte]: new Date(dates[0]),
          },
        },
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        raw: true,
      });

      // 格式化数据
      const formattedStats = dates.map((date) => {
        const stat = dailyStats.find((s) => s.date === date);
        return {
          date,
          count: stat ? parseInt(stat.count) : 0,
          isToday: date === new Date().toISOString().split("T")[0],
        };
      });

      return res.json({
        code: 0,
        data: {
          dailyStats: formattedStats,
          streak: user.streak || 0,
          todayCount: formattedStats[6].count, // 今日题目数
        },
        message: "获取每日统计成功",
      });
    } catch (error) {
      console.error("获取每日统计失败:", error);
      return res.status(500).json({
        code: 500,
        message: "获取每日统计失败",
      });
    }
  }

  // 更新连续打卡天数
  async updateStreak(req, res) {
    try {
      const userId = req.user.id;

      // 获取用户
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: "用户不存在",
        });
      }

      // 获取用户最后一次做题的日期
      const lastRecord = await UserQuestion.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });

      if (!lastRecord) {
        // 没有做题记录，设置为1天
        user.streak = 1;
      } else {
        // 计算最后一次做题日期与今天的差距
        const lastDate = new Date(lastRecord.createdAt);
        lastDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // 连续做题
          user.streak = (user.streak || 0) + 1;
        } else if (diffDays > 1) {
          // 中断，重新计算
          user.streak = 1;
        }
        // 如果是同一天，不变
      }

      await user.save();

      return res.json({
        code: 0,
        data: {
          streak: user.streak,
        },
        message: "更新连续打卡成功",
      });
    } catch (error) {
      console.error("更新连续打卡失败:", error);
      return res.status(500).json({
        code: 500,
        message: "更新连续打卡失败",
      });
    }
  }
}

module.exports = new StatisticsController();
