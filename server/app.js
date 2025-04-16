const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
const { sequelize } = require("./models");
require("dotenv").config();

const app = express();

// 配置跨域
app.use(
  cors({
    origin: true, // 允许所有来源
    credentials: true, // 允许发送cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允许的HTTP方法
    allowedHeaders: ["Content-Type", "Authorization"], // 允许的请求头
  })
);

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件
app.use(express.static('public'));

// 路由
app.use("/api", routes);

// 测试路由
app.get("/test", (req, res) => {
  res.json({ message: "API 工作正常！" });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: "服务器内部错误",
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功");
    console.log(`服务器运行在 http://localhost:${PORT}`);
  } catch (error) {
    console.error("数据库连接失败:", error);
  }
});

module.exports = app;
