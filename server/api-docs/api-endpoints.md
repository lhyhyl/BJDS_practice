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

## 错题本管理

### 获取错题本列表

- **URL**: `/api/errorbook`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户的错题本列表

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```
page: 1      // 页码，默认为1
pageSize: 10 // 每页数量，默认为10
```

**成功响应** (200):

```json
{
  "code": 0,
  "data": {
    "total": 23,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 42,
        "content": "以下哪个不是JavaScript的基本数据类型?",
        "options": [{"id":"A","content":"String"}, {"id":"B","content":"Number"}, {"id":"C","content":"Boolean"}, {"id":"D","content":"Object"}],
        "answer": "D",
        "analysis": "JavaScript的基本数据类型包括String、Number、Boolean、Null、Undefined和Symbol。Object是引用类型。",
        "subjectId": 1,
        "difficulty": "中等",
        "errorBookId": 5,
        "addedAt": "2023-09-15T08:30:00.000Z"
      },
      // ...更多题目
    ],
    "hasMore": true
  },
  "message": "获取错题本成功"
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 添加题目到错题本

- **URL**: `/api/errorbook`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 手动添加题目到错题本(答错的题目会自动添加)

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```json
{
  "questionId": 42
}
```

**成功响应** (201):

```json
{
  "code": 0,
  "message": "添加到错题本成功",
  "data": {
    "id": 15,
    "userId": 5,
    "questionId": 42,
    "createdAt": "2023-09-15T10:20:30.000Z"
  }
}
```

**错误响应**:

- `400`: 题目ID不能为空
- `404`: 题目不存在
- `409`: 该题目已在错题本中
- `500`: 服务器错误

---

### 从错题本删除题目

- **URL**: `/api/errorbook/:questionId`
- **方法**: `DELETE`
- **认证**: 需要
- **描述**: 从错题本中删除题目

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL参数**:

- `questionId`: 题目ID

**成功响应** (200):

```json
{
  "code": 0,
  "message": "从错题本删除成功"
}
```

**错误响应**:

- `401`: 未授权
- `404`: 错题不存在或已被删除
- `500`: 服务器错误

---

## 收藏管理

### 获取收藏列表

- **URL**: `/api/favorites`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户收藏的题目列表

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```
page: 1      // 页码，默认为1
pageSize: 10 // 每页数量，默认为10
```

**成功响应** (200):

```json
{
  "code": 0,
  "data": {
    "total": 15,
    "totalPages": 2,
    "currentPage": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 42,
        "content": "以下哪个是React的核心概念?",
        "options": [{"id":"A","content":"双向数据绑定"}, {"id":"B","content":"组件化"}, {"id":"C","content":"模块化"}, {"id":"D","content":"类继承"}],
        "answer": "B",
        "analysis": "React的核心概念是组件化，通过组件的方式构建用户界面。",
        "subjectId": 1,
        "difficulty": "简单",
        "favoriteId": 8,
        "addedAt": "2023-09-16T14:25:10.000Z"
      },
      // ...更多题目
    ],
    "hasMore": true
  },
  "message": "获取收藏列表成功"
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 添加题目到收藏

- **URL**: `/api/favorites`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 添加题目到收藏夹

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```json
{
  "questionId": 42
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "message": "收藏成功",
  "data": {
    "id": 12,
    "userId": 5,
    "questionId": 42,
    "createdAt": "2023-09-16T14:25:10.000Z"
  }
}
```

**错误响应**:

- `400`: 问题ID不能为空
- `404`: 问题不存在
- `409`: 该问题已在收藏夹中
- `500`: 服务器错误

---

### 取消收藏题目

- **URL**: `/api/favorites/:questionId`
- **方法**: `DELETE`
- **认证**: 需要
- **描述**: 取消收藏题目

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL参数**:

- `questionId`: 题目ID

**成功响应** (200):

```json
{
  "code": 0,
  "message": "取消收藏成功"
}
```

**错误响应**:

- `401`: 未授权
- `404`: 收藏记录不存在
- `500`: 服务器错误

## 每日一题

### 获取每日一题

- **URL**: `/api/questions/daily`
- **方法**: `GET`
- **认证**: 可选（登录后能查看答题记录）
- **描述**: 获取当日的推荐题目，每天固定一题，所有用户看到相同的题目

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 可选
```

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "data": {
    "id": 125,
    "content": "React中，以下哪种方法可以防止组件重新渲染?",
    "options": [
      {"id":"A","content":"使用useState"},
      {"id":"B","content":"使用useEffect"},
      {"id":"C","content":"使用React.memo"},
      {"id":"D","content":"使用useContext"}
    ],
    "answer": "C",  // 仅已登录用户会看到
    "analysis": "React.memo是一个高阶组件，如果你的组件在相同props的情况下渲染相同的结果，可以将其包裹在React.memo中调用，以此通过记忆组件渲染结果的方式提高组件的性能。",  // 仅已登录用户会看到
    "subjectId": 3,
    "difficulty": "中等",
    "isDaily": true,
    "userAnswer": "A",  // 如果用户已答题
    "isCorrect": false  // 如果用户已答题
  }
}
```

