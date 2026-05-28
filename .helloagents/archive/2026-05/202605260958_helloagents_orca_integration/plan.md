# HelloAGENTS + Orca 集成 — 实施规划

## 目标与范围

本方案将 `docs/helloagents-integration-plan.md` 转成可执行工程计划，目标是在 Orca 中实现双层 Terminal 模式：

- Orchestrator Terminal：运行 Claude Code + HelloAGENTS，负责需求路由、方案设计、任务拆分、服务归属分析和最终验收。
- Orca Coordinator：运行在 TypeScript 确定性层，负责任务 DAG、状态持久化、Worker 生命周期、超时、心跳、熔断、artifact 校验、飞书事件转发和 `.helloagents/` 落盘。
- Worker Terminal：执行具体代码任务，接收 preamble，不安装 HelloAGENTS。

范围覆盖 Runtime Adapter、Orchestrator Terminal Manager、Worker Dispatch、Deterministic Persistence、Team Config、Feishu Gateway、Knowledge Layer、UI 状态面板和 E2E 验证。

## 架构与实现策略

### 总体策略

- 不重写 HelloAGENTS。Orchestrator Terminal 保留现有 prompt/skill/CLI 行为，Orca 只负责包裹和确定性保障。
- 不让 AI 独占状态真相。Coordinator DB 和 `.helloagents/` 文件是恢复和验收事实源。
- Worker 保持轻量。Worker 只执行明确任务、写 artifact、发 `worker_done`，避免多层 AI 路由互相干扰。
- 延续 Orca worktree-native 模型。MVP 保留现有单 active run 约束；单个 run 内可按任务 DAG 并发多个 Worker，并为涉及到的 repo 使用对应 worktree。
- 先闭环再扩展。先完成 R1 单 Worker，再扩展 R2 DAG，再接入团队配置、飞书和知识层。

### 模块策略

| 模块 | 实现策略 |
|------|----------|
| HelloAGENTS Runtime Adapter | 新建 `src/main/runtime/helloagents/`，负责环境探测、启动参数、输出解析 |
| Orchestrator Terminal Manager | 维护 run 与 Orchestrator Terminal 的一对一关系，处理确认回灌和状态识别 |
| Worker Dispatch Enhancer | 扩展现有 `coordinator.ts`、`preamble.ts`，新增 `dag.ts` 和 `artifacts.ts` |
| Deterministic Persistence | 新增 `persistence.ts` 与 `helloagents-files.ts`，由 DB 导出 `.helloagents/` 文件 |
| Team Config Service | 新建 `src/main/runtime/team-config/`，以飞书知识库作为团队授权和发现入口，从知识库配置节点发现结构化配置 Base，再同步团队公共逻辑配置并用 `zod` 校验；个人层保存本机 repo binding 和机器人 key；运行时可由公共逻辑配置 + 个人绑定合成 HelloAGENTS fullstack 配置；`.orca-team.yaml` 只作为离线 fallback 或导出快照 |
| Feishu Gateway | 新建 `src/main/runtime/integrations/feishu/`，签名校验、卡片、确认回灌分层实现 |
| Knowledge Layer | 新建 `src/main/runtime/knowledge/`，以 repo 内 `.helloagents/` 为项目知识事实源，实现 context、CHANGELOG、CodeGraph 和漂移检测；飞书知识库承载项目资料阅读视图、同步摘要、索引和跨项目检索入口 |
| UI | 在 `src/renderer/src/` 中增加 run 列表、run 详情、DAG、确认卡片、配置状态 |

## 领域语言

- Orchestrator Terminal：运行 HelloAGENTS 的主编排终端，不直接写代码任务。
- Worker Terminal：执行具体代码任务的终端，不安装 HelloAGENTS。
- Coordinator：Orca TypeScript 确定性调度层。
- Run：一次用户请求到最终完成或失败的完整编排过程。
- Task DAG：任务依赖图，决定 Worker dispatch 顺序。
- Artifact Manifest：Worker 完成任务时写入的结构化结果文件。
- Gate：等待用户确认的决策点，可来自 UI 或飞书。
- Team Config：飞书知识库中的配置节点和项目资料根节点；配置节点指向结构化 Base，Base 中维护服务、角色、依赖、项目能力、默认 agent 和 `repo_name` 等团队公共逻辑配置；个人层负责 `repo_name -> local_path/worktree` 和机器人 key；`.orca-team.yaml` 是可选离线快照。
- Fullstack Runtime Config：由 Team Config 公共逻辑和个人本机绑定合成的本机 `fullstack.yaml` 兼容产物，不作为团队共享源头。

避免用语：
- 不把 Orchestrator 称为 Worker。
- 不把 GitHub PR 作为通用 review 概念；通用表述使用 change/review，provider adapter 再区分 PR/MR。
- 不把本机绝对路径写入团队共享配置。
- 不把 repo 内 `.helloagents/` 当作飞书文档的缓存副本；repo 内 `.helloagents/` 是项目知识事实源，飞书知识库是团队共享入口和同步视图。

## 完成定义

