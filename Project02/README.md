# Project02 - AI 电商客服助手（Vue3 + TS）

这是一个面向前端实习投递的第二项目模板，目标是做出“不是纯聊天壳”的 AI 项目。

你可以把它理解成：

- 一个支持多轮会话的 AI 聊天页面
- 一个后端代理层（保护 API Key，不暴露到前端）
- 一个可演示的工具调用（查订单状态）
- 一个有错误态、限流提示、重试机制的“可上线雏形”

---

## 1. 项目亮点（写简历可直接用）

- `SSE 流式响应`：消息边生成边显示
- `多轮上下文`：每个会话保留历史消息
- `Markdown + 代码高亮`：支持富文本回答
- `会话持久化`：本地存储会话列表与消息
- `后端代理`：OpenAI Key 在后端 `.env` 中
- `工具调用`：识别“订单 20260001”并返回订单状态
- `工程化`：前后端分离、TypeScript、可一键启动

---

## 2. 项目结构

```txt
Project02
├─ backend                  # Node + Express + TS
│  ├─ src
│  │  ├─ data/mockOrders.ts
│  │  ├─ lib/chatEngine.ts
│  │  ├─ lib/orderTool.ts
│  │  ├─ lib/rateLimit.ts
│  │  ├─ server.ts
│  │  └─ types.ts
│  ├─ .env.example
│  ├─ package.json
│  └─ tsconfig.json
├─ frontend                 # Vue3 + TS + Vite
│  ├─ src
│  │  ├─ api/chat.ts
│  │  ├─ components/MarkdownMessage.vue
│  │  ├─ types/chat.ts
│  │  ├─ utils/id.ts
│  │  ├─ utils/markdown.ts
│  │  ├─ App.vue
│  │  ├─ main.ts
│  │  └─ style.css
│  ├─ .env.example
│  └─ package.json
├─ package.json             # 根脚本（同时启动前后端）
└─ README.md
```

---

## 3. 环境要求

- Node.js `>= 20`
- npm `>= 10`

---

## 4. 启动步骤（按顺序）

### 4.1 安装依赖

在项目根目录执行：

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4.2 配置环境变量

1. 复制后端环境文件：

```bash
copy backend\\.env.example backend\\.env
```

2. 复制前端环境文件：

```bash
copy frontend\\.env.example frontend\\.env
```

3. 如果你暂时没有 OpenAI Key，也可以直接跑（后端会走 mock 回复模式）。

### 4.3 一键启动

```bash
npm run dev
```

启动后：

- 前端: `http://localhost:5173`
- 后端: `http://localhost:3000`

---

## 5. 使用说明（演示脚本）

### 5.1 普通对话

输入任何问题，查看流式输出效果。

### 5.2 工具调用演示（重点）

在输入框发送：

```txt
帮我查订单 20260001
```

你会看到：

- 先出现工具消息（订单号、状态、更新时间等）
- 然后 AI 基于工具结果生成回答

### 5.3 错误态和限流演示

连续快速发送多条请求，会触发 429 限流提示；页面有错误展示和“重试上次请求”按钮。

---

## 6. 接口文档（最小版本）

### 6.1 健康检查

- `GET /api/health`

响应示例：

```json
{
  "ok": true,
  "now": "2026-04-17T03:00:00.000Z",
  "mode": "mock"
}
```

### 6.2 流式聊天

- `POST /api/chat/stream`
- `Content-Type: application/json`

请求体：

```json
{
  "conversationId": "conv_123",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "帮我查订单 20260001",
      "createdAt": "2026-04-17T03:00:00.000Z"
    }
  ]
}
```

SSE 事件：

- `event: tool` 工具调用结果
- `event: chunk` 文本增量分片
- `event: done` 流结束
- `event: error` 流内错误

### 6.3 非流式聊天

- `POST /api/chat`
- 返回完整回答（用于调试）

### 6.4 工具接口（可单独测试）

- `GET /api/tools/order-status/:orderId`

---

## 7. 你可以怎么继续扩展（按优先级）

1. 接入真实登录态（JWT + refresh token）
2. 会话标题自动摘要（由模型生成）
3. 文件上传 + OCR（例如上传快递单）
4. 商品知识库检索（RAG）
5. 更细粒度权限（客服/管理员）
6. 埋点与性能监控（首屏、TTI、错误率）

---

## 8. 面试如何讲这个项目

可以用这三句话：

1. 这是一个前后端分离的 AI 客服项目，核心是流式输出和会话状态管理。  
2. 后端做代理层并实现了工具调用与限流，保证密钥安全和服务可控。  
3. 前端重点处理了消息持久化、流式增量渲染、错误重试和交互体验。

---

## 9. 常见问题

### Q1: 没有 OpenAI API Key 可以跑吗？

可以。后端会自动切到 mock 模式，完整流程都能演示。

### Q2: 这个项目够投实习吗？

作为第二项目足够好，前提是你自己能清楚解释：

- 为什么要后端代理
- SSE 怎么解析
- 工具调用流程怎么串起来
- 错误与限流怎么处理

### Q3: 我不会写接口文档怎么办？

先用本 README 的“接口文档最小版本”。投递阶段有这个就比很多同学强。

