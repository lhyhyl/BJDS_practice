const { Subject, Question, Chapter } = require('../models');
const { Op } = require('sequelize');

class SubjectController {
  // 获取科目列表
  async getSubjects(req, res) {
    try {
      const subjects = await Subject.findAll({
        attributes: ['id', 'name', 'icon', 'description'],
        include: [{
          model: Question,
          attributes: [],
          where: { status: 'active' }
        }],
        group: ['Subject.id'],
        attributes: {
          include: [
            [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'questionCount']
          ]
        }
      });

      res.json({
        code: 200,
        data: subjects
      });
    } catch (error) {
      console.error('Get subjects error:', error);
      res.status(500).json({ code: 500, message: '获取科目列表失败' });
    }
  }

  // 获取科目详情
  async getSubjectDetail(req, res) {
    try {
      const { id } = req.params;

      const subject = await Subject.findByPk(id, {
        include: [{
          model: Chapter,
          attributes: ['id', 'name'],
          include: [{
            model: Question,
            attributes: [],
            where: { status: 'active' }
          }],
          group: ['Chapter.id'],
          attributes: {
            include: [
              [sequelize.fn('COUNT', sequelize.col('Questions.id')), 'questionCount']
            ]
          }
        }]
      });

      if (!subject) {
        return res.status(404).json({ code: 404, message: '科目不存在' });
      }

      res.json({
        code: 200,
        data: subject
      });
    } catch (error) {
      console.error('Get subject detail error:', error);
      res.status(500).json({ code: 500, message: '获取科目详情失败' });
    }
  }
}

module.exports = new SubjectController(); 