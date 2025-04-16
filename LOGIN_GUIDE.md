# 一键登录功能使用指南

## 开发环境测试

在开发环境下，一键登录功能已经实现模拟登录模式，无需真实的手机号验证。

### 测试方法 1：测试页面

1. 确保服务器正在运行（在项目根目录执行 `npm run dev` 或 `node server/app.js`）
2. 访问 <http://localhost:3000/test-login.html>
3. 点击「开发环境登录」按钮进行测试

### 测试方法 2：从 APP 中调用

在 APP 中使用一键登录功能时，系统会自动检测环境：

- 在真实 APP 环境中：调用运营商 SDK 获取手机号
- 在开发/网页环境中：自动使用开发模式，模拟手机号 13800138000

## 代码说明

### 前端（登录页面）

登录页面（`brushing-question-app/src/pages/login/index.vue`）已配置为支持一键登录按钮。
在非 APP 环境下，会自动使用开发环境的模拟登录 API（`/api/user/dev-login`）。

### 后端（服务器）

1. **路由定义**：`server/routes/userRoutes.js`
   - `/auto-login` - 生产环境一键登录 API
   - `/dev-login` - 开发环境模拟登录 API

2. **控制器**：`server/controllers/userController.js`
   - `autoLogin()` - 处理一键登录，自动兼容生产/开发环境
   - `devLogin()` - 处理开发环境登录，返回测试账号

3. **服务**：`server/services/univerifyService.js`
   - 处理与运营商 SDK 的交互（生产环境）
   - 提供模拟手机号获取能力（开发环境）

## 生产环境配置

在生产环境部署前，需要：

1. 确保已集成运营商一键登录 SDK（中国移动/联通/电信等）
2. 在 `.env` 文件或环境变量中设置：

   ```
   NODE_ENV=production
   UNIVERIFY_API_KEY=你的API密钥
   UNIVERIFY_API_SECRET=你的API密钥
   UNIVERIFY_API_URL=SDK服务URL
   ```

## 常见问题解决

1. **404 错误**：确保服务器已启动，且路由正确配置
2. **500 错误**：检查日志，可能是数据库连接或模型定义问题
3. **认证失败**：生产环境下，检查运营商 SDK 配置是否正确

如需更多帮助，请参考运营商 SDK 文档或联系技术支持。
