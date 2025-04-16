const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// 添加调试代码
console.log("数据库连接信息:");
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Database: ${process.env.DB_NAME}`);
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
        console.log(`科目 "${subject.name}" 插入成功`);
      } catch (error) {
        console.error(`插入科目 "${subject.name}" 失败:`, error.message);
      }
    }

    // 插入章节数据
    console.log("\n插入章节数据...");
    const chapters = [
      {
        subjectId: 1,
        name: "线性表",
        description: "线性表相关内容",
        orderIndex: 1,
      },
      {
        subjectId: 1,
        name: "树与二叉树",
        description: "树与二叉树相关内容",
        orderIndex: 2,
      },
      {
        subjectId: 1,
        name: "图",
        description: "图相关内容",
        orderIndex: 3,
      },
      {
        subjectId: 2,
        name: "进程管理",
        description: "进程管理相关内容",
        orderIndex: 1,
      },
      {
        subjectId: 2,
        name: "内存管理",
        description: "内存管理相关内容",
        orderIndex: 2,
      },
      {
        subjectId: 3,
        name: "网络基础",
        description: "网络基础相关内容",
        orderIndex: 1,
      },
      {
        subjectId: 3,
        name: "TCP/IP协议",
        description: "TCP/IP协议相关内容",
        orderIndex: 2,
      },
      {
        subjectId: 4,
        name: "CPU",
        description: "CPU相关内容",
        orderIndex: 1,
      },
      {
        subjectId: 4,
        name: "存储器",
        description: "存储器相关内容",
        orderIndex: 2,
      },
    ];

    for (const chapter of chapters) {
      try {
        await pool.query("INSERT INTO chapters SET ?", chapter);
        console.log(`章节 "${chapter.name}" 插入成功`);
      } catch (error) {
        console.error(`插入章节 "${chapter.name}" 失败:`, error.message);
      }
    }

    // 插入题目数据
    console.log("\n插入题目数据...");
    const questions = [
      {
        subjectId: 1,
        chapterId: 1,
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
        subjectId: 2,
        chapterId: 4,
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
        subjectId: 3,
        chapterId: 7,
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
        subjectId: 4,
        chapterId: 8,
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
        await pool.query("INSERT INTO questions SET ?", question);
        console.log(`题目 "${question.content.substring(0, 20)}..." 插入成功`);
      } catch (error) {
        console.error(
          `插入题目 "${question.content.substring(0, 20)}..." 失败:`,
          error.message
        );
      }
    }

    // 插入用户数据
    console.log("\n插入用户数据...");
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
      try {
        await pool.query("INSERT INTO users SET ?", user);
        console.log(`用户 "${user.nickname}" 插入成功`);
      } catch (error) {
        console.error(`插入用户 "${user.nickname}" 失败:`, error.message);
      }
    }

    // 插入用户题目记录
    console.log("\n插入用户题目记录...");
    const userQuestions = [
      {
        userId: 1,
        questionId: 1,
        answer: "C",
        isCorrect: true,
        isWrong: false,
        timeSpent: 30,
        lastPracticeAt: new Date(),
      },
      {
        userId: 1,
        questionId: 2,
        answer: "B",
        isCorrect: false,
        isWrong: true,
        timeSpent: 45,
        lastPracticeAt: new Date(),
      },
    ];

    for (const record of userQuestions) {
      try {
        await pool.query("INSERT INTO userQuestions SET ?", record);
        console.log(
          `用户题目记录 (userId=${record.userId}, questionId=${record.questionId}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入用户题目记录 (userId=${record.userId}, questionId=${record.questionId}) 失败:`,
          error.message
        );
      }
    }

    // 插入练习记录
    console.log("\n插入练习记录...");
    const practices = [
      {
        userId: 1,
        questionId: 1,
        answer: "C",
        isCorrect: true,
        timeSpent: 30,
        mode: "sequential",
      },
      {
        userId: 1,
        questionId: 2,
        answer: "B",
        isCorrect: false,
        timeSpent: 45,
        mode: "random",
      },
    ];

    for (const practice of practices) {
      try {
        await pool.query("INSERT INTO practices SET ?", practice);
        console.log(
          `练习记录 (userId=${practice.userId}, questionId=${practice.questionId}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入练习记录 (userId=${practice.userId}, questionId=${practice.questionId}) 失败:`,
          error.message
        );
      }
    }

    // 插入收藏数据
    console.log("\n插入收藏数据...");
    const favorites = [
      {
        userId: 1,
        questionId: 1,
        note: "这是一道关于数据结构的重要题目",
      },
      {
        userId: 1,
        questionId: 3,
        note: "TCP协议的特点非常重要",
      },
    ];

    for (const favorite of favorites) {
      try {
        await pool.query("INSERT INTO favorites SET ?", favorite);
        console.log(
          `收藏记录 (userId=${favorite.userId}, questionId=${favorite.questionId}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入收藏记录 (userId=${favorite.userId}, questionId=${favorite.questionId}) 失败:`,
          error.message
        );
      }
    }

    // 插入错题本数据
    console.log("\n插入错题本数据...");
    const errorBook = [
      {
        userId: 1,
        questionId: 2,
        lastAnswer: "B",
        reviewCount: 2,
        lastReviewAt: new Date(),
        note: "需要重点复习进程和线程的区别",
      },
      {
        userId: 2,
        questionId: 3,
        lastAnswer: "A,C",
        reviewCount: 1,
        lastReviewAt: new Date(),
        note: "TCP和UDP的区别",
      },
    ];

    for (const error of errorBook) {
      try {
        await pool.query("INSERT INTO errorBook SET ?", error);
        console.log(
          `错题记录 (userId=${error.userId}, questionId=${error.questionId}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入错题记录 (userId=${error.userId}, questionId=${error.questionId}) 失败:`,
          error.message
        );
      }
    }

    // 插入学习记录数据
    console.log("\n插入学习记录数据...");
    const studyRecords = [
      {
        userId: 1,
        date: new Date().toISOString().slice(0, 10), // 今天
        questionCount: 15,
        correctCount: 12,
        timeSpent: 1800, // 30分钟
      },
      {
        userId: 1,
        date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // 昨天
        questionCount: 10,
        correctCount: 8,
        timeSpent: 1200, // 20分钟
      },
      {
        userId: 2,
        date: new Date().toISOString().slice(0, 10), // 今天
        questionCount: 8,
        correctCount: 5,
        timeSpent: 900, // 15分钟
      },
    ];

    for (const record of studyRecords) {
      try {
        await pool.query("INSERT INTO studyRecords SET ?", record);
        console.log(
          `学习记录 (userId=${record.userId}, date=${record.date}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入学习记录 (userId=${record.userId}, date=${record.date}) 失败:`,
          error.message
        );
      }
    }

    // 插入问题选项数据（单独存储的选项）
    console.log("\n插入问题选项数据...");
    const questionOptions = [
      { questionId: 1, optionKey: "A", optionValue: "数组" },
      { questionId: 1, optionKey: "B", optionValue: "链表" },
      { questionId: 1, optionKey: "C", optionValue: "堆" },
      { questionId: 1, optionKey: "D", optionValue: "栈" },
      {
        questionId: 2,
        optionKey: "A",
        optionValue: "进程是资源分配的基本单位，线程是CPU调度的基本单位",
      },
      {
        questionId: 2,
        optionKey: "B",
        optionValue: "进程是CPU调度的基本单位，线程是资源分配的基本单位",
      },
      {
        questionId: 2,
        optionKey: "C",
        optionValue: "进程和线程没有本质区别",
      },
      {
        questionId: 2,
        optionKey: "D",
        optionValue: "进程只能在单核上运行，线程可以在多核上运行",
      },
    ];

    for (const option of questionOptions) {
      try {
        await pool.query("INSERT INTO questionOptions SET ?", option);
        console.log(
          `题目选项 (questionId=${option.questionId}, optionKey=${option.optionKey}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入题目选项 (questionId=${option.questionId}, optionKey=${option.optionKey}) 失败:`,
          error.message
        );
      }
    }

    // 插入问题图片数据
    console.log("\n插入问题图片数据...");
    const questionImages = [
      {
        questionId: 1,
        imageUrl: "https://example.com/images/heap.png",
        orderIndex: 1,
      },
      {
        questionId: 3,
        imageUrl: "https://example.com/images/tcp_model.png",
        orderIndex: 1,
      },
      {
        questionId: 4,
        imageUrl: "https://example.com/images/cpu_architecture.png",
        orderIndex: 1,
      },
    ];

    for (const image of questionImages) {
      try {
        await pool.query("INSERT INTO questionImages SET ?", image);
        console.log(
          `题目图片 (questionId=${image.questionId}, imageUrl=${image.imageUrl}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入题目图片 (questionId=${image.questionId}, imageUrl=${image.imageUrl}) 失败:`,
          error.message
        );
      }
    }

    // 插入用户统计数据
    console.log("\n插入用户统计数据...");
    const userStatistics = [
      {
        userId: 1,
        subjectId: 1,
        questionCount: 25,
        correctCount: 20,
        timeSpent: 3000, // 50分钟
        lastPracticeAt: new Date(),
      },
      {
        userId: 1,
        subjectId: 2,
        questionCount: 15,
        correctCount: 10,
        timeSpent: 1800, // 30分钟
        lastPracticeAt: new Date(),
      },
      {
        userId: 2,
        subjectId: 1,
        questionCount: 10,
        correctCount: 8,
        timeSpent: 1200, // 20分钟
        lastPracticeAt: new Date(),
      },
    ];

    for (const stat of userStatistics) {
      try {
        await pool.query("INSERT INTO userStatistics SET ?", stat);
        console.log(
          `用户统计 (userId=${stat.userId}, subjectId=${stat.subjectId}) 插入成功`
        );
      } catch (error) {
        console.error(
          `插入用户统计 (userId=${stat.userId}, subjectId=${stat.subjectId}) 失败:`,
          error.message
        );
      }
    }

    console.log("\n示例数据插入完成!");
  } catch (error) {
    console.error("插入示例数据失败:", error);
  } finally {
    try {
      await pool.end();
      console.log("数据库连接已关闭");
    } catch (err) {
      console.error("关闭数据库连接失败:", err);
    }
  }
}

insertSampleData();
