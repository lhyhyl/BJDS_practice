# 刷题小程序 API 文档

这是刷题小程序后端API的完整接口文档，以Postman集合的形式提供，便于开发和测试。

## 使用方法

### 导入Postman

1. 下载并安装 [Postman](https://www.postman.com/downloads/)
2. 打开Postman，点击左上角的"Import"按钮
3. 选择"File" > "Upload Files"，然后选择`postman_collection.json`文件
4. 点击"Import"完成导入

### 配置环境变量

为了方便使用，建议设置环境变量：

1. 在Postman右上角点击"Environments"，然后点击"+"创建新环境
2. 添加以下变量：
   - `baseUrl`: API的基础URL，如`http://localhost:3000`
   - `token`: 登录后获取的JWT令牌

### 接口认证

- 大部分接口需要认证，需要在请求头中添加`Authorization: Bearer {token}`
- 在登录成功后，将返回的token保存到环境变量中
- 白名单接口（不需要认证）：
  - `/api/user/auto-login`
  - `/api/user/dev-login`
  - `/api/subjects`
  - `/api/subjects/:subjectId/chapters`
  - `/api/questions` (公开题目)

## API分类

### 用户管理

- 自动登录(本机号码) (POST `/api/user/auto-login`)
- 开发环境登录 (POST `/api/user/dev-login`)
- 获取用户信息 (GET `/api/user/profile`)
- 更新用户信息 (PUT `/api/user/profile`)
- 更新用户设置 (POST `/api/user/settings`)
- 获取用户统计数据 (GET `/api/user/statistics`)
- 获取用户特定科目统计数据 (GET `/api/user/statistics/:subjectId`)
- 更新用户统计数据 (POST `/api/user/statistics`)

### 数据统计

- 获取学习统计 (GET `/api/statistics`)
- 获取科目统计 (GET `/api/statistics/:id`)
- 获取学习进度 (GET `/api/statistics/progress`)

### 刷题相关

- 获取科目列表
- 获取章节列表
- 获取题目列表
- 获取题目详情
- 提交答案
- 添加到收藏
- 获取收藏列表
- 取消收藏
- 获取错题本
- 开始练习

## 响应格式

所有API返回的数据格式统一为：

```json
{
  "code": 0,       // 0表示成功，非0表示错误
  "message": "操作成功",  // 提示信息
  "data": {        // 返回的数据，可能是对象或数组
    // ...
  }
}
```

## 常见错误码

- `0`: 成功
- `400`: 请求参数错误
- `401`: 未授权或token无效
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器内部错误

## 开发环境

在开发环境中(`NODE_ENV !== "production"`)：

- 自动登录会使用模拟数据，手机号为`13800138000`
- 开发环境登录接口提供便于测试的快速登录方法
- 一些接口会返回模拟数据，以便于前端开发和测试

## 接口调用示例

### 自动登录(一键登录)

```
POST {{baseUrl}}/api/user/auto-login
Content-Type: application/json

{
  "authResult": "mock-auth-result-from-device"
}
```

### 开发环境登录

```
POST {{baseUrl}}/api/user/dev-login
Content-Type: application/json

{
  "deviceId": "test-device-123"
}
```

### 获取用户信息

```
GET {{baseUrl}}/api/user/profile
Authorization: Bearer {{token}}
```

### 获取学习统计

```
GET {{baseUrl}}/api/statistics
Authorization: Bearer {{token}}
```

### 获取学习进度

```
GET {{baseUrl}}/api/statistics/progress
Authorization: Bearer {{token}}
```

## 联系与支持

如有接口相关问题，请联系后端开发团队。
