const { pool } = require("../config/database");

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
        avatar_url VARCHAR(255) COMMENT '头像URL',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表'
    `);

    // 创建分类表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL COMMENT '分类名称',
        description TEXT COMMENT '分类描述',
        sort_order INT DEFAULT 0 COMMENT '排序',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目分类表'
    `);

    // 创建题目表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL COMMENT '分类ID',
        type ENUM('single', 'multiple', 'judge') NOT NULL COMMENT '题目类型：单选/多选/判断',
        content TEXT NOT NULL COMMENT '题目内容',
        difficulty TINYINT DEFAULT 1 COMMENT '难度等级：1-5',
        analysis TEXT COMMENT '题目解析',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目表'
    `);

    // 创建题目选项表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_options (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT NOT NULL COMMENT '题目ID',
        option_id CHAR(1) NOT NULL COMMENT '选项ID：A/B/C/D等',
        content TEXT NOT NULL COMMENT '选项内容',
        is_correct BOOLEAN DEFAULT FALSE COMMENT '是否为正确答案',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目选项表'
    `);

    // 创建题目图片表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT NOT NULL COMMENT '题目ID',
        image_url VARCHAR(255) NOT NULL COMMENT '图片URL',
        sort_order INT DEFAULT 0 COMMENT '排序',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目图片表'
    `);

    // 创建用户练习记录表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_practice_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        question_id INT NOT NULL COMMENT '题目ID',
        is_correct BOOLEAN NOT NULL COMMENT '是否正确',
        selected_options VARCHAR(50) COMMENT '用户选择的选项',
        time_spent INT COMMENT '答题用时(秒)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户练习记录表'
    `);

    // 创建用户收藏表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        question_id INT NOT NULL COMMENT '题目ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES questions(id),
        UNIQUE KEY unique_favorite (user_id, question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表'
    `);

    // 创建用户错题本表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_wrong_questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        question_id INT NOT NULL COMMENT '题目ID',
        wrong_count INT DEFAULT 1 COMMENT '错误次数',
        last_wrong_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最近错误时间',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES questions(id),
        UNIQUE KEY unique_wrong (user_id, question_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户错题本表'
    `);

    // 创建用户学习统计表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_statistics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        total_questions INT DEFAULT 0 COMMENT '总答题数',
        correct_questions INT DEFAULT 0 COMMENT '正确答题数',
        wrong_questions INT DEFAULT 0 COMMENT '错误答题数',
        streak_days INT DEFAULT 0 COMMENT '连续学习天数',
        last_practice_date DATE COMMENT '最后练习日期',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户学习统计表'
    `);

    // 创建题目报错表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_reports (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '用户ID',
        question_id INT NOT NULL COMMENT '题目ID',
        report_type VARCHAR(50) NOT NULL COMMENT '报错类型',
        report_content TEXT COMMENT '报错内容',
        status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目报错表'
    `);

    console.log("数据库表创建成功");
  } catch (error) {
    console.error("数据库初始化失败:", error);
  }
}

initDatabase();
