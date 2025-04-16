const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Practice = sequelize.define(
  "Practice",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "questions",
        key: "id",
      },
    },
    userAnswer: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "practices",
    timestamps: true,
  }
);

module.exports = Practice;
