# HelloAGENTS + Orca 集成 — 任务分解

## 拆分原则

- 默认按端到端垂直切片拆分：每个任务交付一个可验证行为，而不是单独交付某一层。
- `AFK` 表示代理可独立完成；`HITL` 表示需要用户决策、外部凭据、人工视觉确认或手动验收。
- 厚任务必须继续拆小；横向前置任务只在确有技术依赖时保留。

## 任务列表

- [√] T01（AFK）：完成现有 orchestration 能力 Spike 和差距报告（依赖：无；涉及文件：`docs/helloagents-orca-spike.md`、`src/main/runtime/orchestration/*` 只读；预期变更：形成复用点、扩展点、风险和测试入口；完成标准：报告明确 DB、Coordinator、preamble、RPC、PTY、SSH、Git provider 的落点；验证方式：文档审阅）

- [√] T02（AFK）：实现 HelloAGENTS 环境探测和启动参数生成（依赖：T01；涉及文件：`src/main/runtime/helloagents/environment.ts`、`src/main/runtime/helloagents/adapter.ts`、`src/main/runtime/helloagents/adapter.test.ts`；预期变更：探测 `helloagents` CLI、Claude/Codex CLI、HelloAGENTS 注入目录、fullstack 全局配置路径；完成标准：正常、缺 CLI、缺配置、SSH workspace 四类 fixture 通过；验证方式：`pnpm vitest run src/main/runtime/helloagents/adapter.test.ts`）

- [√] T03（AFK）：实现 Orchestrator Terminal Manager 最小闭环（依赖：T02；涉及文件：`src/main/runtime/helloagents/orchestrator-terminal.ts`、`src/main/runtime/helloagents/orchestrator-events.ts`、`src/main/runtime/helloagents/orchestrator-terminal.test.ts`；预期变更：创建 Orchestrator Terminal、转发用户输入、读取输出、记录状态；完成标准：同一 run 只有一个 active Orchestrator，崩溃标记 failed，确认消息回灌原 run；验证方式：`pnpm vitest run src/main/runtime/helloagents/adapter.test.ts src/main/runtime/helloagents/orchestrator-terminal.test.ts`、`pnpm run typecheck:node`）

- [√] T04（AFK）：定义 Orchestrator 输出 schema 和解析策略（依赖：T03；涉及文件：`src/main/runtime/helloagents/output-parser.ts`、`src/main/runtime/helloagents/output-parser.test.ts`；预期变更：解析 R0/R1/R2/fullstack、gate、task DAG JSON fenced block、完成/失败状态；完成标准：合法输出入库，非法 JSON 进入 blocked 并要求重写；验证方式：`pnpm vitest run src/main/runtime/helloagents/adapter.test.ts src/main/runtime/helloagents/orchestrator-terminal.test.ts src/main/runtime/helloagents/output-parser.test.ts`、`pnpm run typecheck:node`）

- [√] T05（AFK）：扩展 orchestration DB 和类型以支持 run/mode/artifact/gate（依赖：T04；涉及文件：`src/main/runtime/orchestration/db.ts`、`src/main/runtime/orchestration/types.ts`、`db.test.ts`；预期变更：新增字段或表并提供迁移，记录当前 run 的 task 归属和 artifact 归属；完成标准：旧 DB 可迁移，新 run/task/artifact/gate 可 CRUD；验证方式：`pnpm vitest run src/main/runtime/orchestration/db.test.ts`；当前状态：已通过镜像源重建 `better-sqlite3`，补齐旧库迁移顺序，DB 单测通过）

- [√] T06（AFK）：实现 Worker preamble artifact 协议（依赖：T05；涉及文件：`src/main/runtime/orchestration/preamble.ts`、`preamble.test.ts`、snapshot；预期变更：注入 runId、taskId、repo_name、worktree、允许/禁止路径、心跳、manifest、worker_done 协议；完成标准：snapshot 覆盖 artifact、heartbeat、安全、跨平台、SSH 约束；验证方式：`pnpm vitest run src/main/runtime/orchestration/preamble.test.ts`、`pnpm run typecheck:node`）

- [√] T07（AFK）：实现 artifact manifest 校验和索引（依赖：T06；涉及文件：`src/main/runtime/orchestration/artifacts.ts`、`artifacts.test.ts`；预期变更：读取 `artifacts/{taskId}/manifest.json`，校验 filesChanged、contracts、verification、downstreamNotes；完成标准：缺失或非法 manifest 阻断任务，合法 manifest 入库；验证方式：`pnpm vitest run src/main/runtime/orchestration/artifacts.test.ts`、`pnpm run typecheck:node`）

