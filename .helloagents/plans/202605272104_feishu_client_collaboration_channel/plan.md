# 飞书客户端协作通道方案

## 设计判断

有必要增加客户端可见的飞书协作通道。原因是当前“长连接成功”只证明后台链路通，但用户无法看见消息、回复消息或确认任务从哪里来，产品上还没有形成闭环。

完整版不应做成通用飞书 IM，而应做成 Orca 的“任务协作通道”：围绕消息接收、任务创建、状态同步、人工确认和诊断展开。

## 总体架构

采用五层结构：

- 飞书事件层：长连接接收 `im.message.receive_v1`。
- 本地通道层：消息入库、去重、会话聚合、状态更新、订阅推送。
- 编排桥接层：消息转 run、run 状态转飞书消息、gate 回复映射。
- 飞书发送层：文本/卡片发送、失败归一化、发送状态回写。
- 客户端 UI 层：会话列表、消息流、回复输入、任务操作、诊断面板。

现有 `FeishuBotService` 继续负责长连接生命周期，但不再只把消息直接丢给 `bot-orchestrator`。新流程为：

```text
Feishu WS event
  -> extractReceivedMessage
  -> FeishuConversationStore.upsertIncoming
  -> renderer subscription event
  -> FeishuBotOrchestrator.receiveMessage
  -> start/status/stop/gate
  -> Feishu IM reply/card
  -> FeishuConversationStore.upsertOutgoing/status
  -> renderer subscription event
```

## 数据模型

新增 shared 类型文件：`src/shared/feishu-collaboration-types.ts`。

核心类型：

- `FeishuChannelMessage`
  - `id`
  - `direction: "incoming" | "outgoing" | "system"`
  - `kind: "text" | "status" | "card" | "error"`
  - `chatId`
  - `messageId?`
  - `senderOpenId?`
  - `senderName?`
  - `text`
  - `status: "received" | "queued" | "processing" | "sent" | "failed" | "ignored"`
  - `runId?`
  - `taskId?`
  - `gateId?`
  - `error?`
  - `createdAt`
  - `updatedAt`

- `FeishuChannelConversation`
  - `chatId`
  - `title`
  - `lastMessageText`
  - `lastMessageAt`
  - `unreadCount`
  - `activeRunId?`
  - `lastError?`

- `FeishuChannelStatus`
  - 当前 bot connection status
  - `lastIncomingAt`
  - `lastOutgoingAt`
  - `lastSendError`
  - `storedMessageCount`

## 本地存储

新增 `src/main/runtime/integrations/feishu/channel-store.ts`。

首版建议使用内存 + 持久化快照，原因：

- 消息是协作上下文，不是项目事实源。
- 初期避免迁移 orchestration sqlite schema 造成过大变更。
- 可以按容量裁剪，降低隐私和磁盘增长风险。

存储策略：

- 默认保存最近 500 条消息或最近 30 天消息，取更严格者。
- App Secret、tenant token 不入库。
- message body 只保存文本摘要和必要 metadata。
- 后续如需要跨设备或强审计，再迁移到 SQLite。

若现有 orchestration DB 已有稳定迁移机制，也可以在开发阶段评估改用 SQLite 表：

- `feishu_conversations`
- `feishu_messages`
- `feishu_run_links`

## 主进程服务

新增 `src/main/runtime/integrations/feishu/channel-service.ts`。

职责：

- 持有 `FeishuConversationStore`。
- 接收 incoming 消息并入库。
- 调用现有 `FeishuBotOrchestrator`。
- 发送 outgoing 回复并更新发送状态。
- 提供 list/get/send/markRead/getStatus API。
- 对 renderer 订阅者广播变更。

`FeishuBotService` 调整：

- `start(settings)` 创建 message client、channel service、orchestrator。
- `onMessage` 先调用 channel service 入库，再异步交给 orchestrator。
- `stop()` 不清空消息，仅更新连接状态。

`FeishuBotOrchestrator` 调整：

- 增加可选 callbacks：
  - `onIncomingProcessing`
  - `onRunLinked`
  - `onReplySent`
  - `onReplyFailed`
- 所有自动回发都通过 channel service 的发送包装，确保本地消息流能看见。

`run-status-publisher` 调整：

- 发送飞书卡片成功/失败都写入 channel store。
- 对应 `runId` 的状态消息可在客户端消息流中展示。

## RPC / IPC 设计

新增 preload API：

