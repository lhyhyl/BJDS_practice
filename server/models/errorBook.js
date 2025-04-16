const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ErrorBook = sequelize.define(
  "ErrorBook",
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
    lastAnswer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastReviewAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "errorBook",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "questionId"],
      },
    ],
  }
);

module.exports = ErrorBook;
