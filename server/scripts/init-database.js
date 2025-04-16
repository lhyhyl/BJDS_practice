const { pool } = require("../config/database");

// 添加调试代码
console.log("数据库连接信息:");
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Database: ${process.env.DB_NAME}`);
// 不打印密码，仅检查是否存在
console.log(`Password exists: ${Boolean(process.env.DB_PASSWORD)}`);

async function initDatabase() {
  try {
    // 创建数据库
    await pool.query("CREATE DATABASE IF NOT EXISTS brushing_question");
    await pool.query("USE brushing_question");

    // 创建用户表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(50) UNIQUE NOT NULL COMMENT '微信openid',
        nickname VARCHAR(50) COMMENT '用户昵称',
        avatar VARCHAR(255) COMMENT '头像URL',
        phone VARCHAR(20) COMMENT '手机号码',
        totalQuestions INT DEFAULT 0 COMMENT '总答题数',
        correctCount INT DEFAULT 0 COMMENT '答对题目数',
        streak INT DEFAULT 0 COMMENT '连续学习天数',
        lastLoginAt TIMESTAMP NULL COMMENT '最后登录时间',
        settings JSON COMMENT '用户设置',
        status VARCHAR(20) DEFAULT 'active' COMMENT '用户状态：active, disabled',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_openid (openid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
    `);

    // 创建科目表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL COMMENT '科目名称',
        description TEXT COMMENT '科目描述',
        icon VARCHAR(50) COMMENT '图标',
        color VARCHAR(20) COMMENT '颜色',
        type VARCHAR(50) COMMENT '类型',
        orderIndex INT DEFAULT 0 COMMENT '排序',
        status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active, deleted 等',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_subject_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科目表'
    `);

    // 创建章节表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subjectId INT NOT NULL COMMENT '科目ID',
        name VARCHAR(50) NOT NULL COMMENT '章节名称',
        description TEXT COMMENT '章节描述',
        orderIndex INT DEFAULT 0 COMMENT '排序',
        status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active, deleted 等',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subjectId) REFERENCES subjects(id),
        INDEX idx_chapter_subject (subjectId),
        INDEX idx_chapter_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='章节表'
    `);

    // 创建题目表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        subjectId INT NOT NULL COMMENT '科目ID',
        chapterId INT NULL COMMENT '章节ID',
        type ENUM('单选题', '多选题', '判断题', '填空题', '问答题') NOT NULL COMMENT '题目类型',
        content TEXT NOT NULL COMMENT '题目内容',
        options JSON COMMENT '选项',
        answer TEXT NOT NULL COMMENT '答案',
        analysis TEXT COMMENT '题目解析',
        difficulty ENUM('简单', '中等', '困难') DEFAULT '中等' COMMENT '难度等级',
        status VARCHAR(20) DEFAULT 'active' COMMENT '状态：active, deleted 等',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (subjectId) REFERENCES subjects(id),
        FOREIGN KEY (chapterId) REFERENCES chapters(id),
        INDEX idx_question_subject (subjectId),
        INDEX idx_question_chapter (chapterId),
        INDEX idx_question_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表'
    `);

    // 创建用户题目记录表
    await pool.query(`
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
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (questionId) REFERENCES questions(id),
        INDEX idx_user_question (userId, questionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户题目记录表'
    `);

    // 创建练习记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS practices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL COMMENT '用户ID',
        questionId INT NOT NULL COMMENT '题目ID',
        answer TEXT COMMENT '用户答案',
        isCorrect BOOLEAN DEFAULT FALSE COMMENT '是否正确',
        timeSpent INT DEFAULT 0 COMMENT '答题用时(秒)',
        mode VARCHAR(20) DEFAULT 'sequential' COMMENT '练习模式',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (questionId) REFERENCES questions(id),
        INDEX idx_practice_user (userId),
        INDEX idx_practice_question (questionId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='练习记录表'
    `);

    // 创建收藏表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL COMMENT '用户ID',
        questionId INT NOT NULL COMMENT '题目ID',
        note TEXT COMMENT '笔记',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (questionId) REFERENCES questions(id),
        UNIQUE KEY unique_favorite (userId, questionId),
        INDEX idx_favorite_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表'
    `);

    // 创建学习记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL COMMENT '用户ID',
        date DATE NOT NULL COMMENT '学习日期',
        questionCount INT DEFAULT 0 COMMENT '当日答题数',
        correctCount INT DEFAULT 0 COMMENT '当日答对题数',
        timeSpent INT DEFAULT 0 COMMENT '学习时长(秒)',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE KEY unique_user_date (userId, date),
        INDEX idx_study_user (userId),
        INDEX idx_study_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习记录表'
    `);

    // 创建错题本表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS error_book (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL COMMENT '用户ID',
        questionId INT NOT NULL COMMENT '题目ID',
        lastAnswer TEXT COMMENT '最后一次回答',
        addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入错题本时间',
        reviewCount INT DEFAULT 0 COMMENT '复习次数',
        lastReviewAt TIMESTAMP NULL COMMENT '最后复习时间',
        note TEXT COMMENT '笔记',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (questionId) REFERENCES questions(id),
        UNIQUE KEY unique_error_book (userId, questionId),
        INDEX idx_error_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='错题本表'
    `);

    console.log("数据库表创建成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

initDatabase();
