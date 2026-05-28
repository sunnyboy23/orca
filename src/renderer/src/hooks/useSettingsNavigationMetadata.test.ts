import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildSettingsNavigationMetadata } from './useSettingsNavigationMetadata'
import type { Repo } from '../../../shared/types'
import { accountsZhCN } from '@/i18n/settings-accounts-zh-CN'
import { agentsZhCN } from '@/i18n/settings-agents-zh-CN'
import { zhCNSettingsMessages } from '@/i18n/settings'
import {
  experimentalZhCN,
  inputZhCN,
  privacyZhCN,
  tasksZhCN
} from '@/i18n/settings-core-panes-zh-CN'
import { commitMessageAiZhCN } from '@/i18n/settings-commit-message-ai-zh-CN'
import { floatingWorkspaceZhCN } from '@/i18n/settings-floating-workspace-zh-CN'
import { gitZhCN } from '@/i18n/settings-git-zh-CN'
import { integrationsZhCN } from '@/i18n/settings-integrations-zh-CN'
import { notificationsZhCN, quickCommandsZhCN, runtimeZhCN } from '@/i18n/settings-panes-zh-CN'
import { shortcutsZhCN } from '@/i18n/settings-shortcuts-zh-CN'
import { sshZhCN } from '@/i18n/settings-ssh-zh-CN'
import { terminalZhCN } from '@/i18n/settings-terminal-zh-CN'

const repo = {
  id: 'repo-1',
  path: '/repo',
  displayName: 'Repo',
  badgeColor: '#000',
  addedAt: 0
} satisfies Repo

function ids(args: { isMac?: boolean; isWindows?: boolean; isWebClient?: boolean } = {}): string[] {
  return buildSettingsNavigationMetadata({
    isMac: args.isMac ?? false,
    isWindows: args.isWindows ?? false,
    isWebClient: args.isWebClient ?? false,
    repos: [repo]
  }).map((section) => section.id)
}

function sectionsZh() {
  return buildSettingsNavigationMetadata({
    isMac: true,
    isWindows: false,
    isWebClient: false,
    repos: [repo],
    settingsMessages: zhCNSettingsMessages,
    settingsPaneMessages: {
      accounts: accountsZhCN,
      agents: agentsZhCN,
      commitMessageAi: commitMessageAiZhCN,
      experimental: experimentalZhCN,
      floatingWorkspace: floatingWorkspaceZhCN,
      git: gitZhCN,
      input: inputZhCN,
      integrations: integrationsZhCN,
      notifications: notificationsZhCN,
      privacy: privacyZhCN,
      quickCommands: quickCommandsZhCN,
      runtime: runtimeZhCN,
      shortcuts: shortcutsZhCN,
      ssh: sshZhCN,
      tasks: tasksZhCN,
      terminal: terminalZhCN
    }
  })
}

