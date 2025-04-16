const { Question, UserQuestion, Subject } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

class QuestionController {
  // 获取题目列表
  async getQuestions(req, res) {
    try {
      const { mode, subjectId, page = 1, pageSize = 10 } = req.query;
      const userId = req.user.id;

      const where = {};
      if (subjectId) {
        where.subjectId = subjectId;
      }

      let order = [];
      if (mode === 'random') {
        order = [sequelize.fn('RAND')];
      } else {
        order = [['id', 'ASC']];
      }

      const { count, rows } = await Question.findAndCountAll({
        where,
        order,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        include: [{
          model: Subject,
          attributes: ['name']
        }]
      });

      // 获取用户答题记录
      const userQuestions = await UserQuestion.findAll({
        where: {
          userId,
          questionId: {
            [Op.in]: rows.map(q => q.id)
          }
        }
      });

      const questions = rows.map(question => {
        const userQuestion = userQuestions.find(uq => uq.questionId === question.id);
        return {
          ...question.toJSON(),
          userAnswer: userQuestion?.answer,
          isCorrect: userQuestion?.isCorrect
        };
      });

      res.json({
        code: 200,
        data: {
          total: count,
          list: questions
        }
      });
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({ code: 500, message: '获取题目列表失败' });
    }
  }

  // 提交答案
  async submitAnswer(req, res) {
    try {
      const { questionId, answer, timeSpent } = req.body;
      const userId = req.user.id;

      const question = await Question.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ code: 404, message: '题目不存在' });
      }

      const isCorrect = answer === question.answer;
      
      // 记录用户答题
      await UserQuestion.create({
        userId,
        questionId,
        answer,
        isCorrect,
        timeSpent
      });

      // 更新用户统计
      const user = req.user;
      const totalQuestions = user.totalQuestions + 1;
      const correctCount = isCorrect ? user.correctCount + 1 : user.correctCount;
      const correctRate = (correctCount / totalQuestions) * 100;

      await user.update({
        totalQuestions,
        correctCount,
        correctRate,
        studyTime: user.studyTime + timeSpent,
        lastStudyTime: new Date()
      });

      res.json({
        code: 200,
        data: {
          isCorrect,
          correctAnswer: question.answer,
          analysis: question.analysis,
          statistics: {
            totalQuestions,
            correctCount,
            correctRate
          }
        }
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({ code: 500, message: '提交答案失败' });
    }
  }
}

module.exports = new QuestionController();
