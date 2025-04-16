const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const UserStatistics = sequelize.define(
    "UserStatistics",
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
          model: "Users",
          key: "id",
        },
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Subjects",
          key: "id",
        },
      },
      questionCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      correctCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      timeSpent: {
        type: DataTypes.INTEGER, // 存储秒数
        allowNull: false,
        defaultValue: 0,
      },
      lastPracticeAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "userStatistics",
      timestamps: true,
    }
  );

  UserStatistics.associate = (models) => {
    UserStatistics.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    UserStatistics.belongsTo(models.Subject, {
      foreignKey: "subjectId",
      as: "subject",
    });
  };

  return UserStatistics;
};