- [√] T08（AFK）：实现 DAG 环检测、依赖排序和分层并发（依赖：T05；涉及文件：`src/main/runtime/orchestration/dag.ts`、`dag.test.ts`；预期变更：提供 cycle detection、ready layer、max concurrency；完成标准：环、缺依赖、多层依赖、并发上限测试通过；验证方式：`pnpm vitest run src/main/runtime/orchestration/dag.test.ts`；当前状态：已完成并通过 DAG 定向单测、DB+DAG 组合单测和主进程 typecheck）

- [√] T09（AFK）：扩展 Coordinator 支持 R1 单 Worker 闭环（依赖：T03、T06、T07；涉及文件：`src/main/runtime/orchestration/coordinator.ts`、`src/main/runtime/orchestration/coordinator-artifacts.ts`、`coordinator.test.ts`；预期变更：Orchestrator R1 task 创建、dispatch、worker_done、artifact 校验、最终汇总；完成标准：R1 run 从 pending 到 completed，Worker 缺 artifact 时 blocked；验证方式：coordinator 单元测试；当前状态：已强制校验 `worker_done.payload.manifestPath`，合法 manifest 入库，缺 artifact 阻断任务，相关单测通过）

- [√] T10（AFK）：扩展 Coordinator 支持 R2 多 Worker DAG 闭环（依赖：T08、T09；涉及文件：`coordinator.ts`、`dag.ts`、`artifacts.ts`、相关测试；预期变更：按依赖层级 dispatch，上游 artifact 注入下游 preamble；完成标准：下游不会早于依赖 dispatch，失败任务阻断下游，全部完成后 run completed；验证方式：多任务 DAG coordinator 测试；当前状态：已注入上游 artifact 摘要，失败/阻断上游会阻断下游，pending gate blocked 与终态 blocked 已区分，相关单测通过）

- [√] T11（AFK）：实现 Deterministic Persistence v1（依赖：T09；涉及文件：`src/main/runtime/orchestration/persistence.ts`、`src/main/runtime/orchestration/helloagents-files.ts`、`persistence.test.ts`；预期变更：由 DB 导出 `.status.json`、`STATE.md`、`CHANGELOG.md`；完成标准：状态变更触发文件更新，写入失败会 blocked/failed；验证方式：临时目录文件写入测试；当前状态：已实现 run snapshot 构建、三类 HelloAGENTS 文件导出和写入失败返回，相关单测与主进程 typecheck 通过）

- [√] T12（AFK）：实现 plan/tasks.md 和 contract.json 导出（依赖：T10、T11；涉及文件：`persistence.ts`、`helloagents-files.ts`；预期变更：run 完成后从 DB 和 artifact 重建方案任务记录与交付契约；完成标准：导出内容包含 task、依赖、验证结果、失败项；验证方式：persistence fixture 测试；当前状态：已扩展 persistence 文件集，支持导出 `plan.md`、`tasks.md`、`contract.json`，包含任务依赖、结果、artifact、verification 和失败项，相关单测与主进程 typecheck 通过）

- [√] T13（AFK）：接入 `~fullstack` 任务 JSON 到 Orca DAG 的转换（依赖：T10、T12；涉及文件：`src/main/runtime/helloagents/fullstack-adapter.ts`、相关测试；预期变更：读取 HelloAGENTS fullstack task JSON，转换为 Orca tasks/deps/artifacts；完成标准：兼容已有 `.helloagents/fullstack/` 结构，CLI 失败保留 stdout/stderr 摘要；验证方式：fullstack fixture 测试；当前状态：已新增纯转换 adapter，兼容 fullstack `current.json` 的 task map 和数组快照，保留 CLI 失败 stdout/stderr 摘要，并拒绝缺任务、非法 schema 和非法 DAG；定向单测与主进程 typecheck 通过）

