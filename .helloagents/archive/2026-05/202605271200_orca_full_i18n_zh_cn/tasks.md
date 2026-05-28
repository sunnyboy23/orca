# Orca 全量中文支持任务拆分

## LIVE_STATUS

- status: completed
- completed: 11
- failed: 0
- pending: 0
- total: 11
- percent: 100
- current: 已完成

## Tasks

- [√] T01 i18n 基础设施：建立 `src/renderer/src/i18n/`，迁移现有轻量 helper，保留兼容导出。 | depends_on: []
- [√] T02 翻译结构测试：增加 locale 解析、fallback、key parity、插值测试。 | depends_on: [T01]
- [√] T03 中文术语表：新增中文术语、保留英文边界、文案风格规则。 | depends_on: [T01]
- [√] T04 设置页一期：完成 General / Agent 编排 / 飞书配置的正式 i18n 接入。 | depends_on: [T01]
- [√] T05 Orchestration 运行页：迁移运行、任务 DAG、决策门、产物和状态文案。 | depends_on: [T01]
- [√] T06 主导航与工作区：迁移侧边栏、工作区列表、创建 / 删除 / 归档流程文案。 | depends_on: [T01]
- [√] T07 Source Control / Tasks / Terminal：迁移常用工具面板文案。 | depends_on: [T01]
- [√] T08 Toast / Dialog / Empty / Error：迁移反馈类文案，保证危险操作语义清楚。 | depends_on: [T01]
- [√] T09 测试断言改造：将关键英文断言替换为稳定 selector 或翻译 helper。 | depends_on: [T04, T05, T06, T07, T08]
- [√] T10 中英文 smoke：增加或调整 E2E smoke，覆盖英文和中文设置入口。 | depends_on: [T09]
- [√] T11 全量验证与归档：运行类型检查、lint、相关测试，更新状态并归档方案包。 | depends_on: [T10]

## 执行日志

- 2026-05-27 12:00 创建方案包，进入 T01。
- 2026-05-27 12:12 完成 i18n 基础目录、key parity 测试和中文术语表，进入 T04。
- 2026-05-27 12:42 完成设置一期、编排运行页和主导航入口迁移；T06 剩余工作区创建 / 删除 / 归档流程；相关测试和 web 类型检查通过。
- 2026-05-27 12:46 完成 Terminal 未保存 / 关闭窗口对话框和 Source Control 高频提示中文化；新增硬编码英文扫描脚本，后续用于收敛剩余重复文案。
- 2026-05-27 12:55 扫描脚本目标清零，并挂载 `pnpm run check:i18n-copy`；目标测试和 web 类型检查通过。
- 2026-05-27 13:45 完成工作区创建 / 删除 / 清理 / 侧边栏菜单 / 端口 / 文件浏览器高频入口中文化；新增工作区中英文 smoke 断言；`check:i18n-copy`、`typecheck:web`、`lint` 和相关测试通过。
- 2026-05-27 13:50 完成全量验证：`check:i18n-copy`、`typecheck:web`、`lint`、相关 vitest、完整 `typecheck` 均通过；方案包准备归档。