describe('settings navigation metadata', () => {
  it('keeps desktop-only Settings panes out of web metadata', () => {
    const webIds = ids({ isWebClient: true })

    expect(webIds).not.toContain('browser')
    expect(webIds).not.toContain('ssh')
    expect(webIds).not.toContain('mobile')
    expect(webIds).not.toContain('computer-use')
    expect(webIds).not.toContain('voice')
    expect(webIds).toContain('servers')
    expect(webIds).toContain('repo-repo-1')
  })

  it('keeps macOS permissions mac-only', () => {
    expect(ids({ isMac: false })).not.toContain('developer-permissions')
    expect(ids({ isMac: true })).toContain('developer-permissions')
  })

  it('uses localized Settings metadata and search entries', () => {
    const sections = sectionsZh()
    const general = sections.find((section) => section.id === 'general')
    const appearance = sections.find((section) => section.id === 'appearance')
    const integrations = sections.find((section) => section.id === 'integrations')
    const accounts = sections.find((section) => section.id === 'accounts')
    const agents = sections.find((section) => section.id === 'agents')
    const floatingWorkspace = sections.find((section) => section.id === 'floating-workspace')
    const git = sections.find((section) => section.id === 'git')
    const input = sections.find((section) => section.id === 'input')
    const notifications = sections.find((section) => section.id === 'notifications')
    const privacy = sections.find((section) => section.id === 'privacy')
    const quickCommands = sections.find((section) => section.id === 'quick-commands')
    const runtime = sections.find((section) => section.id === 'servers')
    const tasks = sections.find((section) => section.id === 'tasks')
    const terminal = sections.find((section) => section.id === 'terminal')
    const ssh = sections.find((section) => section.id === 'ssh')
    const shortcuts = sections.find((section) => section.id === 'shortcuts')
    const experimental = sections.find((section) => section.id === 'experimental')

    expect(general?.title).toBe('通用')
    expect(appearance?.title).toBe('外观')
    expect(general?.searchEntries.some((entry) => entry.title === '工作区目录')).toBe(true)
    expect(appearance?.searchEntries.some((entry) => entry.title === '主题')).toBe(true)
    expect(agents?.searchEntries.some((entry) => entry.title === '默认 Agent')).toBe(true)
    expect(agents?.searchEntries.some((entry) => entry.title === 'Agent 工作时保持电脑唤醒')).toBe(
      true
    )
    expect(accounts?.searchEntries.some((entry) => entry.title === 'Claude 账号')).toBe(true)
    expect(accounts?.searchEntries.some((entry) => entry.title === '当前 Codex 账号')).toBe(true)
    expect(integrations?.searchEntries.some((entry) => entry.title === 'GitHub 集成')).toBe(true)
    expect(integrations?.searchEntries.some((entry) => entry.title === 'Linear 集成')).toBe(true)
    expect(git?.searchEntries.some((entry) => entry.title === '分支名前缀')).toBe(true)
    expect(git?.searchEntries.some((entry) => entry.title === '自定义命令')).toBe(true)
    expect(input?.searchEntries.some((entry) => entry.title === '中键粘贴选中内容')).toBe(true)
    expect(notifications?.searchEntries.some((entry) => entry.title === '启用通知')).toBe(true)
    expect(privacy?.searchEntries.some((entry) => entry.title === '共享匿名使用数据')).toBe(true)
    expect(quickCommands?.searchEntries.some((entry) => entry.title === '快捷命令')).toBe(true)
    expect(runtime?.searchEntries.some((entry) => entry.title === '当前服务')).toBe(true)
    expect(tasks?.searchEntries.some((entry) => entry.title === '任务来源')).toBe(true)
    expect(floatingWorkspace?.searchEntries.some((entry) => entry.title === '浮动工作区')).toBe(
      true
    )
    expect(terminal?.searchEntries.some((entry) => entry.title === '字号')).toBe(true)
    expect(terminal?.searchEntries.some((entry) => entry.title === '管理会话')).toBe(true)
    expect(ssh?.searchEntries.some((entry) => entry.title === 'SSH 连接')).toBe(true)
    expect(ssh?.searchEntries.some((entry) => entry.title === '从 SSH Config 导入')).toBe(true)
    expect(shortcuts?.searchEntries.some((entry) => entry.title === '终端里的快捷键')).toBe(true)
    expect(shortcuts?.searchEntries.some((entry) => entry.title === '跳转到文件')).toBe(true)
    expect(experimental?.searchEntries.some((entry) => entry.title === '桌面伙伴')).toBe(true)
  })

  it('does not import Settings page or pane UI modules from the metadata hook', () => {
    const testDir = dirname(fileURLToPath(import.meta.url))
    const hookSource = readFileSync(resolve(testDir, 'useSettingsNavigationMetadata.ts'), 'utf8')
    const importLines = hookSource
      .split('\n')
      .filter((line) => line.trim().startsWith('import '))
      .join('\n')

    expect(importLines).not.toMatch(/components\/settings\/Settings(?:'|")/)
    expect(importLines).not.toMatch(/components\/settings\/[A-Z][A-Za-z]+Pane(?:'|")/)
    expect(importLines).not.toMatch(/components\/stats\/StatsPane(?:'|")/)
  })

  it('does not import Settings page or pane UI modules from the quick action registry', () => {
    const testDir = dirname(fileURLToPath(import.meta.url))
    const registrySource = readFileSync(
      resolve(testDir, '../components/cmd-j/quick-actions.ts'),
      'utf8'
    )
    const importLines = registrySource
      .split('\n')
      .filter((line) => line.trim().startsWith('import '))
      .join('\n')

    expect(importLines).not.toMatch(/components\/settings\/Settings(?:'|")/)
    expect(importLines).not.toMatch(/components\/settings\/[A-Z][A-Za-z]+Pane(?:'|")/)
    expect(importLines).not.toMatch(/components\/stats\/StatsPane(?:'|")/)
  })
})
