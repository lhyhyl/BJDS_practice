const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function showTables() {
  try {
    console.log("尝试连接数据库...");
    await pool.query("USE brushing_question");
    console.log("成功连接到数据库");

    // 获取所有表
    const [tables] = await pool.query("SHOW TABLES");
    console.log("\n数据库中的表:");
    tables.forEach((table) => {
      console.log(Object.values(table)[0]);
    });

    // 检查questions表是否存在
    const [existsResult] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'brushing_question' 
      AND table_name = 'questions'
    `);

    if (existsResult[0].count > 0) {
      console.log("\nquestions表存在，检查表结构:");
      try {
        const [columns] = await pool.query("DESCRIBE questions");
        console.log("questions表字段:");
        columns.forEach((col) => {
          console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
        });
      } catch (err) {
        console.error("无法获取questions表结构:", err.message);
      }
    } else {
      console.log("questions表不存在!");
    }
  } catch (error) {
    console.error("查询表失败:", error);
  } finally {
    await pool.end();
  }
}

showTables();
