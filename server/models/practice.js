const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

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
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "sequential",
    },
  },
  {
    tableName: "practices",
    timestamps: true,
  }
);

module.exports = Practice;
