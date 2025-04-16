const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function dropAndRecreateDatabase() {
  try {
    console.log("尝试连接到MySQL服务器...");

    // 删除数据库（如果存在）
    console.log("尝试删除数据库（如果存在）...");
    await pool.query("DROP DATABASE IF EXISTS brushing_question");
    console.log("数据库已删除（如果存在）");

    // 创建新的数据库
    console.log("创建新的数据库...");
    await pool.query("CREATE DATABASE brushing_question");
    console.log("数据库创建成功");

    console.log(
      "\n数据库已重新创建。请运行 init-database.js 脚本初始化表结构，然后运行 insert-sample-data.js 插入示例数据。"
    );
  } catch (error) {
    console.error("重新创建数据库失败:", error);
  } finally {
    await pool.end();
  }
}

// 执行函数
dropAndRecreateDatabase();
