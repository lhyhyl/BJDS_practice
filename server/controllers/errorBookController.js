const ErrorBook = require("../models/errorBook");
const { Question } = require("../models");

// 获取用户错题本列表
exports.getErrorQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;
    
    const { count, rows } = await ErrorBook.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Question,
          attributes: ['id', 'content', 'options', 'answer', 'analysis', 'subjectId', 'difficulty']
        }
      ],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      distinct: true
    });
    
    // 处理数据，提取Question模型数据作为主要数据
    const questions = rows.map(item => {
      const question = item.Question;
      if (!question) return null;
      
      return {
        id: question.id,
        content: question.content,
        options: question.options,
        answer: question.answer,
        analysis: question.analysis,
        subjectId: question.subjectId,
        difficulty: question.difficulty,
        errorBookId: item.id,
        addedAt: item.addedAt
      };
    }).filter(q => q !== null);
    
    res.json({
      code: 0,
      data: {
        total: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        list: questions,
        hasMore: offset + questions.length < count
      },
      message: "获取错题本成功"
    });
  } catch (error) {
    console.error('获取错题本失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取错题本失败', 
      error: error.message 
    });
  }
};

// 添加题目到错题本
exports.addErrorQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ code: 400, message: "题目ID不能为空" });
    }

    // 检查题目是否存在
    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ code: 404, message: "题目不存在" });
    }

    // 检查是否已在错题本中
    const existingEntry = await ErrorBook.findOne({
      where: { userId, questionId },
    });

    if (existingEntry) {
      return res.status(409).json({ code: 409, message: "该题目已在错题本中" });
    }

    // 创建错题记录
    const errorQuestion = await ErrorBook.create({
      userId,
      questionId,
    });

    res.status(201).json({
      code: 0,
      message: "添加到错题本成功",
      data: errorQuestion,
    });
  } catch (error) {
    console.error("添加错题失败:", error);
    res.status(500).json({ code: 500, message: "添加错题失败", error: error.message });
  }
};

// 从错题本删除题目
exports.deleteErrorQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId } = req.params;

    const result = await ErrorBook.destroy({
      where: { userId, questionId },
    });

    if (result === 0) {
      return res.status(404).json({ code: 404, message: "错题不存在或已被删除" });
    }

    res.json({ code: 0, message: "从错题本删除成功" });
  } catch (error) {
    console.error("删除错题失败:", error);
    res.status(500).json({ code: 500, message: "删除错题失败", error: error.message });
  }
};
