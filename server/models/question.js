const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("单选题", "多选题", "判断题", "填空题", "问答题"),
      allowNull: false,
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chapterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    analysis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM("简单", "中等", "困难"),
      defaultValue: "中等",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
    },
  },
  {
    tableName: "questions",
    timestamps: true,
  }
);

module.exports = Question;
