# 飞书机器人聊天编排入口任务拆分

## LIVE_STATUS

- status: completed
- completed: 14
- failed: 0
- pending: 0
- total: 14
- percent: 100
- current: 已完成

## Tasks

- [√] T01 依赖与 SDK 调研：确认飞书官方 Node SDK 包名、长连接 `WSClient` API、消息发送 API 和类型导入方式。 | depends_on: []
- [√] T02 配置类型扩展：为飞书机器人事件通道增加本机状态字段和必要设置字段，保持密钥只本机加密保存。 | depends_on: [T01]
- [√] T03 IM 客户端：实现 tenant token 复用、文本消息发送、互动卡片发送、错误归一化和测试。 | depends_on: [T01]
- [√] T04 命令解析：实现 `状态/status`、`停止/stop`、`帮助/help`、`继续`、默认创建任务的解析与测试。 | depends_on: []
- [√] T05 长连接客户端：实现飞书事件通道 start/stop/status，接入 `im.message.receive_v1`，支持 mock 注入测试。 | depends_on: [T01, T02]
- [√] T06 消息去重与上下文关联：记录 `messageId/chatId/runId`，防止重复事件重复创建 run。 | depends_on: [T03, T04]
- [√] T07 编排启动抽取：把 `orchestration.run` 中创建 run + Coordinator 启动逻辑抽成可被 RPC 和飞书入口复用的服务。 | depends_on: []
- [√] T08 飞书编排适配器：把聊天消息映射为 run/status/stop/gate resolve，并回发即时结果。 | depends_on: [T03, T04, T06, T07]
- [√] T09 状态回推：实现 run/task/gate 状态 publisher，节流发送飞书文本或卡片。 | depends_on: [T03, T08]
- [√] T10 设置页 IPC：新增 `feishuBotGetStatus/start/stop`，主进程持有服务实例并随设置变更更新状态。 | depends_on: [T05, T08]
- [√] T11 设置页 UI：把“凭证验证”和“事件通道”改为真实状态与操作按钮，中文文案自然准确。 | depends_on: [T10]
- [√] T12 文档更新：更新使用指南，说明飞书后台权限、长连接模式、每人独立机器人、常见失败原因。 | depends_on: [T05, T11]
- [√] T13 集成测试：覆盖消息创建 run、active run 冲突、gate resolve、状态回推、脱敏。 | depends_on: [T08, T09]
- [√] T14 验证与收尾：运行 node/web typecheck、相关 vitest、必要 lint，更新方案包状态。 | depends_on: [T11, T12, T13]

## 执行日志

- 2026-05-27 14:09 创建方案包，完成需求和方案设计。
- 2026-05-27 14:43 完成 T01/T03/T04：安装 `@larksuiteoapi/node-sdk@1.65.0`，实现 IM 发送客户端和飞书聊天命令解析；相关 vitest 与 `typecheck:node` 通过。
- 2026-05-27 14:45 完成 T07：抽取 `orchestration/run-service.ts` 供 RPC 和飞书入口复用；`typecheck:node` 通过。`orchestration.test.ts` 因 better-sqlite3 Electron/Node ABI 不匹配暂未运行通过，需 Node ABI rebuild 后重测。
- 2026-05-27 14:49 完成 T05/T08 基础实现：新增飞书长连接客户端和聊天编排适配器；重建 Node ABI 后，飞书模块与 orchestration RPC 测试通过，`typecheck:node` 通过。
- 2026-05-27 15:07 完成 T02/T06/T09/T10/T11/T12：新增飞书机器人状态类型、消息去重、状态卡片 publisher、settings IPC、设置页连接控制和使用指南更新；`typecheck:node`、`typecheck:web`、`check:i18n-copy` 通过。
- 2026-05-27 15:08 完成 T13/T14：`src/main/runtime/integrations/feishu`、`orchestration.test.ts`、`i18n.test.ts` 共 11 个测试文件 118 条测试通过；`typecheck:node`、`typecheck:web` 通过；已恢复 Electron ABI。
