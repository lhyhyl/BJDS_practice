const { UserQuestion, Question, Subject } = require("../models/index");
const { Op } = require("sequelize");

class WrongQuestionController {
  // 获取错题列表
  async getWrongQuestions(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const userId = req.user.id;

      const { count, rows } = await UserQuestion.findAndCountAll({
        where: {
          userId,
          isCorrect: false,
        },
        include: [
          {
            model: Question,
            include: [
              {
                model: Subject,
                attributes: ["name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      const wrongQuestions = rows.map((record) => ({
        id: record.id,
        questionId: record.questionId,
        wrongAnswer: record.answer,
        wrongTime: record.createdAt,
        question: {
          id: record.Question.id,
          content: record.Question.content,
          options: record.Question.options,
          answer: record.Question.answer,
          analysis: record.Question.analysis,
          subject: record.Question.Subject.name,
        },
      }));

      res.json({
        code: 200,
        data: {
          total: count,
          list: wrongQuestions,
        },
      });
    } catch (error) {
      console.error("Get wrong questions error:", error);
      res.status(500).json({ code: 500, message: "获取错题列表失败" });
    }
  }

  // 删除错题
  async deleteWrongQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const record = await UserQuestion.findOne({
        where: {
          id,
          userId,
          isCorrect: false,
        },
      });

      if (!record) {
        return res.status(404).json({ code: 404, message: "错题记录不存在" });
      }

      await record.destroy();

      res.json({
        code: 200,
        message: "删除成功",
      });
    } catch (error) {
      console.error("Delete wrong question error:", error);
      res.status(500).json({ code: 500, message: "删除错题失败" });
    }
  }
}

module.exports = new WrongQuestionController();
