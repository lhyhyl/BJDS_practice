const { pool } = require("../config/database");
// 确保 dotenv 被直接引入，以防 database.js 中的引入出现问题
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// 添加调试代码
console.log("数据库连接信息:");
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Database: ${process.env.DB_NAME}`);
// 不打印密码，仅检查是否存在
console.log(`Password exists: ${Boolean(process.env.DB_PASSWORD)}`);

async function insertSampleData() {
  try {
    console.log("尝试连接数据库...");
    await pool.query("USE brushing_question");
    console.log("成功连接到数据库，开始插入数据...");

    // 插入科目数据
    console.log("插入科目数据...");
    const subjects = [
      {
        name: "数据结构",
        description: "数据结构相关题目",
        icon: "数",
        color: "#1890ff",
        type: "datastructure",
        orderIndex: 1,
      },
      {
        name: "操作系统",
        description: "操作系统相关题目",
        icon: "操",
        color: "#52c41a",
        type: "os",
        orderIndex: 2,
      },
      {
        name: "计算机网络",
        description: "计算机网络相关题目",
        icon: "网",
        color: "#722ed1",
        type: "network",
        orderIndex: 3,
      },
      {
        name: "计算机组成",
        description: "计算机组成原理相关题目",
        icon: "组",
        color: "#fa8c16",
        type: "architecture",
        orderIndex: 4,
      },
    ];

    for (const subject of subjects) {
      try {
        await pool.query("INSERT INTO subjects SET ?", subject);
      } catch (error) {
        console.error(`插入科目数据失败: ${subject.name}`, error);
        // 继续尝试其他数据
      }
    }
    console.log("科目数据插入完成");

    // 插入章节数据
    const chapters = [
      {
        subject_id: 1,
        name: "线性表",
        description: "线性表相关内容",
        orderIndex: 1,
      },
      {
        subject_id: 1,
        name: "树与二叉树",
        description: "树与二叉树相关内容",
        orderIndex: 2,
      },
      {
        subject_id: 1,
        name: "图",
        description: "图相关内容",
        orderIndex: 3,
      },
      {
        subject_id: 2,
        name: "进程管理",
        description: "进程管理相关内容",
        orderIndex: 1,
      },
      {
        subject_id: 2,
        name: "内存管理",
        description: "内存管理相关内容",
        orderIndex: 2,
      },
      {
        subject_id: 3,
        name: "网络基础",
        description: "网络基础相关内容",
        orderIndex: 1,
      },
      {
        subject_id: 3,
        name: "TCP/IP协议",
        description: "TCP/IP协议相关内容",
        orderIndex: 2,
      },
      {
        subject_id: 4,
        name: "CPU",
        description: "CPU相关内容",
        orderIndex: 1,
      },
      {
        subject_id: 4,
        name: "存储器",
        description: "存储器相关内容",
        orderIndex: 2,
      },
    ];

    for (const chapter of chapters) {
      try {
        console.log(`尝试插入章节: ${chapter.name}`);

        // 首先尝试使用 subject_id
        try {
          await pool.query("INSERT INTO chapters SET ?", chapter);
          console.log("使用 subject_id 插入成功！");
        } catch (error) {
          if (
            error.code === "ER_BAD_FIELD_ERROR" &&
            error.message.includes("subject_id")
          ) {
            console.log("subject_id 字段不存在，尝试使用 subjectId...");

            // 如果失败，尝试使用 subjectId
            const chapterWithSubjectId = {
              ...chapter,
              subjectId: chapter.subject_id, // 转换为 subjectId
            };
            delete chapterWithSubjectId.subject_id; // 删除 subject_id

            await pool.query(
              "INSERT INTO chapters SET ?",
              chapterWithSubjectId
            );
            console.log("使用 subjectId 插入成功！");
          } else {
            // 其他错误
            throw error;
          }
        }
      } catch (error) {
        console.error(`插入章节失败: ${chapter.name}`, error);
        console.error("错误详情:", error.code, error.sqlMessage);

        // 尝试打印表结构以便诊断
        try {
          const [columns] = await pool.query("DESCRIBE chapters");
          console.log("chapters表字段列表:");
          columns.forEach((col) => {
            console.log(
              `${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`
            );
          });
        } catch (err) {
          console.error("无法获取chapters表结构:", err.message);
        }

        // 停止继续插入
        break;
      }
    }

    // 插入题目数据
    const questions = [
      {
        subject_id: 1,
        type: "单选题",
        content: "以下哪种数据结构最适合实现优先队列？",
        options: JSON.stringify([
          { id: "A", content: "数组" },
          { id: "B", content: "链表" },
          { id: "C", content: "堆" },
          { id: "D", content: "栈" },
        ]),
        answer: "C",
        difficulty: "中等",
        analysis:
          "堆是一种特殊的二叉树，可以高效地实现优先队列的插入和删除操作。",
      },
      {
        subject_id: 2,
        type: "单选题",
        content: "在操作系统中，进程和线程的主要区别是什么？",
        options: JSON.stringify([
          {
            id: "A",
            content: "进程是资源分配的基本单位，线程是CPU调度的基本单位",
          },
          {
            id: "B",
            content: "进程是CPU调度的基本单位，线程是资源分配的基本单位",
          },
          { id: "C", content: "进程和线程没有本质区别" },
          { id: "D", content: "进程只能在单核上运行，线程可以在多核上运行" },
        ]),
        answer: "A",
        difficulty: "中等",
        analysis: "进程是资源分配的基本单位，线程是CPU调度的基本单位。",
      },
      {
        subject_id: 3,
        type: "多选题",
        content: "以下哪些是TCP协议的特点？",
        options: JSON.stringify([
          { id: "A", content: "面向连接" },
          { id: "B", content: "可靠传输" },
          { id: "C", content: "无连接" },
          { id: "D", content: "不可靠传输" },
        ]),
        answer: "A,B",
        difficulty: "中等",
        analysis: "TCP是面向连接的、可靠的传输协议，提供流量控制和拥塞控制。",
      },
      {
        subject_id: 4,
        type: "判断题",
        content: "CPU的时钟频率越高，计算机的性能就一定越好。",
        options: JSON.stringify([
          { id: "A", content: "正确" },
          { id: "B", content: "错误" },
        ]),
        answer: "B",
        difficulty: "简单",
        analysis: "CPU性能不仅取决于时钟频率，还取决于架构、缓存等因素。",
      },
    ];

    for (const question of questions) {
      try {
        console.log(`尝试插入题目: ${question.content.substring(0, 20)}...`);

        // 首先尝试使用 subject_id
        try {
          await pool.query("INSERT INTO questions SET ?", question);
          console.log("使用 subject_id 插入成功！");
        } catch (error) {
          if (
            error.code === "ER_BAD_FIELD_ERROR" &&
            error.message.includes("subject_id")
          ) {
            console.log("subject_id 字段不存在，尝试使用 subjectId...");

            // 如果失败，尝试使用 subjectId
            const questionWithSubjectId = {
              ...question,
              subjectId: question.subject_id, // 转换为 subjectId
            };
            delete questionWithSubjectId.subject_id; // 删除 subject_id

            await pool.query(
              "INSERT INTO questions SET ?",
              questionWithSubjectId
            );
            console.log("使用 subjectId 插入成功！");
          } else {
            // 其他错误
            throw error;
          }
        }
      } catch (error) {
        console.error(
          `插入题目失败: ${question.content.substring(0, 20)}...`,
          error
        );
        console.error("错误详情:", error.code, error.sqlMessage);

        // 尝试打印表结构以便诊断
        try {
          const [columns] = await pool.query("DESCRIBE questions");
          console.log("questions表字段列表:");
          columns.forEach((col) => {
            console.log(
              `${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`
            );
          });
        } catch (err) {
          console.error("无法获取questions表结构:", err.message);
        }

        // 停止继续插入
        break;
      }
    }

    // 插入用户数据
    const users = [
      {
        openid: "test_user_1",
        nickname: "测试用户1",
        avatar: "https://example.com/avatar1.jpg",
        phone: "13800138001",
        totalQuestions: 10,
        correctCount: 8,
        streak: 5,
        settings: JSON.stringify({
          autoSubmit: true,
          fontSize: 16,
          theme: "light",
        }),
      },
      {
        openid: "test_user_2",
        nickname: "测试用户2",
        avatar: "https://example.com/avatar2.jpg",
        phone: "13800138002",
        totalQuestions: 5,
        correctCount: 3,
        streak: 2,
        settings: JSON.stringify({
          autoSubmit: false,
          fontSize: 18,
          theme: "dark",
        }),
      },
    ];

    for (const user of users) {
      await pool.query("INSERT INTO users SET ?", user);
    }

    // 插入用户题目记录
    const userQuestions = [
      {
        user_id: 1,
        question_id: 1,
        answer: "C",
        isCorrect: true,
        isWrong: false,
        timeSpent: 30,
        lastPracticeAt: new Date(),
      },
      {
        user_id: 1,
        question_id: 2,
        answer: "B",
        isCorrect: false,
        isWrong: true,
        timeSpent: 45,
        lastPracticeAt: new Date(),
      },
    ];

    for (const record of userQuestions) {
      try {
        console.log(
          `尝试插入用户题目记录: user_id=${record.user_id}, question_id=${record.question_id}`
        );

        // 首先尝试使用 user_id 和 question_id
        try {
          await pool.query("INSERT INTO userQuestions SET ?", record);
          console.log("使用 user_id/question_id 插入成功！");
        } catch (error) {
          if (error.code === "ER_BAD_FIELD_ERROR") {
            console.log("字段名不匹配，尝试转换字段名...");

            // 如果失败，尝试转换字段名
            const convertedRecord = { ...record };

            if (error.message.includes("user_id")) {
              convertedRecord.userId = record.user_id;
              delete convertedRecord.user_id;
            }

            if (error.message.includes("question_id")) {
              convertedRecord.questionId = record.question_id;
              delete convertedRecord.question_id;
            }

            await pool.query(
              "INSERT INTO userQuestions SET ?",
              convertedRecord
            );
            console.log("使用转换后的字段名插入成功！");
          } else {
            // 其他错误
            throw error;
          }
        }
      } catch (error) {
        console.error(
          `插入用户题目记录失败: user_id=${record.user_id}, question_id=${record.question_id}`,
          error
        );
        console.error("错误详情:", error.code, error.sqlMessage);

        // 尝试打印表结构以便诊断
        try {
          const [columns] = await pool.query("DESCRIBE userQuestions");
          console.log("userQuestions表字段列表:");
          columns.forEach((col) => {
            console.log(
              `${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`
            );
          });
        } catch (err) {
          console.error("无法获取userQuestions表结构:", err.message);
        }

        // 停止继续插入
        break;
      }
    }

    // 插入练习记录
    const practices = [
      {
        user_id: 1,
        question_id: 1,
        answer: "C",
        isCorrect: true,
        timeSpent: 30,
        mode: "sequential",
      },
      {
        user_id: 1,
        question_id: 2,
        answer: "B",
        isCorrect: false,
        timeSpent: 45,
        mode: "random",
      },
    ];

    for (const practice of practices) {
      try {
        console.log(
          `尝试插入练习记录: user_id=${practice.user_id}, question_id=${practice.question_id}`
        );

        // 首先尝试使用 user_id 和 question_id
        try {
          await pool.query("INSERT INTO practices SET ?", practice);
          console.log("使用 user_id/question_id 插入成功！");
        } catch (error) {
          if (error.code === "ER_BAD_FIELD_ERROR") {
            console.log("字段名不匹配，尝试转换字段名...");

            // 如果失败，尝试转换字段名
            const convertedPractice = { ...practice };

            if (error.message.includes("user_id")) {
              convertedPractice.userId = practice.user_id;
              delete convertedPractice.user_id;
            }

            if (error.message.includes("question_id")) {
              convertedPractice.questionId = practice.question_id;
              delete convertedPractice.question_id;
            }

            await pool.query("INSERT INTO practices SET ?", convertedPractice);
            console.log("使用转换后的字段名插入成功！");
          } else {
            // 其他错误
            throw error;
          }
        }
      } catch (error) {
        console.error(
          `插入练习记录失败: user_id=${practice.user_id}, question_id=${practice.question_id}`,
          error
        );
        console.error("错误详情:", error.code, error.sqlMessage);

        // 尝试打印表结构以便诊断
        try {
          const [columns] = await pool.query("DESCRIBE practices");
          console.log("practices表字段列表:");
          columns.forEach((col) => {
            console.log(
              `${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`
            );
          });
        } catch (err) {
          console.error("无法获取practices表结构:", err.message);
        }

        // 停止继续插入
        break;
      }
    }

    // 插入收藏记录
    const favorites = [
      { userId: 1, questionId: 1, note: "这是一道很重要的题目" },
      { userId: 1, questionId: 2, note: "需要注意这道题的解析" },
    ];

    for (const favorite of favorites) {
      await pool.query("INSERT INTO favorites SET ?", favorite);
    }

    console.log("示例数据插入成功!");
  } catch (error) {
    console.error("插入示例数据失败:", error);
    // 如果是连接问题，记录更详细的信息
    if (error.code === "ECONNREFUSED") {
      console.error("数据库连接被拒绝。请检查:");
      console.error("1. 数据库服务器是否正在运行");
      console.error("2. 网络连接是否正常");
      console.error("3. 连接参数是否正确");
      console.error("4. 服务器防火墙是否允许连接");
    }
    throw error; // 重新抛出错误以便重试
  }
}

// 执行三次重试插入
(async () => {
  let retries = 3;
  let success = false;

  while (retries > 0 && !success) {
    try {
      console.log(`正在尝试插入数据，剩余重试次数: ${retries}`);
      await insertSampleData();
      success = true;
    } catch (error) {
      console.error(`尝试失败，剩余重试次数: ${retries - 1}`);
      retries--;
      if (retries > 0) {
        console.log("等待 5 秒后重试...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  if (!success) {
    console.error("所有重试都失败了，请检查连接问题。");
    process.exit(1);
  }
})();