- [√] T14（AFK）：实现 Team Config Service schema、飞书知识库/Base 同步、离线缓存和 path resolver（依赖：T01、T17；涉及文件：`src/main/runtime/team-config/schema.ts`、`feishu-base-source.ts`、`cache.ts`、`path-resolver.ts`、`fullstack-yaml-builder.ts`、`team-config.test.ts`；预期变更：以飞书知识库作为团队配置和项目资料入口，从知识库配置节点发现结构化配置 Base；Base 读取服务、角色、依赖、项目能力、默认 agent 和 `repo_name` 等团队公共逻辑配置，离线时读取本地缓存或 `.orca-team.yaml` 快照，并结合个人本机 repo binding 解析 `repo_name`，必要时合成本机 HelloAGENTS `fullstack.yaml` 兼容配置；完成标准：Wiki/Base 可用、Wiki/Base 不可用、缓存命中、快照 fallback、个人绑定缺失、路径冲突、SSH/local、权限不足都有明确结果；验证方式：team config mocked Feishu Wiki/Base + fixture 测试；当前状态：已新增 team-config 模块，完成公共/个人 schema、Feishu Base record mapper/source 接口、本地 cache + `.orca-team.yaml` fallback、repo_name path resolver、fullstack.yaml builder 和单元测试；真实飞书 Wiki/Base API 留接口，测试使用 mocked records；定向单测与主进程 typecheck 通过）

  - [√] T14.1：定义团队公共配置 schema：Repos、Capabilities、Dependencies、Agents、Policies，不包含个人 key 和本机绝对路径。
  - [√] T14.2：定义个人私有配置 schema：个人机器人凭据占位、webhook/tunnel 设置、`repo_name -> local_path/worktree` 绑定。
  - [√] T14.3：实现 Feishu Wiki source 入口约定和 Feishu Base record mapper/source 接口，真实 API 留接口，测试使用 mocked records。
  - [√] T14.4：实现本地缓存和 `.orca-team.yaml` fallback 读写，缓存只保存公共配置快照和非敏感诊断信息。
  - [√] T14.5：实现 path resolver，结合 Orca repo/worktree 列表和个人绑定解析 `repo_name`，覆盖 SSH/local、缺绑定、路径冲突。
  - [√] T14.6：实现 HelloAGENTS `fullstack.yaml` builder，由公共逻辑配置和个人本机绑定合成本机兼容产物。

- [√] T15（AFK）：将 Team Config 和 repo/worktree 解析接入 dispatch（依赖：T10、T14；涉及文件：`coordinator.ts`、runtime dispatch glue；预期变更：task 按 repo_name 解析当前可用 worktree selector 和默认 agent；完成标准：缺 repo 阻断，匹配 repo 正常创建 Worker，SSH/local 场景不会跟随外部绝对路径；验证方式：coordinator + path resolver 集成测试；当前状态：已新增 dispatch target resolver glue，Coordinator 在派发前按 task.repo_name 解析 worktree selector，缺 resolver/缺绑定时阻断任务，匹配 repo 时使用解析出的 worktree 创建 Worker 并写入 preamble；相关单测与主进程 typecheck 通过）

- [√] T16（AFK）：实现 Run 基础 UI 和状态面板（依赖：T05、T11；涉及文件：`src/renderer/src/` 相关组件、store、IPC 类型；预期变更：显示 run list/detail、状态、当前 gate、任务 DAG、artifact、错误；完成标准：loading/empty/waiting/running/blocked/failed/completed 状态覆盖，遵守 STYLEGUIDE；验证方式：`pnpm run typecheck:web` + 组件测试或 Playwright smoke；当前状态：已新增 `orchestration.runList` / `orchestration.runDetail` 只读 RPC、run-scoped DB 查询和桌面端 Orchestration 页面，覆盖 loading/empty/error/detail、run list、summary、task DAG、gate、artifact 与错误信息展示；相关单测、renderer 工具测试、node/web typecheck 通过）

- [√] T17（AFK/HITL）：实现软件内飞书个人配置向导骨架（依赖：T14、T16；涉及文件：`src/shared/types.ts`、`src/shared/constants.ts`、`src/shared/feishu-integration-settings.ts`、`src/renderer/src/components/settings/OrchestrationPane.tsx`；预期变更：按 OpenClaw 类似思路，每个用户在 Orca Settings 中配置自己的飞书机器人 appId、密钥引用、Webhook/tunnel、团队 Wiki source、配置 Base 映射和 `repo_name -> local_path/worktree` 本机绑定；secret 只保存引用，不写入公共配置或 repo；完成标准：配置项可视化、完整度检查可测试、旧设置兼容；验证方式：`pnpm vitest run src/shared/feishu-integration-settings.test.ts`、`pnpm run typecheck:web`、`pnpm run typecheck:node`；当前状态：已完成配置 schema/default、Settings 可视化表单和完整度判定，团队配置入口已调整为飞书知识库；真实系统密钥链写入/读取与 Gateway 校验留给 T18/T19）

