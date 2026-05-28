# 飞书机器人聊天编排入口方案

## 总体方案

采用“桌面端长连接客户端 + 本地编排适配器 + 飞书 IM 回推”的结构。

- 长连接客户端负责使用用户本机的 `App ID` / `App Secret` 连接飞书事件通道。
- 事件处理层负责解析 `im.message.receive_v1`、去重、过滤机器人自身消息和提取聊天上下文。
- 编排适配器负责把飞书文本转换为 Orca orchestration run / gate resolve / run stop / run status。
- 通知层负责通过飞书 OpenAPI 向原 chat 回发文本或互动卡片。
- 设置页只展示本机私有连接状态，不展示或保存团队公共密钥。

## 模块设计

### 1. 飞书长连接客户端

新增 `src/main/runtime/integrations/feishu/bot-event-client.ts`。

职责：

- 懒加载或直接接入飞书 Node SDK 的 `WSClient`。
- 根据 `FeishuIntegrationSettings` 创建、启动、停止长连接。
- 暴露状态：`idle`、`connecting`、`connected`、`failed`、`stopped`。
- 记录 `lastConnectedAt`、`lastEventAt`、`lastError`。
- 对 `im.message.receive_v1` 调用统一 event handler。

边界：

- 不在 event handler 中直接执行长任务。
- SDK 缺失、凭证错误、权限不足、网络断开都转成可显示状态。

### 2. 飞书 IM 客户端

新增 `src/main/runtime/integrations/feishu/im-client.ts`。

职责：

- 复用 tenant access token 获取逻辑。
- 封装 `im/v1/messages` 发送文本和互动卡片。
- 统一处理飞书错误码、网络错误和 token 过期重试。
- 所有发送内容先经过 sanitizer。

### 3. 消息命令解析

新增 `src/main/runtime/integrations/feishu/bot-command.ts`。

首版规则：

- `状态` / `status`：查询当前 active run。
- `停止` / `stop`：停止当前 active run。
- `帮助` / `help`：回发可用命令。
- `继续 <内容>`：作为 gate resolution 或补充指令。
- 其他非空文本：创建新 run，`spec = 原始文本`。

解析结果使用显式 union 类型，避免在编排适配器里散落字符串判断。

### 4. 编排适配器

新增 `src/main/runtime/integrations/feishu/bot-orchestrator.ts`。

职责：

- 接收 `FeishuReceivedMessage` 和解析后的命令。
- 通过现有 orchestration DB 和 Coordinator 创建 `source=feishu` 的 run。
- 建立 `messageId/chatId/runId` 关联，防止重复消息重复创建 run。
- active run 存在时给出明确回执，不自动并行创建第二个 run。
- gate pending 时把用户回复映射到 `resolveFeishuDecisionGate`。

实现策略：

- 首阶段优先复用 `orchestration.run` 内部同等逻辑，必要时抽出 `startCoordinatorRun` 共享函数，避免 RPC handler 和飞书入口各写一份启动逻辑。
- 保留 `Coordinator` 单 active run 约束。
- 创建 run 后立即回发“已创建 runId”，后续状态由 watcher 回推。

### 5. 运行状态回推

新增 `src/main/runtime/integrations/feishu/run-status-publisher.ts`。

职责：

- 监听或轮询 orchestration DB 中 active run/task/gate 的变化。
- 生成简短状态文本或 `buildFeishuRunStatusCard` 卡片。
- 对高频变化做节流，避免刷屏。
- completed/failed/blocked/waiting gate 立即发送。

首版状态：

- run created。
- task dispatched / completed / failed。
- gate pending。
- run completed / failed / stopped。

### 6. 设置页与 IPC

扩展当前飞书设置：

- 按钮：`连接机器人`、`断开连接`、`重新连接`。
- 状态：凭证验证和事件通道分开展示。
- 诊断：最近连接时间、最近事件时间、最近错误。

新增 IPC：

- `settings:feishuBotGetStatus`
- `settings:feishuBotStart`
- `settings:feishuBotStop`

主进程负责持有服务实例，renderer 只展示状态和触发操作。

### 7. 文档与排障

更新 `docs/helloagents-orca-user-guide.md`：

- 说明长连接模式需要用户在飞书后台启用事件订阅和权限。
- 说明 Orca 不需要回调 URL，但要求桌面端保持运行。
- 说明同一飞书 App 不建议多人共用。
- 说明连接成功、凭证成功、权限失败、无事件到达的区别。

## 数据与安全

- `App Secret` 继续只保存在本机加密设置中。
- token 只放内存缓存，不写入持久化文件。
- chatId、messageId、runId 可以保存在本地 orchestration 关联表或轻量 store 中，用于回推和去重。
- 飞书消息文本进入 run 前做基础脱敏，但保留用户真实需求语义。
- 回发飞书的所有 run/task/artifact 内容必须通过现有 sanitizer。

## 风险与控制

- SDK 增加依赖可能涉及网络下载。
  - 控制：优先使用官方 SDK；下载失败时切换 npm 镜像源；把失败原因列出。
- 长连接真实联调依赖用户飞书应用权限。
  - 控制：单元测试用 mock client 覆盖；真实联调用设置页诊断定位权限/连接问题。
- 消息重推导致重复执行。
  - 控制：messageId 去重，run 创建前检查 active run。
- 状态更新刷屏。
  - 控制：状态节流，同类状态合并，终态立即发送。
- 多人共享同一机器人导致事件随机落到某台机器。
  - 控制：文档和设置页提示每人配置自己的机器人应用。

## 验证策略

- 单元测试：
  - 命令解析。
  - 消息去重。
  - active run 冲突处理。
  - gate 回复解析。
  - IM 发送 payload。
  - 状态卡片脱敏。
- mocked 集成测试：
  - 模拟飞书消息事件，创建 `source=feishu` run。
  - 模拟 pending gate，飞书回复后 resolve。
  - 模拟 run 状态变化，publisher 发送状态更新。
- 类型检查：
  - `corepack pnpm run typecheck:node`
  - `corepack pnpm run typecheck:web`
- 真实联调：
  - 使用用户自己的飞书机器人 App，设置页连接长连接。
  - 在飞书聊天发送任务，确认 Orca 创建 run 并回发 runId。