- `feishuChannelListConversations(): Promise<FeishuChannelConversation[]>`
- `feishuChannelListMessages(chatId: string): Promise<FeishuChannelMessage[]>`
- `feishuChannelSendMessage(params: { chatId: string; text: string }): Promise<FeishuChannelMessage>`
- `feishuChannelCreateRunFromMessage(params: { messageId: string }): Promise<{ runId: string }>`
- `feishuChannelStopRun(params: { runId: string }): Promise<{ ok: true }>`
- `feishuChannelMarkRead(params: { chatId: string }): Promise<{ ok: true }>`
- `feishuChannelGetStatus(): Promise<FeishuChannelStatus>`
- `feishuChannelSubscribe(callback): unsubscribe`

主进程 IPC：

- `feishu-channel:list-conversations`
- `feishu-channel:list-messages`
- `feishu-channel:send-message`
- `feishu-channel:create-run-from-message`
- `feishu-channel:stop-run`
- `feishu-channel:mark-read`
- `feishu-channel:get-status`
- `feishu-channel:event`

## 客户端 UI

新增入口建议放在右侧工作区或 Integrations 设置旁的运行态入口，名称为“飞书通道”。

首版 UI 结构：

- 顶部状态条：
  - 凭证状态
  - 事件通道状态
  - 最近事件
  - 最近发送失败
  - 连接/断开/重新连接按钮

- 左侧会话列表：
  - 会话标题
  - 最后一条消息
  - 未读数
  - active run 标记

- 右侧消息流：
  - incoming：飞书用户消息
  - outgoing：Orca 回复
  - system/status：任务状态、错误、诊断
  - 消息操作：转为任务、复制、查看 run

- 底部输入框：
  - 输入回复
  - 发送按钮
  - 发送中/失败重试

中文文案原则：

- “连接成功”只用于事件通道真的 connected。
- “凭证有效”只表示 App ID / App Secret 可换 token。
- “未收到事件”要明确提示可能是权限、事件订阅、机器人未进群或同 App 被其他客户端消费。
- “回复失败”要展示飞书错误摘要，不展示 token 或 secret。

## 编排交互

消息到任务：

- 自动模式：非命令文本继续按当前逻辑创建 run。
- 手动模式：设置项允许“只入库，不自动执行”，用户点击“转为任务”创建 run。
- 默认建议：先保留自动执行开关，默认打开以保持现有行为；UI 上明确显示“已自动转为任务”。

run 到消息：

- 创建 run：本地和飞书各显示一条状态。
- task dispatched/completed/failed：节流合并显示。
- gate pending：立即显示，客户端可点选项，飞书可回复“继续 ...”。
- completed/failed/stopped：立即显示终态。

active run 冲突：

- 若已有 active run，新飞书任务不创建 run。
- 本地消息状态标为 `ignored` 或 `failed`，原因显示“已有任务执行中”。
- 飞书回发同样提示状态和可用操作。

## 安全与隐私

- App Secret 和 tenant token 不进入 channel store。
- 飞书回发内容统一走 sanitizer。
- 本地消息文本按容量裁剪。
- 错误信息分为：
  - 用户可见摘要。
  - 开发日志详情。
- 不在飞书消息中暴露本机绝对路径，必要时显示 repo name / worktree label。

## 验证策略

单元测试：

- `channel-store.test.ts`
  - 入库、去重、会话聚合、容量裁剪、mark read。
- `channel-service.test.ts`
  - incoming 入库、outgoing 发送状态、失败回写、订阅事件。
- `bot-orchestrator.test.ts`
  - run link callback、active run 冲突状态回写。
- `run-status-publisher.test.ts`
  - 飞书发送与本地 status 消息同步。
- renderer tests：
  - 飞书通道空状态、消息流、发送失败、转任务按钮。
- i18n tests：
  - `messages.feishuChannel` 中英文完整。

集成验证：

- mock 飞书事件 -> Orca 客户端订阅收到 incoming。
- 客户端 send -> mock IM client 收到 payload -> outgoing 状态 sent。
- mock IM send fail -> outgoing 状态 failed。
- incoming 默认创建 run -> message 关联 runId。
- run status publisher -> 本地消息流出现 status。

手工联调：

- 设置页填入 App ID / App Secret。
- 启动事件通道。
- 飞书群聊发送“帮助”。
- Orca 客户端飞书通道出现消息。
- Orca 客户端回复飞书。
- 飞书发送普通任务，Orca 创建 run 并两端显示状态。

## 分阶段交付

第一阶段：消息可见与可回复。

- 本地 channel store。
- IPC/preload。
- 客户端飞书通道 UI。
- incoming/outgoing 消息同步。

第二阶段：任务闭环。

- 消息转 run。
- runId/gate/task 关联。
- run status 本地同步。
- active run 冲突可见。

第三阶段：诊断与体验。

- 连接诊断面板。
- 未收到事件排查提示。
- 发送失败重试。
- 自动执行开关。

第四阶段：质量收口。

- i18n 全覆盖。
- 单元测试与 mocked 集成测试。
- 使用指南更新。
- 真实联调 checklist。