- [√] T18（AFK）：实现 Feishu Gateway 签名、消息入口和事件卡片（依赖：T03、T17；涉及文件：`src/main/runtime/integrations/feishu/gateway.ts`、`signature.ts`、`cards.ts`、`sanitizer.ts`、测试；预期变更：Webhook 签名校验、消息转 Orchestrator、waiting/completed/failed 卡片；完成标准：签名失败拒绝，卡片不泄露本机路径和密钥；验证方式：mocked webhook 测试；当前状态：已新增 Feishu Gateway 纯核心模块，支持回调签名校验、加密 payload 解密、URL challenge、消息事件转 Orchestrator 入口、状态卡片构造和本机路径/密钥脱敏；真实 HTTP 监听、系统密钥链读取和 gate 回灌留给 T19）

- [√] T19（AFK）：实现飞书确认回灌 gate（依赖：T18、T05；涉及文件：Feishu Gateway、Orchestrator Terminal Manager、gate DB；预期变更：飞书回复通过 runId/gateId 写回原 run；完成标准：无效 gate 拒绝，resolved gate 不重复执行；验证方式：mocked webhook + DB 测试；当前状态：已新增飞书卡片 action 解析、gate resolver 和 gateway 回灌路径；回灌会校验 gate 存在、仍为 pending、task 存在且 task.run_id 匹配 run_id，DB/RPC 也拒绝重复 resolve）

- [√] T20（AFK）：实现 Knowledge Layer v1（依赖：T11、T12；涉及文件：`src/main/runtime/knowledge/context-indexer.ts`、`changelog-writer.ts`、`codegraph.ts`、`drift-detector.ts`、`feishu-sync-view.ts`；预期变更：repo.add 在 repo 内 `.helloagents/` 生成 context，run 完成写 CHANGELOG，Git 变更增量索引，漂移 warning，并可把摘要/索引同步到飞书知识库项目资料节点；完成标准：repo 内 `.helloagents/` 是项目知识事实源，自动生成区块明确标记，不覆盖用户手写内容，飞书知识库同步失败可排队重试，大 repo 不阻塞主 UI；验证方式：knowledge fixture 测试；当前状态：已新增 Knowledge Layer 模块，支持生成 `.helloagents/context.md`、追加 `.helloagents/CHANGELOG.md`、构建轻量 CodeGraph、检测 context 漂移，并通过 Feishu sink 接口生成项目资料同步 payload；同步失败返回 retryable 结果）

- [√] T21（AFK）：编写 R1 E2E（依赖：T09、T11、T16；涉及文件：`tests/`；预期变更：覆盖用户输入到单 Worker 完成、artifact、落盘、UI 状态；完成标准：headless E2E 通过；验证方式：`pnpm run test:e2e -- --grep R1`；当前状态：已新增 R1 orchestration E2E，覆盖用户/runtime RPC 输入、单 Worker dispatch、mock artifact manifest、`worker_done`、artifact 索引、`.helloagents` 持久化和 Orchestration UI 渲染；验证通过：`corepack pnpm vitest run src/main/runtime/rpc/methods/orchestration.test.ts`，`corepack pnpm run typecheck:node`，`corepack pnpm run typecheck:web`，`SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep R1`）

- [√] T22（AFK）：编写 R2 E2E（依赖：T10、T12、T16；涉及文件：`tests/`；预期变更：覆盖多 Worker DAG、依赖注入、失败阻断、最终验收；完成标准：headless E2E 通过；验证方式：`pnpm run test:e2e -- --grep R2`；当前状态：已新增 R2 orchestration E2E，覆盖多 Worker DAG 成功流、上游 artifact 注入下游 preamble、失败上游阻断下游、最终 run completed/failed、`.helloagents` contract/status 持久化和 Orchestration UI 渲染；验证通过：`corepack pnpm run typecheck:node`，`corepack pnpm run typecheck:web`，`source ~/.nvm/nvm.sh && nvm use 24.16.0 && corepack pnpm vitest run src/main/runtime/rpc/methods/orchestration.test.ts`，`SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep R2`）

