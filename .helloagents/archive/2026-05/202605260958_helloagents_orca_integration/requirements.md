# HelloAGENTS + Orca 集成 — 需求

确认后冻结，执行阶段不可修改。如需变更必须回到设计阶段重新确认。

## 核心目标

基于现有 `docs/helloagents-integration-plan.md`，在 Orca 中落地 HelloAGENTS 编排能力：由 Orchestrator Terminal 负责 AI 语义决策，由 Orca Coordinator 负责确定性调度、状态持久化、Worker 生命周期、artifact 链路和外部事件转发。

目标用户是需要在 Orca 内进行并行 Agent 开发、全栈任务编排和远程飞书指挥的团队成员。用户只安装 Orca，不需要为每个 Worker 手动安装 HelloAGENTS。

## 功能边界

必须交付：
- 在 Orca 中启动和维护具备 HelloAGENTS 注入能力的 Orchestrator Terminal。
- 支持用户自然语言输入经 Orchestrator 判定为 R0、R1、R2 三类内部路由结果，并支持用户显式输入 `~fullstack` 命令。
- Orchestrator 判定为 R1 时能转成单 Worker 任务闭环；判定为 R2 时能转成多 Worker DAG 并行闭环。
- MVP 同一时间只支持一个 active run；单个 run 内可按任务 DAG 并发多个 Worker，并为涉及到的 repo 使用对应 worktree。
- Worker Terminal 只接收结构化 preamble，不安装 HelloAGENTS。
- Coordinator 确定性写入 `.status.json`、`STATE.md`、`plan/tasks.md`、`CHANGELOG.md`、`contract.json`。
- Worker 必须写 `artifacts/{taskId}/manifest.json`，Coordinator 必须校验后才允许任务完成。
- 支持以飞书知识库作为团队配置和项目资料的统一入口：团队成员被授权到同一个知识空间，Orca 从知识库配置节点发现结构化配置 Base 和项目资料根节点；Base 维护服务、角色、依赖、项目能力和 `repo_name` 等公共逻辑配置，`repo_name` 通过个人本机绑定映射到 Orca Repo 路径；`.orca-team.yaml` 仅作为离线 fallback 或可导出快照。
- 兼容 HelloAGENTS `fullstack.yaml` 的既有语义，但不把它作为团队共享源头；运行时由团队公共逻辑配置和个人本机 repo binding 合成本机 fullstack 配置或快照。
- 支持飞书消息入口、确认回灌和事件卡片推送。
- 支持知识库初始索引、run 完成 CHANGELOG、CodeGraph 增量索引和漂移检测；repo 内 `.helloagents/` 是项目知识事实源，飞书知识库是团队共享入口和授权边界，承载项目资料阅读视图、跨项目检索入口和同步摘要。

## 非目标

- 不重写 HelloAGENTS 的路由、评估、方案设计、`~plan`、`~auto`、`~fullstack` 等 skill 逻辑。
- 不要求 Worker Terminal 支持完整 HelloAGENTS 命令。
- 不建设云端托管调度中心，MVP 以桌面端本地运行时为主。
- 不做跨用户共享密钥托管；飞书、Git provider、AI CLI 凭据沿用本机认证。
- 不把个人本机路径、个人机器人 key、app secret 或 webhook token 写入团队公共配置。
- 不做复杂权限系统，只实现飞书配置读取授权、离线缓存、路径解析和本机可执行性校验。
- 不引入 GitHub-only 的通用审查模型，必须兼容 GitLab、Gitea、Bitbucket 等 provider。

## 技术约束

- 项目技术栈：Electron + TypeScript + React + Vite，Node 24，pnpm。
- 当前执行范围仅做桌面端程序。Orca 桌面端主进程和 renderer 是同一套代码覆盖 macOS、Windows、Linux；只有遇到平台专属实现时才优先做 macOS。
- 现有 orchestration 基础优先复用 `src/main/runtime/orchestration/`。
- 终端、PTY、SSH、Git provider、skills discovery、runtime RPC 必须复用现有 Orca 模块边界。
- 配置解析使用 `zod`；文件路径使用 Node `path` 能力，不硬编码 `/` 或 `\`。
- Worker 与 Orchestrator 的任务状态必须落到 DB 和 `.helloagents/` 文件，不能只依赖终端文本。
- SSH workspace 不能跟随子代理或外部结果中的主 repo 绝对路径。
- UI 变更必须遵守 `docs/STYLEGUIDE.md` 和 `src/renderer/src/assets/main.css` token。

## 质量要求

- 所有新增 TypeScript 模块必须有针对性单元测试。
- 关键路径需要 E2E：R1 单 Worker、R2 多 Worker DAG、`~fullstack` 转 Orca DAG、飞书确认回灌。
- 验证命令至少覆盖 `pnpm run typecheck`、`pnpm run lint`、相关 `vitest`、关键 Playwright E2E。
- 安全检查覆盖高风险命令、Webhook 签名、敏感信息脱敏、密钥不落 repo。
- 失败恢复必须可验证：Orchestrator 崩溃、Worker 超时、artifact 缺失、DAG 环、配置缺失。
