const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserQuestion = sequelize.define(
  "UserQuestion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isWrong: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastPracticeAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "userQuestions",
    timestamps: true,
  }
);

module.exports = UserQuestion; 