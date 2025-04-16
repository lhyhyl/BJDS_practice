module.exports = (sequelize, DataTypes) => {
  const Wrong = sequelize.define('Wrong', {
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
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '错误次数'
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'questionId']
      }
    ]
  });

  Wrong.associate = (models) => {
    Wrong.belongsTo(models.User, { foreignKey: 'userId' });
    Wrong.belongsTo(models.Question, { foreignKey: 'questionId' });
  };

  return Wrong;
}; 