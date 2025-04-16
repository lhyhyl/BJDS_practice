const { pool } = require("../config/database");

async function insertSampleData() {
  try {
    // 插入分类数据
    const categories = [
      { name: "数据结构", description: "数据结构相关题目" },
      { name: "操作系统", description: "操作系统相关题目" },
      { name: "计算机网络", description: "计算机网络相关题目" },
      { name: "计算机组成原理", description: "计算机组成原理相关题目" },
    ];

    for (const category of categories) {
      await pool.query("INSERT INTO categories SET ?", category);
    }

    // 插入题目数据
    const questions = [
      {
        category_id: 1,
        type: "single",
        content: "以下哪种数据结构最适合实现优先队列？",
        difficulty: 3,
        analysis:
          "堆是一种特殊的二叉树，可以高效地实现优先队列的插入和删除操作。",
      },
      {
        category_id: 2,
        type: "single",
        content: "在操作系统中，进程和线程的主要区别是什么？",
        difficulty: 4,
        analysis: "进程是资源分配的基本单位，线程是CPU调度的基本单位。",
      },
      {
        category_id: 3,
        type: "multiple",
        content: "以下哪些是TCP协议的特点？",
        difficulty: 4,
        analysis: "TCP是面向连接的、可靠的传输协议，提供流量控制和拥塞控制。",
      },
      {
        category_id: 4,
        type: "judge",
        content: "CPU的时钟频率越高，计算机的性能就一定越好。",
        difficulty: 2,
        analysis: "CPU性能不仅取决于时钟频率，还取决于架构、缓存等因素。",
      },
    ];

    for (const question of questions) {
      const [result] = await pool.query(
        "INSERT INTO questions SET ?",
        question
      );
      const questionId = result.insertId;

      // 插入选项数据
      if (question.type === "single") {
        const options = [
          {
            question_id: questionId,
            option_id: "A",
            content: "数组",
            is_correct: false,
          },
          {
            question_id: questionId,
            option_id: "B",
            content: "链表",
            is_correct: false,
          },
          {
            question_id: questionId,
            option_id: "C",
            content: "堆",
            is_correct: true,
          },
          {
            question_id: questionId,
            option_id: "D",
            content: "栈",
            is_correct: false,
          },
        ];
        await pool.query(
          "INSERT INTO question_options (question_id, option_id, content, is_correct) VALUES ?",
          [
            options.map((opt) => [
              opt.question_id,
              opt.option_id,
              opt.content,
              opt.is_correct,
            ]),
          ]
        );
      } else if (question.type === "multiple") {
        const options = [
          {
            question_id: questionId,
            option_id: "A",
            content: "面向连接",
            is_correct: true,
          },
          {
            question_id: questionId,
            option_id: "B",
            content: "可靠传输",
            is_correct: true,
          },
          {
            question_id: questionId,
            option_id: "C",
            content: "无连接",
            is_correct: false,
          },
          {
            question_id: questionId,
            option_id: "D",
            content: "不可靠传输",
            is_correct: false,
          },
        ];
        await pool.query(
          "INSERT INTO question_options (question_id, option_id, content, is_correct) VALUES ?",
          [
            options.map((opt) => [
              opt.question_id,
              opt.option_id,
              opt.content,
              opt.is_correct,
            ]),
          ]
        );
      } else if (question.type === "judge") {
        const options = [
          {
            question_id: questionId,
            option_id: "A",
            content: "正确",
            is_correct: false,
          },
          {
            question_id: questionId,
            option_id: "B",
            content: "错误",
            is_correct: true,
          },
        ];
        await pool.query(
          "INSERT INTO question_options (question_id, option_id, content, is_correct) VALUES ?",
          [
            options.map((opt) => [
              opt.question_id,
              opt.option_id,
              opt.content,
              opt.is_correct,
            ]),
          ]
        );
      }
    }

    // 插入用户数据
    const users = [
      {
        openid: "test_user_1",
        nickname: "测试用户1",
        avatar_url: "https://example.com/avatar1.jpg",
      },
      {
        openid: "test_user_2",
        nickname: "测试用户2",
        avatar_url: "https://example.com/avatar2.jpg",
      },
    ];

    for (const user of users) {
      const [result] = await pool.query("INSERT INTO users SET ?", user);
      const userId = result.insertId;

      // 插入用户统计数据
      await pool.query("INSERT INTO user_statistics SET ?", {
        user_id: userId,
        total_questions: 10,
        correct_questions: 8,
        wrong_questions: 2,
        streak_days: 5,
        last_practice_date: new Date(),
      });
    }

    // 插入练习记录
    const practiceRecords = [
      {
        user_id: 1,
        question_id: 1,
        is_correct: true,
        selected_options: "C",
        time_spent: 30,
      },
      {
        user_id: 1,
        question_id: 2,
        is_correct: false,
        selected_options: "A",
        time_spent: 45,
      },
    ];

    await pool.query(
      "INSERT INTO user_practice_records (user_id, question_id, is_correct, selected_options, time_spent) VALUES ?",
      [
        practiceRecords.map((record) => [
          record.user_id,
          record.question_id,
          record.is_correct,
          record.selected_options,
          record.time_spent,
        ]),
      ]
    );

    // 插入收藏记录
    await pool.query(
      "INSERT INTO user_favorites (user_id, question_id) VALUES (1, 1), (1, 2)"
    );

    // 插入错题记录
    await pool.query(
      "INSERT INTO user_wrong_questions (user_id, question_id, wrong_count) VALUES (1, 2, 1)"
    );

    // 插入题目报错记录
    await pool.query(
      'INSERT INTO question_reports (user_id, question_id, report_type, report_content) VALUES (1, 1, "题目描述有误", "题目描述不够清晰")'
    );

    console.log("示例数据插入成功");
  } catch (error) {
    console.error("示例数据插入失败:", error);
  }
}

insertSampleData();
