const { Favorite, Question } = require("../models");
const logger = require("../utils/logger");

/**
 * 获取用户收藏的问题列表
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Question,
          attributes: [
            "id",
            "content",
            "options",
            "answer",
            "analysis",
            "subjectId",
            "difficulty",
          ],
        },
      ],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return res.json({
      success: true,
      data: {
        total: count,
        items: rows,
        page,
        pageSize,
      },
    });
  } catch (error) {
    logger.error("获取收藏问题失败:", error);
    return res
      .status(500)
      .json({ success: false, message: "获取收藏问题失败" });
  }
};

/**
 * 添加问题到收藏夹
 */
exports.addFavorite = async (req, res) => {
  try {
    const { questionId } = req.body;
    const userId = req.user.id;

    if (!questionId) {
      return res
        .status(400)
        .json({ success: false, message: "问题ID不能为空" });
    }

    // 检查问题是否存在
    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "问题不存在" });
    }

    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { userId, questionId },
    });

    if (existingFavorite) {
      return res
        .status(400)
        .json({ success: false, message: "该问题已在收藏夹中" });
    }

    // 创建收藏记录
    await Favorite.create({ userId, questionId });

    return res.json({ success: true, message: "收藏成功" });
  } catch (error) {
    logger.error("添加收藏失败:", error);
    return res.status(500).json({ success: false, message: "添加收藏失败" });
  }
};

/**
 * 从收藏夹中删除问题
 */
exports.deleteFavorite = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const result = await Favorite.destroy({
      where: { userId, questionId },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ success: false, message: "收藏记录不存在" });
    }

    return res.json({ success: true, message: "取消收藏成功" });
  } catch (error) {
    logger.error("删除收藏失败:", error);
    return res.status(500).json({ success: false, message: "删除收藏失败" });
  }
};
