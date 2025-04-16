const { UserQuestion, Question, Subject } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

class StatisticsController {
  // 获取学习统计
  async getStatistics(req, res) {
    try {
      const userId = req.user.id;
      const user = req.user;

      // 获取科目统计
      const subjectStats = await UserQuestion.findAll({
        attributes: [
          'Question.subjectId',
          [sequelize.fn('COUNT', sequelize.col('UserQuestion.id')), 'questionCount'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN isCorrect THEN 1 ELSE 0 END')), 'correctCount']
        ],
        where: { userId },
        include: [{
          model: Question,
          attributes: [],
          include: [{
            model: Subject,
            attributes: ['name']
          }]
        }],
        group: ['Question.subjectId'],
        raw: true
      });

      // 获取每日统计
      const dailyStats = await UserQuestion.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'questionCount'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN isCorrect THEN 1 ELSE 0 END')), 'correctCount']
        ],
        where: {
          userId,
          createdAt: {
            [Op.gte]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 7 DAY)')
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
        raw: true
      });

      res.json({
        code: 200,
        data: {
          totalQuestions: user.totalQuestions,
          totalTime: user.studyTime,
          correctRate: user.correctRate,
          subjectStats: subjectStats.map(stat => ({
            subjectId: stat['Question.subjectId'],
            subjectName: stat['Question.Subject.name'],
            questionCount: parseInt(stat.questionCount),
            correctRate: (parseInt(stat.correctCount) / parseInt(stat.questionCount)) * 100
          })),
          dailyStats: dailyStats.map(stat => ({
            date: stat.date,
            questionCount: parseInt(stat.questionCount),
            correctCount: parseInt(stat.correctCount)
          }))
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ code: 500, message: '获取统计信息失败' });
    }
  }
}

module.exports = new StatisticsController(); 