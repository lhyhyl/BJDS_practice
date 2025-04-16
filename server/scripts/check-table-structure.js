const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function checkTableStructure() {
  try {
    console.log("尝试连接数据库...");
    await pool.query("USE brushing_question");
    console.log("成功连接到数据库");

    // 检查questions表结构
    console.log("\n检查questions表结构:");
    const [columns] = await pool.query("SHOW COLUMNS FROM questions");
    console.log("表字段列表:");
    columns.forEach((col) => {
      console.log(
        `${col.Field} - ${col.Type} - ${
          col.Null === "YES" ? "可为空" : "不可为空"
        } - ${col.Key}`
      );
    });

    // 检查索引
    console.log("\n检查questions表索引:");
    const [indexes] = await pool.query("SHOW INDEX FROM questions");
    console.log("索引列表:");
    indexes.forEach((idx) => {
      console.log(
        `${idx.Key_name} - 列: ${idx.Column_name} - 唯一性: ${
          idx.Non_unique === 0 ? "唯一" : "不唯一"
        }`
      );
    });

    // 检查外键
    console.log("\n检查questions表外键:");
    const [fkQuery] = await pool.query(`
      SELECT 
        TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = 'brushing_question'
        AND TABLE_NAME = 'questions';
    `);

    if (fkQuery.length === 0) {
      console.log("没有找到外键约束");
    } else {
      fkQuery.forEach((fk) => {
        console.log(
          `${fk.CONSTRAINT_NAME}: ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
        );
      });
    }
  } catch (error) {
    console.error("检查表结构失败:", error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
