const { pool } = require("../config/database");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function minimalInsert() {
  try {
    console.log("尝试连接数据库...");
    await pool.query("USE brushing_question");
    console.log("成功连接到数据库");

    // 只插入一个科目
    const subject = {
      name: "测试科目",
      description: "这是一个测试科目",
      icon: "测",
      color: "#1890ff",
      type: "test",
      order_index: 1,
    };

    console.log("尝试插入科目...");
    await pool.query("INSERT INTO subjects SET ?", subject);
    console.log("科目插入成功");
  } catch (error) {
    console.error("插入失败:", error);
  } finally {
    await pool.end();
    console.log("数据库连接已关闭");
  }
}

minimalInsert();
