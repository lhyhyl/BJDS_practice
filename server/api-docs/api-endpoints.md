# 刷题小程序 API 接口文档

## 用户管理

### 自动登录(一键登录)

- **URL**: `/api/user/auto-login`
- **方法**: `POST`
- **认证**: 不需要
- **描述**: 使用设备号码一键登录

**请求参数**:

```json
{
  "authResult": "mock_auth_result_from_device"  // 设备SDK返回的认证结果
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "message": "自动登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "nickname": "用户001",
      "phone": "13800138000",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

**错误响应**:

- `400`: 参数错误
- `500`: 服务器错误或解析手机号失败

---

### 开发环境登录

- **URL**: `/api/user/dev-login`
- **方法**: `POST`
- **认证**: 不需要
- **描述**: 开发环境使用的登录接口，用于测试

**请求参数**:

```json
{
  "deviceId": "test-device-123"  // 设备标识，用于区分不同设备
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "message": "开发环境登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "nickname": "测试用户",
      "phone": "13800138000",
      "avatar": ""
    }
  }
}
```

**错误响应**:

- `400`: 参数错误
- `403`: 非开发环境禁止访问
- `500`: 服务器错误

---

### 获取用户信息

- **URL**: `/api/user/profile`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取当前登录用户的信息

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "nickname": "用户001",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "totalQuestions": 100,
    "correctCount": 80,
    "streak": 5
  }
}
```

**错误响应**:

- `401`: 未授权
- `404`: 用户不存在
- `500`: 服务器错误

---

### 更新用户信息

- **URL**: `/api/user/profile`
- **方法**: `PUT`
- **认证**: 需要
- **描述**: 更新用户基本信息

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "message": "更新用户信息成功"
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 更新用户设置

- **URL**: `/api/user/settings`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 更新用户设置

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```json
{
  "settings": {
    "darkMode": true,
    "notification": true,
    "sound": false
  }
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "message": "设置更新成功"
}
```

**错误响应**:

- `400`: 参数错误
- `401`: 未授权
- `500`: 服务器错误

---

## 数据统计

### 获取学习统计

- **URL**: `/api/statistics`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户的学习统计数据

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "message": "获取统计信息成功",
  "data": {
    "totalQuestions": 100,
    "totalTime": 240,
    "correctRate": 85,
    "subjectStats": [
      {
        "subjectId": 1,
        "subjectName": "高等数学",
        "questionCount": 50,
        "correctRate": 80
      },
      {
        "subjectId": 2,
        "subjectName": "线性代数",
        "questionCount": 30,
        "correctRate": 90
      }
    ],
    "dailyStats": [
      {
        "date": "2023-08-01",
        "questionCount": 20,
        "correctCount": 15
      },
      {
        "date": "2023-08-02",
        "questionCount": 30,
        "correctCount": 28
      }
    ]
  }
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 获取科目统计

- **URL**: `/api/statistics/:id`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取特定科目的统计数据

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:

- `id`: 科目ID

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "message": "获取科目统计信息成功",
  "data": {
    "subject": "高等数学",
    "totalQuestions": 50,
    "correctCount": 40,
    "correctRate": 80,
    "averageTime": 45.5,
    "recentRecords": [
      {
        "id": 1,
        "questionId": 101,
        "question": "...",
        "answer": "...",
        "isCorrect": true,
        "time": 35,
        "date": "2023-08-03T10:30:00Z"
      }
    ]
  }
}
```

**错误响应**:

- `400`: 参数错误
- `401`: 未授权
- `404`: 科目不存在
- `500`: 服务器错误

---

### 获取学习进度

- **URL**: `/api/statistics/progress`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户各科目的学习进度

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "message": "获取学习进度成功",
  "data": [
    {
      "id": 1,
      "name": "高等数学",
      "total": 100,
      "answered": 50,
      "progress": 50
    },
    {
      "id": 2,
      "name": "线性代数",
      "total": 80,
      "answered": 20,
      "progress": 25
    }
  ]
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 获取用户统计数据

- **URL**: `/api/user/statistics`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户在各科目上的统计数据

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "message": "获取用户统计数据成功",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "subjectId": 1,
      "totalQuestions": 50,
      "correctCount": 40,
      "wrongCount": 10,
      "Subject": {
        "id": 1,
        "name": "高等数学",
        "code": "MATH"
      }
    },
    {
      "id": 2,
      "userId": 1,
      "subjectId": 2,
      "totalQuestions": 30,
      "correctCount": 25,
      "wrongCount": 5,
      "Subject": {
        "id": 2,
        "name": "线性代数",
        "code": "LINEAR"
      }
    }
  ]
}
```

**错误响应**:

- `401`: 未授权
- `404`: 未找到用户统计数据
- `500`: 服务器错误

---

### 获取用户特定科目统计数据

- **URL**: `/api/user/statistics/:subjectId`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户在特定科目上的统计数据

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**路径参数**:

- `subjectId`: 科目ID

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "message": "获取用户科目统计数据成功",
  "data": {
    "id": 1,
    "userId": 1,
    "subjectId": 1,
    "questionCount": 50,
    "correctCount": 40,
    "timeSpent": 3600,
    "lastPracticeAt": "2023-09-01T14:30:00Z",
    "Subject": {
      "id": 1,
      "name": "高等数学",
      "code": "MATH"
    }
  }
}
```

**错误响应**:

- `400`: 科目ID不能为空
- `401`: 未授权
- `404`: 未找到用户科目统计数据
- `500`: 服务器错误

---

### 更新用户统计数据

- **URL**: `/api/user/statistics`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 更新用户的科目学习统计数据

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```json
{
  "subjectId": 1,           // 科目ID，必填
  "questionCount": 10,      // 答题数量，选填，默认0
  "correctCount": 8,        // 正确题数，选填，默认0
  "timeSpent": 600          // 学习时间(秒)，选填，默认0
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "message": "更新用户统计数据成功",
  "data": {
    "id": 1,
    "userId": 1,
    "subjectId": 1,
    "questionCount": 60,      // 累计值
    "correctCount": 48,       // 累计值
    "timeSpent": 4200,        // 累计值
    "lastPracticeAt": "2023-09-05T10:15:00Z"
  }
}
```

**错误响应**:

- `400`: 科目ID不能为空
- `401`: 未授权
- `404`: 科目不存在
- `500`: 服务器错误
