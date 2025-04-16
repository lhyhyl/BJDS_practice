const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function testConnection() {
  console.log("环境变量:");
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Database: ${process.env.DB_NAME}`);

  try {
    console.log("尝试连接数据库...");
    const conn = await pool.getConnection();
    console.log("成功获取连接!");

    console.log("执行简单查询...");
    await conn.query("SELECT 1 as test");
    console.log("查询成功!");

    console.log("尝试使用数据库...");
    await conn.query("USE brushing_question");
    console.log("数据库切换成功!");

    console.log("尝试查询subjects表...");
    const [rows] = await conn.query("SELECT * FROM subjects LIMIT 1");
    console.log("查询结果:", rows);

    console.log("释放连接...");
    conn.release();
    console.log("连接已释放!");
  } catch (error) {
    console.error("测试失败:", error);
  } finally {
    // 确保结束连接池
    try {
      await pool.end();
      console.log("连接池已关闭");
    } catch (err) {
      console.error("关闭连接池失败:", err);
    }
    process.exit(0);
  }
}

testConnection();