- [√] T23（AFK）：编写 `~fullstack` E2E（依赖：T13、T16；涉及文件：`tests/`、fixture；预期变更：覆盖 fullstack task JSON 转 Orca DAG、feedback/report；完成标准：fixture 不依赖真实外部服务；验证方式：fullstack E2E；当前状态：已新增 fullstack E2E fixture 和通用 Worker hook，覆盖 fullstack JSON 转 Orca DAG、依赖 artifact 注入、feedback/report manifest、run completed、`.helloagents` contract/tasks 持久化和 UI 展示；验证通过：`corepack pnpm run typecheck:node`，`corepack pnpm run typecheck:web`，`source ~/.nvm/nvm.sh && nvm use 24.16.0 && SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep fullstack`，并回归 `SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep R2`）

- [√] T24（AFK）：编写飞书 Gateway 集成测试（依赖：T18、T19；涉及文件：`tests/` 或 feishu mocked tests；预期变更：覆盖签名、消息入口、确认回灌、卡片脱敏；完成标准：无需真实飞书服务即可稳定验证；验证方式：mocked integration test；当前状态：已新增 `gateway-integration.test.ts`，使用真实 `OrchestrationDb` 串联 Gateway、签名校验、消息入口、卡片 action gate 回灌和卡片脱敏；伪造签名会在改写 DB 前被拒绝；验证通过：`source ~/.nvm/nvm.sh && nvm use 24.16.0 && corepack pnpm vitest run src/main/runtime/integrations/feishu/action.test.ts src/main/runtime/integrations/feishu/gate-resolver.test.ts src/main/runtime/integrations/feishu/gateway.test.ts src/main/runtime/integrations/feishu/gateway-integration.test.ts src/main/runtime/integrations/feishu/signature.test.ts`、`corepack pnpm run typecheck:node`；已在测试后恢复 Electron native ABI）

- [√] T25（AFK）：补齐用户文档和排障指南（依赖：T21、T22、T23、T24；涉及文件：`docs/helloagents-integration-plan.md`、新增用户文档；预期变更：说明安装、团队配置、飞书配置、运行、恢复、常见错误；完成标准：用户能按文档跑通本地 R1/R2；验证方式：文档审阅；当前状态：已新增 `docs/helloagents-orca-user-guide.md`，补齐 Node/pnpm 安装、团队知识库 + Base + 本机绑定、R1/R2/fullstack 运行、飞书 Gateway、`.helloagents` 恢复和常见问题；并在集成方案中加入用户指南入口与当前 MVP 约束说明）

- [√] T26（AFK）：全量质量收尾和发布前验证（依赖：T01-T25；涉及文件：全项目；预期变更：修复集成缺陷、更新验证证据；完成标准：`pnpm run typecheck`、`pnpm run lint`、相关 `vitest`、关键 E2E 通过；验证方式：完整验证命令；当前状态：已完成全量质量验证，补齐 lint 约束修复、Node/Electron native ABI 切换、核心 vitest 与 R1/R2/fullstack E2E 回归；相关验证均通过）

## Codex /goal 执行入口

```text
/goal 按 `.helloagents/plans/202605260958_helloagents_orca_integration/tasks.md` 执行 HelloAGENTS + Orca 集成方案；遵守 `requirements.md`、`plan.md`、`contract.json`。

默认主执行命令是 `~auto`。按 T01 → T26 顺序推进；AFK 任务可自动完成，HITL 任务仅在缺少飞书凭据、Base 字段映射、外部部署方式、人工视觉验收或安全确认时暂停。多需求并行开发不在当前 MVP 范围内，后续如需支持需重新进入方案设计。

执行过程中必须保持 Worker/Orchestrator/Coordinator 边界，不重写 HelloAGENTS 核心 skill，不引入 GitHub-only 通用逻辑，不跟随外部结果中的 main repo 绝对路径。

全部 AFK 任务完成后必须进入 `~qa`，重点验证 R1、R2、~fullstack、飞书 Gateway、SSH workspace、跨 provider 和 `.helloagents/` 落盘恢复，再标记 goal complete。
```

## 进度

