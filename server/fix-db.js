const mysql = require("mysql2/promise");
require("dotenv").config();

const run = async () => {
  // 创建单独的连接，不使用连接池
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "brushing_question",
    port: process.env.DB_PORT,
  });

  try {
    console.log("连接成功，开始检查数据库...");

    // 1. 检查 userQuestions 表是否存在
    console.log("检查 userQuestions 表是否存在...");
    try {
      await connection.query("DESCRIBE userQuestions");
      console.log("userQuestions 表已存在");
    } catch (error) {
      if (error.code === "ER_NO_SUCH_TABLE") {
        console.log("userQuestions 表不存在，创建表...");
        await connection.query(`
          CREATE TABLE userQuestions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            userId INT NOT NULL COMMENT '用户ID',
            questionId INT NOT NULL COMMENT '题目ID',
            answer TEXT COMMENT '用户答案',
            isCorrect BOOLEAN DEFAULT FALSE COMMENT '是否正确',
            isWrong BOOLEAN DEFAULT FALSE COMMENT '是否错题',
            timeSpent INT DEFAULT 0 COMMENT '答题用时(秒)',
            lastPracticeAt TIMESTAMP NULL COMMENT '最后练习时间',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户题目记录表'
        `);
        console.log("userQuestions 表创建成功");
      } else {
        throw error;
      }
    }

    // 2. 检查表字段
    console.log("检查 questions 表结构...");
    const [columns] = await connection.query("DESCRIBE questions");
    console.log("questions 表字段:");

    // 检查是否有 subjectId 字段但没有 subject_id 字段
    let hasSubjectId = false;
    let hasSubject_id = false;

    columns.forEach((col) => {
      console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
      if (col.Field === "subjectId") hasSubjectId = true;
      if (col.Field === "subject_id") hasSubject_id = true;
    });

    // 3. 修复问题
    if (hasSubjectId && !hasSubject_id) {
      console.log(
        "检测到 subjectId 字段，但没有 subject_id 字段，添加 subject_id 字段"
      );
      await connection.query("ALTER TABLE questions ADD COLUMN subject_id INT");
      console.log("复制 subjectId 的值到 subject_id");
      await connection.query("UPDATE questions SET subject_id = subjectId");
      console.log("字段添加并更新完成");
    } else if (!hasSubjectId && !hasSubject_id) {
      console.log(
        "questions 表既没有 subjectId 也没有 subject_id 字段，需要添加"
      );
      await connection.query("ALTER TABLE questions ADD COLUMN subject_id INT");
      console.log("subject_id 字段添加完成");
    } else {
      console.log("questions 表结构正常，无需修复");
    }

    console.log("检查并修复完成");
  } catch (error) {
    console.error("操作失败:", error);
  } finally {
    await connection.end();
    console.log("数据库连接已关闭");
  }
};

run();
