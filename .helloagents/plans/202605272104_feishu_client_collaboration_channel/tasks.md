# 飞书客户端协作通道任务拆分

## LIVE_STATUS

- status: in_progress
- completed: 12
- failed: 0
- pending: 6
- total: 18
- percent: 67
- current: 已完成实时订阅、自动选中真实会话、飞书消息主 Agent 判断与任务创建状态回写，待补完整 run/gate 操作和文档

## Tasks

- [√] T01 现状核对与边界确认：确认现有 FeishuBotService、bot-orchestrator、IM client、run-status-publisher 与设置页能力，明确不重复实现的部分。 | depends_on: []
- [√] T02 共享类型定义：新增 `feishu-collaboration-types.ts`，定义 conversation/message/status/event/API params。 | depends_on: [T01]
- [√] T03 本地消息存储：实现 `channel-store.ts`，支持 incoming/outgoing/status 入库、messageId 去重、会话聚合、mark read、容量裁剪。 | depends_on: [T02]
- [√] T04 通道服务：实现 `channel-service.ts`，封装 incoming 入库、outgoing 发送、失败回写、订阅广播、状态汇总。 | depends_on: [T03]
- [√] T05 FeishuBotService 接入：长连接 `onMessage` 先进入 channel service，再异步触发现有 orchestrator。 | depends_on: [T04]
- [√] T06 编排适配器回调：为 `bot-orchestrator` 增加 run link / processing / reply status 回调，让本地消息流能反映自动处理结果。 | depends_on: [T04]
- [ ] T07 状态回推本地同步：扩展 `run-status-publisher`，飞书状态卡片发送成功/失败时写入本地 channel 消息。 | depends_on: [T04]
- [√] T08 IPC 与 preload：新增 `feishu-channel:*` IPC、preload API 和类型声明。 | depends_on: [T04]
- [√] T09 renderer 状态接入：新增飞书通道数据 hook/store，支持 list conversations、list messages、subscribe、send、mark read、create run。 | depends_on: [T08]
- [√] T10 飞书通道 UI：新增会话列表、消息流、状态条、回复输入框、消息操作按钮。 | depends_on: [T09]
- [√] T11 消息转任务：实现客户端“转为任务”，复用现有 `startCoordinatorRun` 和 active run 约束；飞书入站消息也会先由主 Agent 判断是否应自动创建开发任务。 | depends_on: [T06, T08, T10]
- [ ] T12 gate 与 run 操作：支持从客户端查看 run、停止 run、回复 pending gate。 | depends_on: [T07, T10]
- [ ] T13 设置页补强：在 Integrations/Feishu 区域加入“打开飞书通道”、自动执行开关、未收到事件诊断入口。 | depends_on: [T10]
- [√] T14 i18n 文案：新增 `feishuChannel` 消息领域，覆盖通道 UI、诊断、错误、按钮、空状态，中英文完整。 | depends_on: [T10, T13]
- [√] T15 单元测试：覆盖 channel store、channel service、orchestrator callbacks、bot-service 入站状态回写、IPC handler。publisher 本地同步另随 T07 补。 | depends_on: [T03, T04, T06, T07, T08]
- [ ] T16 renderer 测试：覆盖空状态、消息展示、发送失败、转任务、状态条和 i18n。 | depends_on: [T10, T14]
- [ ] T17 文档更新：更新 `docs/helloagents-orca-user-guide.md`，说明飞书通道、权限边界、排障、每人独立机器人 App。 | depends_on: [T13]
- [ ] T18 验证与收尾：运行 `typecheck:node`、`typecheck:web`、`check:i18n-copy`、相关 vitest，更新状态和恢复快照。 | depends_on: [T15, T16, T17]

## 执行日志

- 2026-05-27 21:04 创建方案包。结论：现有飞书机器人编排包已解决“事件驱动任务”，但缺少客户端可见的消息/回复/诊断通道，本包补齐产品闭环。
- 2026-05-28 12:35 完成首版飞书客户端通道：新增 shared 协议类型、主进程 channel store/service、FeishuBotService 入库接入、`feishu-channel:*` IPC/preload、renderer 飞书通道页面、设置页“打开飞书通道”入口和 `feishuChannel` 中英文文案；`typecheck:node`、`typecheck:web`、`check:i18n-copy`、channel store/service vitest 均通过。
- 2026-06-02 10:20 完成实时通信与主 Agent 判断闭环：修复订阅初始快照竞态，renderer 收到事件自动更新并切到真实会话；新增飞书开发任务意图判断，闲聊只记录，明确开发任务自动进入主 Agent run；消息流显示“已交给主 Agent / 已记录，未创建任务”等状态。飞书相关 vitest、`typecheck:node`、`typecheck:web` 均通过。
- 2026-06-02 10:30 收紧飞书自动建任务策略：普通文本和 `任务 ...` 不再自动创建 run，避免测试/闲聊误触发编排失败；仅 `转为任务`、`创建任务`、`开发任务`、`run`、`/run` 显式前缀自动建任务。聊天框“转为任务”按钮只对未处理的入站消息显示。

## 验收清单

- [√] 飞书发来的文本消息能在 Orca 客户端飞书通道实时出现。
- [√] Orca 客户端能向原飞书 chat 回复文本，并显示发送状态。
- [√] 飞书消息能创建或关联 `source=feishu` 的 run。
- [ ] run 状态、gate pending、失败、完成能同时在飞书和客户端消息流可见。
- [ ] active run 冲突不会重复创建任务，且两端提示清楚。
- [ ] 连接诊断能区分凭证、事件通道、最近事件、最近发送失败。
- [√] 中文文案自然准确，无明显英文残留。
- [ ] 所有约定验证命令通过。（本轮已通过飞书相关 vitest、`typecheck:node`、`typecheck:web`；完整收尾仍待 T16/T17 后执行）
