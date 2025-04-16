const { Favorite, Question, Subject } = require('../models');

class FavoriteController {
  // 获取收藏列表
  async getFavorites(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const userId = req.user.id;

      const { count, rows } = await Favorite.findAndCountAll({
        where: { userId },
        include: [{
          model: Question,
          include: [{
            model: Subject,
            attributes: ['name']
          }]
        }],
        order: [['createdAt', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });

      const favorites = rows.map(record => ({
        id: record.id,
        questionId: record.questionId,
        createTime: record.createdAt,
        question: {
          id: record.Question.id,
          content: record.Question.content,
          options: record.Question.options,
          answer: record.Question.answer,
          analysis: record.Question.analysis,
          subject: record.Question.Subject.name
        }
      }));

      res.json({
        code: 200,
        data: {
          total: count,
          list: favorites
        }
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ code: 500, message: '获取收藏列表失败' });
    }
  }

  // 添加收藏
  async addFavorite(req, res) {
    try {
      const { questionId } = req.body;
      const userId = req.user.id;

      const question = await Question.findByPk(questionId);
      if (!question) {
        return res.status(404).json({ code: 404, message: '题目不存在' });
      }

      const [favorite, created] = await Favorite.findOrCreate({
        where: { userId, questionId },
        defaults: { userId, questionId }
      });

      if (!created) {
        return res.status(400).json({ code: 400, message: '已经收藏过该题目' });
      }

      res.json({
        code: 200,
        message: '收藏成功'
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      res.status(500).json({ code: 500, message: '收藏失败' });
    }
  }

  // 取消收藏
  async deleteFavorite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const favorite = await Favorite.findOne({
        where: { id, userId }
      });

      if (!favorite) {
        return res.status(404).json({ code: 404, message: '收藏记录不存在' });
      }

      await favorite.destroy();

      res.json({
        code: 200,
        message: '取消收藏成功'
      });
    } catch (error) {
      console.error('Delete favorite error:', error);
      res.status(500).json({ code: 500, message: '取消收藏失败' });
    }
  }
}

module.exports = new FavoriteController(); 