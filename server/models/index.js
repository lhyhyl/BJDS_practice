const User = require("./user");
const Question = require("./question");
const Practice = require("./practice");
const Subject = require("./subject");
const Chapter = require("./chapter");
const UserQuestion = require("./userQuestion");
const Favorite = require("./favorite");
const StudyRecord = require("./studyRecord");
const ErrorBook = require("./errorBook");
const { sequelize } = require("../config/database");

// 定义模型之间的关系
// User 关联
User.hasMany(Practice, { foreignKey: "userId" });
User.hasMany(UserQuestion, { foreignKey: "userId" });
User.hasMany(Favorite, { foreignKey: "userId" });
User.hasMany(StudyRecord, { foreignKey: "userId" });
User.hasMany(ErrorBook, { foreignKey: "userId" });

// Question 关联
Question.hasMany(Practice, { foreignKey: "questionId" });
Question.hasMany(UserQuestion, { foreignKey: "questionId" });
Question.hasMany(Favorite, { foreignKey: "questionId" });
Question.hasMany(ErrorBook, { foreignKey: "questionId" });
Question.belongsTo(Subject, { foreignKey: "subjectId" });
Question.belongsTo(Chapter, { foreignKey: "chapterId" });

// Subject 关联
Subject.hasMany(Question, { foreignKey: "subjectId" });
Subject.hasMany(Chapter, { foreignKey: "subjectId" });

// Chapter 关联
Chapter.belongsTo(Subject, { foreignKey: "subjectId" });
Chapter.hasMany(Question, { foreignKey: "chapterId" });

// UserQuestion 关联
UserQuestion.belongsTo(User, { foreignKey: "userId" });
UserQuestion.belongsTo(Question, { foreignKey: "questionId" });

// Practice 关联
Practice.belongsTo(User, { foreignKey: "userId" });
Practice.belongsTo(Question, { foreignKey: "questionId" });

// Favorite 关联
Favorite.belongsTo(User, { foreignKey: "userId" });
Favorite.belongsTo(Question, { foreignKey: "questionId" });

// StudyRecord 关联
StudyRecord.belongsTo(User, { foreignKey: "userId" });

// ErrorBook 关联
ErrorBook.belongsTo(User, { foreignKey: "userId" });
ErrorBook.belongsTo(Question, { foreignKey: "questionId" });

module.exports = {
  User,
  Question,
  Practice,
  Subject,
  Chapter,
  UserQuestion,
  Favorite,
  StudyRecord,
  ErrorBook,
  sequelize,
};
