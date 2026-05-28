# Orca 中文覆盖补齐需求

## 背景

上一轮中文支持已经建立了 renderer i18n 基础设施，但实际覆盖仍偏入口级。用户在设置页切换到中文后，仍看到大量英文标题、描述、按钮、toast、搜索结果和确认文案，因此中文模式给人的感受是“作用不大”。

## 目标

- 让设置页成为中文模式下的高可信入口：侧栏、分组、section 标题、设置项标题/描述、搜索结果、主要按钮和反馈文案应随语言切换。
- 将设置页搜索索引纳入 i18n，避免中文界面搜索仍显示英文或只匹配英文。
- 将硬编码英文检查从“少量短语黑名单”升级为可持续扩展的 UI 文案扫描，至少覆盖设置页关键源码。
- 保持英文默认体验、现有功能逻辑、设置持久化和测试断言稳定。
- 中文翻译要求自然、贴合产品语义，不做生硬逐字翻译。

## 范围

- 迁移 `src/renderer/src/components/settings/` 的高曝光文案，优先级为：
  - 设置页外壳：侧栏、分组、搜索框、项目空状态。
  - 主 section：General、Appearance、Terminal、Notifications、Quick Commands、Browser、Input、Shortcuts、Stats、Orchestration、Computer Use、Voice、Remote Servers、SSH、Mobile、macOS Permissions、Privacy、Experimental、Repository。
  - 设置页搜索索引：`*-search.ts`。
  - General / Appearance 的设置项与反馈文案作为第一批开发交付。
- 拆分 i18n 消息表，避免 `en.ts`、`zh-CN.ts` 成为巨型文件。
- 补充自动化测试与扫描规则，保证新增英文 UI 文案不会悄悄回流。

## 非范围

- 不翻译品牌名、Agent 名、产品名、CLI 命令、配置键、协议字段、环境变量、终端输出、日志原文。
- 不强制翻译用户自己的仓库名、路径、账号邮箱、远程主机名、错误对象原始 message。
- 不改变设置项业务逻辑、IPC 协议、Feishu / HelloAGENTS / Git 行为。
- 不在这一轮一次性承诺迁移整个应用所有低频页面；本轮以设置页和可持续门禁为核心。

## 成功标准

- 中文模式下设置页骨架与第一批 General / Appearance 设置项不再出现明显英文 UI 文案。
- 设置页搜索可使用中文关键词命中已迁移设置项，搜索结果显示中文标题/描述。
- 英文和中文消息结构保持一致，缺 key 会测试失败。
- `pnpm run check:i18n-copy` 能覆盖设置页高频英文硬编码。
- `pnpm run typecheck:web` 和相关 i18n / settings 测试通过。