**错误响应**:

- `404`: 未能获取每日一题
- `500`: 服务器错误

---

### 获取每日推荐题目

- **URL**: `/api/questions/daily-list`
- **方法**: `GET`
- **认证**: 可选
- **描述**: 获取当日的一批推荐题目，适合批量练习

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  // 可选
```

**请求参数**:

```
count: 10  // 推荐题目数量，默认10
```

**成功响应** (200):

```json
{
  "code": 0,
  "data": [
    {
      "id": 125,
      "content": "React中，以下哪种方法可以防止组件重新渲染?",
      "options": [
        {"id":"A","content":"使用useState"},
        {"id":"B","content":"使用useEffect"},
        {"id":"C","content":"使用React.memo"},
        {"id":"D","content":"使用useContext"}
      ],
      "answer": "C",
      "subjectId": 3,
      "difficulty": "中等"
    },
    // ...更多推荐题目
  ]
}
```

**错误响应**:

- `500`: 服务器错误

---

## 学习计划

### 获取学习计划列表

- **URL**: `/api/study-plans`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取用户创建的所有学习计划

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**: 无

**成功响应** (200):

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "title": "JavaScript基础巩固",
      "categoryId": 3,
      "days": 7,
      "questionsPerDay": 10,
      "progress": 30,
      "startDate": "2023-09-20T00:00:00.000Z",
      "endDate": null,
      "createdAt": "2023-09-20T00:00:00.000Z",
      "updatedAt": "2023-09-22T00:00:00.000Z",
      "Subject": {
        "name": "JavaScript"
      }
    },
    // ...更多学习计划
  ],
  "message": "获取学习计划成功"
}
```

**错误响应**:

- `401`: 未授权
- `500`: 服务器错误

---

### 创建学习计划

- **URL**: `/api/study-plans`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 创建新的学习计划

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```json
{
  "title": "React学习计划",
  "categoryId": 4,
  "days": 14,
  "questionsPerDay": 5
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "data": {
    "id": 2,
    "userId": 5,
    "title": "React学习计划",
    "categoryId": 4,
    "days": 14,
    "questionsPerDay": 5,
    "progress": 0,
    "startDate": "2023-09-25T00:00:00.000Z",
    "endDate": null,
    "createdAt": "2023-09-25T00:00:00.000Z",
    "updatedAt": "2023-09-25T00:00:00.000Z"
  },
  "message": "创建学习计划成功"
}
```

**错误响应**:

- `400`: 标题和分类不能为空
- `401`: 未授权
- `500`: 服务器错误

---

### 更新学习计划进度

- **URL**: `/api/study-plans/:planId/progress`
- **方法**: `PUT`
- **认证**: 需要
- **描述**: 更新学习计划的完成进度

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL参数**:

- `planId`: 学习计划ID

**请求参数**:

```json
{
  "progress": 45
}
```

**成功响应** (200):

```json
{
  "code": 0,
  "data": {
    "id": 2,
    "userId": 5,
    "title": "React学习计划",
    "categoryId": 4,
    "days": 14,
    "questionsPerDay": 5,
    "progress": 45,
    "startDate": "2023-09-25T00:00:00.000Z",
    "endDate": null,
    "createdAt": "2023-09-25T00:00:00.000Z",
    "updatedAt": "2023-09-27T00:00:00.000Z"
  },
  "message": "更新计划进度成功"
}
```

**错误响应**:

- `400`: 进度值无效
- `401`: 未授权
- `404`: 计划不存在
- `500`: 服务器错误

---

### 删除学习计划

- **URL**: `/api/study-plans/:planId`
- **方法**: `DELETE`
- **认证**: 需要
- **描述**: 删除学习计划

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL参数**:

- `planId`: 学习计划ID

**成功响应** (200):

```json
{
  "code": 0,
  "message": "删除计划成功"
}
```

**错误响应**:

- `401`: 未授权
- `404`: 计划不存在或无权限删除
- `500`: 服务器错误

---

### 获取学习计划题目

- **URL**: `/api/questions/plan`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 根据学习计划获取对应的练习题目

**请求头**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**请求参数**:

```
planId: 2  // 学习计划ID
```

**成功响应** (200):

```json
{
  "code": 0,
  "data": [
    {
      "id": 155,
      "content": "React Hooks的主要优势是什么?",
      "options": [
        {"id":"A","content":"比类组件性能更好"},
        {"id":"B","content":"允许在函数组件中使用状态和其他React特性"},
        {"id":"C","content":"不需要关心组件生命周期"},
        {"id":"D","content":"减少代码量"}
      ],
      "answer": "B",
      "subjectId": 4,
      "difficulty": "简单"
    },
    // ...更多题目
  ],
  "message": "获取计划题目成功"
}
```

**错误响应**:

- `400`: 计划ID不能为空
- `401`: 未授权
- `404`: 计划不存在
- `500`: 服务器错误
