# Orca 全量中文支持方案

## 设计原则

- 中文是产品语言，不是英文逐字替换。按钮短、状态明确、说明语自然。
- 技术名词稳定保留：`App ID`、`App Secret`、`repo_name`、`worktree`、`DAG`、`runId` 等不硬翻。
- i18n 基础设施先于大规模迁移，避免散落的条件判断继续扩散。
- 测试优先保护翻译结构、语言解析和关键 UI 入口，不要求一次性把所有英文断言替换完。

## 实现方案

- 新增 `src/renderer/src/i18n/`：
  - `types.ts` 定义 locale、翻译字典和函数型文案类型。
  - `en.ts` / `zh-CN.ts` 维护两套同构翻译表。
  - `locale.ts` 负责语言偏好解析、fallback 和 `AppLanguage` 归一化。
  - `use-i18n.ts` 提供 React hook，后续组件统一使用。
  - `index.ts` 统一导出。
- 保留 `src/renderer/src/lib/i18n.ts` 作为兼容层，避免当前改动一次性波及过大。
- 为 i18n 增加单元测试：
  - locale 解析。
  - 无效语言回退。
  - 中英文 key parity。
  - 函数型文案插值。
- 新增 `docs/i18n-zh-CN-glossary.md`，沉淀中文术语和文案边界。
- 后续迁移按模块推进，每次迁移同步更新测试或搜索项，避免 UI 可见文案和设置搜索脱节。

## 风险与控制

- 风险：翻译表过大导致单文件膨胀。
  - 控制：先按领域分组，超过阈值后拆分到 `settings.ts`、`navigation.ts` 等领域文件。
- 风险：测试依赖英文文案导致中文模式失败。
  - 控制：新增 locale-aware helper，E2E 优先使用 role/test id 或翻译 helper。
- 风险：中文文案太生硬。
  - 控制：建立术语表和表达规范，UI 上优先使用中文使用场景里的自然说法。

## 验证策略

- 基础验证：`pnpm run typecheck:web`。
- 单元验证：`vitest run --config config/vitest.config.ts src/renderer/src/i18n/i18n.test.ts`。
- 回归验证：`pnpm run lint`，必要时执行全量 typecheck。
