const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ErrorQuestion = sequelize.define('ErrorQuestion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    }
  }, {
    tableName: 'errorQuestions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'questionId']
      }
    ]
  });

  ErrorQuestion.associate = (models) => {
    ErrorQuestion.belongsTo(models.User, { foreignKey: 'userId' });
    ErrorQuestion.belongsTo(models.Question, { foreignKey: 'questionId' });
  };

  return ErrorQuestion;
}; 