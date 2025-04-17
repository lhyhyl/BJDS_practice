const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudyPlan = sequelize.define(
    "StudyPlan",
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Subjects",
          key: "id",
        },
      },
      days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7,
      },
      questionsPerDay: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "studyPlans",
      timestamps: true,
    }
  );

  StudyPlan.associate = (models) => {
    StudyPlan.belongsTo(models.User, { foreignKey: "userId" });
    StudyPlan.belongsTo(models.Subject, { foreignKey: "categoryId" });
  };

  return StudyPlan;
};