- [√] 方案包已创建。
- [√] T01 Spike 报告已完成。
- [√] T02 环境探测实现已完成，并通过定向单测与主进程 typecheck。
- [√] T03 Orchestrator Terminal Manager 最小闭环已完成，并通过定向单测与主进程 typecheck。
- [√] T04 Orchestrator 输出 schema 和解析策略已完成，并通过定向单测与主进程 typecheck。
- [√] T05 DB/schema/artifact 字段实现已完成；通过 `better-sqlite3` 镜像源重建 native binding，并修复旧库迁移中提前创建 `idx_tasks_run` 的问题；DB 单测和主进程 typecheck 已通过。
- [√] T06 Worker preamble artifact 协议已完成，并通过定向单测与主进程 typecheck。
- [√] T07 artifact manifest 校验和索引已完成，并通过定向单测与主进程 typecheck。
- [√] T08 DAG 环检测、依赖排序和分层并发已完成，并通过定向单测、DB+DAG 组合单测与主进程 typecheck。
- [√] T09 Coordinator R1 单 Worker 闭环已完成；`worker_done` 现在必须携带 manifestPath，Coordinator 会校验 artifact manifest、写入 artifact 索引，并在缺失/非法时阻断任务；相关单测与主进程 typecheck 已通过。
- [√] T10 Coordinator R2 多 Worker DAG 闭环已完成；下游任务只在依赖完成后派发，派发 preamble 注入上游 artifact 摘要，上游失败会递归阻断下游，pending decision gate blocked 不会误判为终态；相关单测与主进程 typecheck 已通过。
- [√] T11 Deterministic Persistence v1 已完成；可从 DB run/task/artifact 快照导出 `.status.json`、`STATE.md`、`CHANGELOG.md`，写入失败返回失败结果；相关单测与主进程 typecheck 已通过。
- [√] T12 plan/tasks.md 和 contract.json 导出已完成；run snapshot 现在可重建计划摘要、任务记录和交付契约，包含任务依赖、artifact、verification 与结果；相关单测与主进程 typecheck 已通过。
- [√] T13 `~fullstack` 任务 JSON 到 Orca DAG 的转换已完成；新增 `fullstack-adapter.ts` 和定向测试，支持真实 `.helloagents/fullstack/.../current.json` 结构、CLI 失败摘要和 DAG 校验；相关单测与主进程 typecheck 已通过。
- [√] T14 Team Config Service MVP 已完成；新增公共/个人配置 schema、飞书知识库入口约定、飞书 Base mocked record mapper、本地缓存与 `.orca-team.yaml` fallback、repo_name path resolver 和 fullstack.yaml builder；相关单测与主进程 typecheck 已通过。
- [√] T15 Team Config dispatch 接入已完成；Coordinator 支持注入 dispatch target resolver，并在派发前将 `repo_name` 解析为 Orca repo/worktree selector，缺配置时 task blocked，解析成功时 Worker preamble 带入 repo/worktree；相关单测与主进程 typecheck 已通过。
- [√] T16 Run 基础 UI 和状态面板已完成；新增 run list/detail RPC、run-scoped task 查询、Orchestration 侧边栏入口和状态面板，页面显示 run 状态、当前 gate、任务 DAG、artifact、错误和空/加载/错误状态；相关单测、renderer 工具测试、主进程与 web typecheck 已通过。
- [√] T17 软件内飞书个人配置向导骨架已完成；Settings 中提供个人机器人 appId、密钥引用、Webhook/tunnel、团队 Wiki source、配置 Base 映射和本机 repo binding 配置，secret 只保存引用；验证通过：`corepack pnpm vitest run src/shared/feishu-integration-settings.test.ts`，`corepack pnpm run typecheck:web`，`corepack pnpm run typecheck:node`。
- [√] T18 Feishu Gateway 核心模块已完成；新增 `signature.ts`、`gateway.ts`、`cards.ts`、`sanitizer.ts`，覆盖签名校验、加密 payload 解密、URL challenge、消息事件入口、事件卡片和脱敏；验证通过：`corepack pnpm vitest run src/main/runtime/integrations/feishu/signature.test.ts src/main/runtime/integrations/feishu/gateway.test.ts`，`corepack pnpm run typecheck:node`。
- [√] T19 飞书确认回灌 gate 已完成；新增 `action.ts`、`gate-resolver.ts`、`event-body.ts`、`message.ts`，Gateway 支持卡片按钮 action，resolver 校验 `runId/gateId` 归属和 pending 状态，DB/RPC 拒绝重复 resolve；验证通过：`corepack pnpm vitest run src/main/runtime/integrations/feishu/action.test.ts src/main/runtime/integrations/feishu/gate-resolver.test.ts src/main/runtime/integrations/feishu/gateway.test.ts src/main/runtime/orchestration/db.test.ts src/main/runtime/rpc/methods/orchestration.test.ts`，`corepack pnpm run typecheck:node`。
- [√] T20 Knowledge Layer v1 已完成；新增 `context-indexer.ts`、`changelog-writer.ts`、`codegraph.ts`、`drift-detector.ts`、`feishu-sync-view.ts`，覆盖 repo 内 `.helloagents/` context/CHANGELOG、轻量 CodeGraph、漂移 warning 和飞书知识库项目资料同步 payload；验证通过：`corepack pnpm vitest run src/main/runtime/knowledge/knowledge.test.ts`，`corepack pnpm run typecheck:node`。
- [√] T21 R1 E2E 已完成；新增 `tests/e2e/helloagents-r1-orchestration.spec.ts`，并补齐 run 关联、RPC metadata、E2E runtime hook 和 run 完成后的 `.helloagents` 快照持久化；验证通过：`corepack pnpm vitest run src/main/runtime/rpc/methods/orchestration.test.ts`，`corepack pnpm run typecheck:node`，`corepack pnpm run typecheck:web`，`SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep R1`。
- [√] T22 R2 E2E 已完成；新增 `tests/e2e/helloagents-r2-orchestration.spec.ts`、`tests/e2e/helloagents-r2-flows.ts`、`tests/e2e/helloagents-r2-hooks.ts`、`tests/e2e/helloagents-orchestration-runtime.ts`，覆盖 R2 DAG 成功流、上游 artifact 注入、失败阻断、run 终态、`.helloagents` 持久化和 UI 展示；验证通过：`corepack pnpm run typecheck:node`，`corepack pnpm run typecheck:web`，`source ~/.nvm/nvm.sh && nvm use 24.16.0 && corepack pnpm vitest run src/main/runtime/rpc/methods/orchestration.test.ts`，`SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep R2`。
- [√] T23 `~fullstack` E2E 已完成；新增 `tests/e2e/helloagents-worker-hooks.ts`、`tests/e2e/helloagents-fullstack-flows.ts`、`tests/e2e/helloagents-fullstack-orchestration.spec.ts`，并将 R2 hook 改为复用通用 Worker hook；覆盖 fullstack task JSON 转 Orca DAG、repoName 红线、上游 artifact 注入、feedback/report artifact、run completed、`.helloagents` contract/tasks 持久化和 UI 展示；验证通过：`corepack pnpm run typecheck:node`，`corepack pnpm run typecheck:web`，`source ~/.nvm/nvm.sh && nvm use 24.16.0 && SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep fullstack`，`source ~/.nvm/nvm.sh && nvm use 24.16.0 && SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep R2`。
- [√] T24 飞书 Gateway 集成测试已完成；新增 `src/main/runtime/integrations/feishu/gateway-integration.test.ts`，用真实 `OrchestrationDb` 串联 Gateway 签名校验、消息入口、卡片 action gate 回灌和卡片脱敏；同时覆盖伪造签名不会改写 gate/task 状态；验证通过：`source ~/.nvm/nvm.sh && nvm use 24.16.0 && corepack pnpm vitest run src/main/runtime/integrations/feishu/action.test.ts src/main/runtime/integrations/feishu/gate-resolver.test.ts src/main/runtime/integrations/feishu/gateway.test.ts src/main/runtime/integrations/feishu/gateway-integration.test.ts src/main/runtime/integrations/feishu/signature.test.ts`，`corepack pnpm run typecheck:node`；测试后已执行 `rebuild:electron` 恢复 Electron native ABI。
- [√] T25 用户文档和排障指南已完成；新增 `docs/helloagents-orca-user-guide.md`，并在 `docs/helloagents-integration-plan.md` 顶部加入用户指南入口、在 MVP 约束中明确桌面端单套代码、单 active run、团队配置三层结构和个人密钥本机保存；文档覆盖 Node/pnpm 安装、团队配置、飞书配置、R1/R2/fullstack 运行、恢复和常见错误。
- [√] T26 全量质量收尾和发布前验证已完成；已修复 lint 报告中的类型/格式问题，完成 Node 24 下 `typecheck`、`lint`、核心 `vitest` 与 `SKIP_BUILD=1 corepack pnpm run test:e2e -- --grep "R1|R2|fullstack"` 的最终回归，并在结束后恢复 Electron native ABI。