功能完成时必须满足：
- R1 run 能从用户输入闭环到 Worker 完成、artifact 校验、状态落盘和 Orchestrator 验收。
- R2 run 能从任务 DAG 闭环到多 Worker 并发、依赖注入、最终 contract 和 CHANGELOG。
- 同一时间只允许一个 active run；run 内多个 Worker 可按 DAG 并发执行，Worker、artifact、gate 和 `.helloagents` 状态均归属于当前 run。
- `~fullstack` 能读取 HelloAGENTS fullstack 任务并转换为 Orca DAG。
- 飞书能发起 run、回复确认、接收 waiting/completed/failed 卡片。
- 飞书知识库入口能解析到配置 Base 和项目资料根节点；Base 公共配置能同步到本机缓存，并结合个人 repo binding 映射本机 repo/worktree；离线时可使用 `.orca-team.yaml` 快照 fallback。
- `.helloagents/` 文件由 Coordinator 确定性写入，恢复时能接续当前 run。

`qaMode`: `deep`

`qaFocus`:
- Orchestrator Terminal 与 Worker Terminal 的生命周期边界。
- DAG 环检测、依赖排序、并发上限和失败阻断。
- Artifact manifest 校验和下游上下文注入。
- `.helloagents/` 文件落盘一致性和恢复能力。
- 飞书签名校验、确认回灌绑定和敏感信息脱敏。
- SSH workspace、跨平台路径、GitLab/Gitea/Bitbucket provider 兼容性。

## 文件结构

计划新增或扩展：

```text
src/main/runtime/helloagents/
  adapter.ts
  environment.ts
  output-parser.ts
  orchestrator-terminal.ts
  orchestrator-events.ts
  *.test.ts

src/main/runtime/orchestration/
  coordinator.ts
  db.ts
  types.ts
  preamble.ts
  dag.ts
  artifacts.ts
  persistence.ts
  helloagents-files.ts
  *.test.ts

src/main/runtime/team-config/
  schema.ts
  loader.ts
  path-resolver.ts
  *.test.ts

src/main/runtime/integrations/feishu/
  gateway.ts
  cards.ts
  signature.ts
  sanitizer.ts
  *.test.ts

src/main/runtime/knowledge/
  context-indexer.ts
  codegraph.ts
  changelog-writer.ts
  drift-detector.ts
  *.test.ts

src/renderer/src/
  运行详情、任务 DAG、确认卡片、团队配置状态相关组件和状态管理

tests/
  R1、R2、fullstack、飞书 Gateway 关键 E2E
```

## UI / 设计约束

本方案涉及 Orca 内部运行状态 UI。设计要求：
- 遵守 `docs/STYLEGUIDE.md` 和 `src/renderer/src/assets/main.css` tokens。
- 优先复用 `src/renderer/src/components/ui/` 的 shadcn primitives。
- UI 是工作台视图，不做营销式 hero、装饰性大卡片或单色调展示。
- Run 详情必须清楚呈现：状态、当前 gate、DAG、Worker、artifact、验证结果、错误原因。
- 状态覆盖：loading、empty、waiting、running、blocked、failed、completed。
- 飞书绑定状态和团队配置状态必须避免泄露密钥和本机敏感路径。

## 风险与验证

| 风险 | 验证方式 | 回退点 |
|------|----------|--------|
| Orchestrator 输出不可解析 | zod schema + malformed fixture | blocked 并要求 Orchestrator 重写 |
| Worker 未写 artifact | artifact manifest test + E2E | task blocked，不进入 completed |
| DAG 有环或依赖缺失 | `dag.ts` 单元测试 | 拒绝 dispatch |
| 飞书确认误绑定 run | mocked webhook 测试 runId/gateId | 拒绝无效确认 |
| 飞书知识库或配置 Base 不可用 | mocked Feishu Wiki/Base API + cache fixture | 使用最近一次本地缓存或 `.orca-team.yaml` 快照 |
| SSH/local 路径混用 | path resolver fixture | 使用 worktree selector，不跟随绝对路径 |
| Provider GitHub-only 假设 | GitLab/Gitea/Bitbucket fixture | provider adapter 内分支处理 |
| UI 状态不完整 | Playwright 状态截图/断言 | 回退到只读状态面板 |

## 决策记录

- [2026-05-26] 采用双层 Terminal 模式：AI 语义能力留给 Orchestrator，确定性调度交给 Orca Coordinator。
- [2026-05-26] Worker 不安装 HelloAGENTS，避免多层路由和上下文污染。
- [2026-05-26] `.helloagents/` 关键文件由 Coordinator 写入，避免依赖 AI 自觉落盘。
- [2026-05-26] MVP 先本地桌面端闭环，不做云端托管调度中心。
- [2026-05-26] 团队配置入口调整为飞书知识库：知识库负责团队授权和节点发现，结构化配置继续由知识库中的 Base 节点承载，项目资料放在同一知识空间；`.orca-team.yaml` 降级为离线 fallback 和导出快照，避免要求团队额外维护配置仓库。
- [2026-05-26] 个人私有层采用 OpenClaw 类似思路：每个人在本机配置自己的飞书机器人 key 和本机 repo binding，不进入公共配置。
- [2026-05-26] HelloAGENTS `fullstack.yaml` 不作为团队共享源头；运行时由团队公共逻辑配置和个人本机绑定合成本机兼容配置。
- [2026-05-26] 项目级知识事实源继续以 repo 内 `.helloagents/` 为主；飞书知识库作为团队共享入口、阅读视图和跨项目检索入口。
