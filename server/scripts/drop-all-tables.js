const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function dropAllTables() {
  try {
    // 连接到数据库
    console.log("数据库连接信息:");
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Password exists: ${Boolean(process.env.DB_PASSWORD)}`);

    console.log("\n尝试连接数据库...");
    await pool.query("USE brushing_question");
    console.log("成功连接到数据库 brushing_question");

    // 设置外键检查为0，允许删除有外键关联的表
    console.log("禁用外键约束检查...");
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");

    // 获取所有表
    console.log("获取所有表...");
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'brushing_question'
    `);

    if (tables.length === 0) {
      console.log("数据库中没有表需要删除。");
    } else {
      console.log(`找到 ${tables.length} 个表，开始删除...`);

      // 逐个删除表
      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;
        console.log(`删除表: ${tableName}`);
        await pool.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      }

      console.log("所有表已成功删除!");
    }

    // 重新启用外键约束检查
    console.log("重新启用外键约束检查...");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("操作完成。");
  } catch (error) {
    console.error("删除表失败:", error);
  } finally {
    // 关闭连接池
    await pool.end();
    console.log("数据库连接已关闭");
  }
}

// 添加确认提示，防止意外执行
const args = process.argv.slice(2);
if (args.includes("--confirm")) {
  dropAllTables();
} else {
  console.log("\x1b[31m警告: 此操作将删除数据库中的所有表和数据!\x1b[0m");
  console.log("如果确定要执行，请添加 --confirm 参数运行此脚本:");
  console.log("node scripts/drop-all-tables.js --confirm");
}
