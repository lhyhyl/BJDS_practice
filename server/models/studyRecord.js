const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StudyRecord = sequelize.define(
  "StudyRecord",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    questionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    correctCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "studyRecords",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "date"],
      },
    ],
  }
);

module.exports = StudyRecord;
