const { Wrong, Question, Subject } = require('../models');
const logger = require("../utils/logger");
const { Op } = require('sequelize');

/**
 * 获取用户的错题列表
 */
const getWrongQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const result = await Wrong.findAndCountAll({
      where: { userId },
      include: [{
        model: Question,
        attributes: ['id', 'content', 'options', 'answer', 'analysis', 'subjectId']
      }],
      limit: pageSize,
      offset,
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      total: result.count,
      page,
      pageSize,
      data: result.rows.map(wrong => ({
        ...wrong.Question.dataValues,
        wrongCount: wrong.count
      }))
    });
  } catch (error) {
    logger.error('获取错题列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取错题列表失败'
    });
  }
};

/**
 * 添加错题记录
 */
const addWrongQuestion = async (req, res) => {
  try {
    const { questionId } = req.body;
    const userId = req.user.id;

    if (!questionId) {
      return res.status(400).json({
        code: 400,
        message: '问题ID不能为空'
      });
    }

    // 检查该题是否已在错题本中
    const existingWrong = await Wrong.findOne({
      where: { userId, questionId }
    });

    if (existingWrong) {
      // 如果已存在，增加错误次数
      await existingWrong.update({ count: existingWrong.count + 1 });
      return res.json({
        code: 200,
        data: existingWrong,
        message: '错题记录已更新'
      });
    } else {
      // 如果不存在，创建新记录
      const newWrong = await Wrong.create({
        userId,
        questionId
      });
      return res.status(201).json({
        code: 201,
        data: newWrong,
        message: '错题已添加'
      });
    }
  } catch (error) {
    logger.error('添加错题错误:', error);
    res.status(500).json({
      code: 500,
      message: '添加错题失败'
    });
  }
};

/**
 * 从错题本删除问题
 */
const removeWrongQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const result = await Wrong.destroy({
      where: { userId, questionId }
    });

    if (result) {
      res.json({
        code: 200,
        message: '从错题本移除成功'
      });
    } else {
      res.status(404).json({
        code: 404,
        message: '错题记录不存在'
      });
    }
  } catch (error) {
    logger.error('移除错题错误:', error);
    res.status(500).json({
      code: 500,
      message: '删除错题失败'
    });
  }
};

module.exports = {
  getWrongQuestions,
  addWrongQuestion,
  removeWrongQuestion,
};
