/**
 * 系统配置文件
 */

require("dotenv").config();

const config = {
  // JWT密钥
  jwtSecret: process.env.JWT_SECRET || "brushing_question_jwt_secret_key",

  // JWT过期时间
  jwtExpiration: "7d",

  // 环境配置
  env: process.env.NODE_ENV || "development",

  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
  },

  // 数据库配置，从环境变量中获取
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "brushing_question",
    dialect: "mysql",
    logging: process.env.NODE_ENV !== "production",
  },

  // 短信验证码配置
  sms: {
    expiration: 10 * 60 * 1000, // 验证码过期时间，10分钟
    devCode: "123456", // 开发环境默认验证码
  },

  // 跨域配置
  cors: {
    allowedOrigins: ["http://localhost:8080", "https://example.com"],
    credentials: true,
  },

  // 日志配置
  logs: {
    level: process.env.LOG_LEVEL || "info",
    maxFiles: 5,
    maxSize: "10m",
  },
};

module.exports = config;
