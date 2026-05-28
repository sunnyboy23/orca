# Orca 中文覆盖补齐任务拆分

## LIVE_STATUS

- status: completed
- completed: 14
- failed: 0
- pending: 0
- total: 14
- percent: 100
- current: 已完成

## Tasks

- [√] T01 方案包创建与覆盖评估：记录设置页英文残留来源、范围边界和验收门禁。 | depends_on: []
- [√] T02 i18n 设置领域拆分：新增 settings 消息领域并接入 `I18nMessages` 聚合。 | depends_on: [T01]
- [√] T03 设置页外壳中文化：迁移侧栏、分组、搜索框、section 标题描述、badge 和空状态。 | depends_on: [T02]
- [√] T04 General 设置中文化：迁移 Workspace、Editor、CLI、更新、缓存计时器、默认 Agent、支持入口。 | depends_on: [T02]
- [√] T05 Appearance 设置中文化：迁移主题、缩放、字体、布局、标题栏、状态栏、侧栏入口。 | depends_on: [T02]
- [√] T06 设置搜索中文化：让 General / Appearance 搜索项从消息表生成，并支持中英文关键词。 | depends_on: [T03, T04, T05]
- [√] T07 扫描门禁升级：扩展硬编码英文扫描，覆盖已迁移的设置页文件。 | depends_on: [T03, T04, T05]
- [√] T08 测试补齐：更新 i18n / settings 相关测试，覆盖中文设置入口和搜索。 | depends_on: [T06, T07]
- [√] T09 验证与收尾：运行 `check:i18n-copy`、`typecheck:web` 和相关 vitest，更新状态。 | depends_on: [T08]
- [√] T10 Git 与 AI Commit Message 设置中文化：迁移 Git pane、AI Commit Message pane、搜索索引和导航元数据。 | depends_on: [T02, T07]
- [√] T11 SSH 设置中文化：迁移 SSH pane、目标卡片、表单、危险操作弹窗、搜索索引和导航元数据。 | depends_on: [T02, T07]
- [√] T12 Integrations 设置中文化：迁移 GitHub/GitLab/Bitbucket/Azure DevOps/Gitea/Linear 集成文案、搜索索引和导航元数据。 | depends_on: [T02, T07]
- [√] T13 Accounts 设置中文化：迁移 Claude/Codex/Gemini/OpenCode Go 账号文案、搜索索引、提示和移除确认弹窗。 | depends_on: [T02, T07]
- [√] T14 Agent、浮动工作区与快捷键设置中文化：迁移 Agent pane、Floating Workspace pane、Shortcuts pane、快捷键动作名/分组、快捷键文件操作、搜索索引和导航元数据。 | depends_on: [T02, T07]

## 执行日志

- 2026-05-27 15:15 创建方案包，确认当前问题不是基础设施缺失，而是设置页覆盖率和门禁不足。
- 2026-05-27 15:36 完成 settings i18n 领域拆分、设置页外壳、General、Appearance 和搜索索引第一批中文化；修复新增类型问题。
- 2026-05-27 15:40 完成扫描门禁、i18n/设置导航测试和验证；`check:i18n-copy`、`typecheck:web`、`lint`、相关 vitest 均通过。
- 2026-05-27 16:05 继续补齐第二批设置页：Notifications、Quick Commands、Runtime、Input、Tasks、Privacy、Experimental 及对应搜索索引已接入当前语言；新增 `settingsPanes` 断言和扫描门禁。
- 2026-05-27 16:54 补齐 Terminal 设置页中文化：新增终端消息表并接入 pane、主题选择、窗口设置、会话管理、搜索索引和共享 daemon 操作文案；`check:i18n-copy`、`typecheck:web`、`lint`、终端相关 vitest 均通过。
- 2026-05-27 17:12 补齐 Git 与 AI Commit Message 设置页中文化：新增独立 Git / Commit Message AI 消息表，迁移 pane、搜索索引和设置导航元数据；`check:i18n-copy`、`typecheck:web`、`lint`、相关 vitest 均通过。
- 2026-05-27 17:19 补齐 SSH 设置页中文化：新增 SSH 消息表并迁移主 pane、目标卡片、表单、危险确认弹窗和搜索索引；`check:i18n-copy`、`typecheck:web`、`lint`、i18n / 设置导航 vitest 均通过。
- 2026-05-27 17:26 补齐 Integrations 设置页中文化：新增集成消息表并迁移 GitHub、GitLab、Bitbucket、Azure DevOps、Gitea、Linear 的状态、说明、按钮和对话框；`check:i18n-copy`、`typecheck:web`、`lint`、i18n / 设置导航 vitest 均通过。
- 2026-05-27 17:33 补齐 Accounts 设置页中文化：新增账号消息表并迁移 Claude、Codex、Gemini、OpenCode Go 的搜索、说明、按钮、toast 和移除确认弹窗；`check:i18n-copy`、`typecheck:web`、`lint`、i18n / 设置导航 vitest 均通过。
- 2026-05-27 17:48 补齐 Agent、Floating Workspace 和 Shortcuts 设置页中文化：新增三组设置消息表并迁移 pane、搜索索引、导航元数据、快捷键动作名/分组、录制行提示和 keybindings 文件操作；`check:i18n-copy`、`typecheck:web`、`lint`、i18n / 设置导航 / AgentsPane / ShortcutsPane vitest 均通过。

## 后续建议

- 仍可继续扫描低频弹窗或非设置主界面的英文残留；高频设置主流程已基本完成本轮补齐。
- 小型 pane 可继续按本方案模式迁移：先抽消息类型，再接入 pane 与 search factory，最后加入 `check:i18n-copy` 保护。
