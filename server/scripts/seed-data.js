const Question = require("../models/question");
const sequelize = require("../config/database");

async function seedData() {
  try {
    await sequelize.sync(); // 确保表已创建

    // 插入测试题目
    await Question.bulkCreate([
      {
        type: "single",
        content: "下列哪个不是 JavaScript 的数据类型？",
        options: JSON.stringify([
          { id: "A", text: "String", isCorrect: false },
          { id: "B", text: "Number", isCorrect: false },
          { id: "C", text: "Boolean", isCorrect: false },
          { id: "D", text: "Char", isCorrect: true },
        ]),
        category: "frontend",
        difficulty: 1,
        analysis: "JavaScript 中没有 Char 类型，字符都使用 String 类型表示。",
      },
      {
        type: "multiple",
        content: "以下哪些是 HTTP 请求方法？",
        options: JSON.stringify([
          { id: "A", text: "GET", isCorrect: true },
          { id: "B", text: "POST", isCorrect: true },
          { id: "C", text: "SEND", isCorrect: false },
          { id: "D", text: "PUT", isCorrect: true },
        ]),
        category: "backend",
        difficulty: 2,
        analysis:
          "HTTP 标准请求方法包括 GET、POST、PUT、DELETE 等，但没有 SEND 方法。",
      },
    ]);

    console.log("测试数据添加成功！");
  } catch (error) {
    console.error("添加测试数据失败:", error);
  } finally {
    await sequelize.close();
  }
}

seedData();
