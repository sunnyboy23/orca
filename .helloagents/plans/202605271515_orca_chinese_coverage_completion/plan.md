# Orca 中文覆盖补齐方案

## 评估结论

- 当前 i18n 基建可用，但覆盖范围不足。`src/renderer/src/i18n/types.ts` 只定义了少量 setting / navigation / workspace 文案，设置页大量组件仍直接写英文。
- `check-i18n-hardcoded-copy.mjs` 当前只是固定短语黑名单，不能发现新的设置页英文 literal，因此无法防止回归。
- 设置页的英文来源主要有三类：
  - 外壳文案：`Settings.tsx`、`SettingsSidebar.tsx`。
  - pane 内文案：`GeneralPane.tsx`、`AppearancePane.tsx`、`TerminalPane.tsx` 等。
  - 搜索索引：`general-search.ts`、`appearance-search.ts`、`repository-search.ts` 等。
- 继续把所有文案塞进 `en.ts` / `zh-CN.ts` 会很快突破可维护阈值，应按领域拆分消息表。

## 设计原则

- 中文模式必须覆盖用户第一眼看到的设置页结构，不只翻译少数功能入口。
- 文案按产品语义翻译，按钮短、说明自然，危险操作保留明确后果。
- 搜索索引和 UI 文案共用同一套 locale-aware 数据，避免“界面中文、搜索英文”。
- 技术词保留原文：`worktree`、`SSH`、`CLI`、`MCP`、`OSC 52`、`App ID`、`App Secret`。
- 自动化门禁按可控范围逐步收紧，避免一次性扫描全仓导致大量误报阻塞开发。

## 实现设计

- 新增 `src/renderer/src/i18n/settings.ts`：
  - 定义 `SettingsMessages` 类型。
  - 提供 `enSettingsMessages` / `zhCNSettingsMessages`。
  - 覆盖设置外壳、section 元数据、General、Appearance、常用操作和搜索空状态。
- 调整 `I18nMessages`：
  - 增加 `settings: SettingsMessages`。
  - `en.ts` / `zh-CN.ts` 只聚合领域消息，避免继续膨胀。
- 设置页外壳接入：
  - `Settings.tsx` 使用 `messages.settings.groups` 和 `messages.settings.sections` 生成导航与 section 文案。
  - `SettingsSidebar.tsx` 接收 locale-aware 文案或内部使用 i18n。
- 搜索索引接入：
  - 第一批将 General / Appearance 搜索项改为函数式工厂，按 `messages.settings` 生成。
  - 保留英文关键词，同时补充中文关键词。
- pane 接入：
  - 第一批迁移 `GeneralPane.tsx` 和 `AppearancePane.tsx`。
  - 后续按任务继续迁移 Terminal、Notifications、Quick Commands、Runtime、SSH 等高曝光 pane。
- 扫描规则升级：
  - 扩展 `check-i18n-hardcoded-copy.mjs`，新增 settings allowlist / denylist 机制。
  - 先把本轮迁移覆盖的文件纳入强检查，后续每迁移一个 pane 就加入检查范围。

## 验证策略

- 结构测试：i18n key parity 保持通过。
- 搜索测试：新增或更新 settings 搜索测试，验证中文关键词可以命中 General / Appearance。
- 静态门禁：`pnpm run check:i18n-copy`。
- 类型检查：`pnpm run typecheck:web`。
- 视情况运行相关 vitest：`src/renderer/src/i18n/i18n.test.ts`、General / Appearance 相关测试。

## 风险与控制

- 风险：一次迁移所有设置 pane 改动过大。
  - 控制：先迁移外壳 + General + Appearance，同时建立消息拆分和扫描门禁，再按 pane 批量推进。
- 风险：中文搜索只命中中文，英文用户体验回退。
  - 控制：搜索关键词同时保留英文和中文。
- 风险：翻译改变测试文本断言。
  - 控制：优先使用稳定 selector；必要文本断言通过消息表取值。
