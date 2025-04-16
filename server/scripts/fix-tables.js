const { sequelize } = require("../config/database");

async function createTables() {
  try {
    console.log("检查数据库连接...");
    await sequelize.authenticate();
    console.log("数据库连接成功");

    // 创建userQuestions表
    console.log("检查或创建 userQuestions 表...");
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS userQuestions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL COMMENT '用户ID',
        questionId INT NOT NULL COMMENT '题目ID',
        answer TEXT COMMENT '用户答案',
        isCorrect BOOLEAN DEFAULT FALSE COMMENT '是否正确',
        isWrong BOOLEAN DEFAULT FALSE COMMENT '是否错题',
        timeSpent INT DEFAULT 0 COMMENT '答题用时(秒)',
        lastPracticeAt TIMESTAMP COMMENT '最后练习时间',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户题目记录表'
    `);
    console.log("userQuestions 表已创建或已存在");

    console.log("所有表已检查完毕");
  } catch (error) {
    console.error("创建表时出错:", error);
  } finally {
    // 关闭连接
    try {
      await sequelize.close();
      console.log("数据库连接已关闭");
    } catch (err) {
      console.error("关闭数据库连接时发生错误:", err);
    }
  }
}

createTables();
