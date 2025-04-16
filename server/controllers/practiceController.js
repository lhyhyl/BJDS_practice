const Question = require("../models/question");
const Practice = require("../models/practice");
const User = require("../models/user");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

exports.getQuestions = async (req, res) => {
  try {
    const { mode, category, limit = 10 } = req.query;
    let query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    let questions;
    switch (mode) {
      case "random":
        questions = await Question.findAll({
          where: query,
          order: sequelize.random(),
          limit: Number(limit),
        });
        break;
      case "wrong":
        const wrongRecords = await Practice.findAll({
          where: {
            userId: req.user.userId,
            isCorrect: false,
          },
          attributes: ["questionId"],
          group: ["questionId"],
        });
        const wrongQuestionIds = wrongRecords.map(
          (record) => record.questionId
        );
        questions = await Question.findAll({
          where: {
            id: { [Op.in]: wrongQuestionIds },
          },
          limit: Number(limit),
        });
        break;
      default:
        questions = await Question.findAll({
          where: query,
          limit: Number(limit),
        });
    }

    res.json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.submitAnswer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { questionId, answer } = req.body;
    const question = await Question.findByPk(questionId);

    const correctAnswers = question.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt.id);

    const isCorrect =
      JSON.stringify(answer.sort()) === JSON.stringify(correctAnswers.sort());

    await Practice.create(
      {
        userId: req.user.userId,
        questionId,
        userAnswer: answer,
        isCorrect,
        timeSpent: req.body.timeSpent,
      },
      { transaction: t }
    );

    await User.increment(
      {
        totalQuestions: 1,
        correctCount: isCorrect ? 1 : 0,
      },
      {
        where: { id: req.user.userId },
        transaction: t,
      }
    );

    await t.commit();

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswers,
        analysis: question.analysis,
      },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
