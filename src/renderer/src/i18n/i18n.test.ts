import { describe, expect, it } from 'vitest'
import { enMessages } from './en'
import { getMessages, MESSAGES } from './messages'
import { normalizeAppLanguage, resolveLocale } from './locale'
import { zhCNMessages } from './zh-CN'

describe('i18n locale resolution', () => {
  it('uses an explicit supported language preference', () => {
    expect(resolveLocale({ appLanguage: 'en' }, 'zh-CN')).toBe('en')
    expect(resolveLocale({ appLanguage: 'zh-CN' }, 'en-US')).toBe('zh-CN')
  })

  it('falls back from system preference to browser language', () => {
    expect(resolveLocale({ appLanguage: 'system' }, 'zh-Hans-CN')).toBe('zh-CN')
    expect(resolveLocale({ appLanguage: 'system' }, 'fr-FR')).toBe('en')
  })

  it('normalizes unknown persisted values to system', () => {
    expect(normalizeAppLanguage('zh')).toBe('system')
    expect(normalizeAppLanguage(null)).toBe('system')
  })

  it('returns a stable fallback message table', () => {
    expect(getMessages('en').language.title).toBe('Language')
    expect(getMessages('zh-CN').language.title).toBe('语言')
  })
})

describe('i18n message parity', () => {
  it('keeps English and Chinese message keys aligned', () => {
    expect(collectMessageShape(zhCNMessages)).toEqual(collectMessageShape(enMessages))
  })

  it('keeps every registered locale aligned with English', () => {
    const englishShape = collectMessageShape(enMessages)
    for (const [locale, messages] of Object.entries(MESSAGES)) {
      expect(collectMessageShape(messages), locale).toEqual(englishShape)
    }
  })

  it('supports function copy interpolation in both locales', () => {
    expect(enMessages.common.missing(2)).toBe('2 missing')
    expect(zhCNMessages.common.missing(2)).toBe('还差 2 项')
    expect(enMessages.feishu.credentialSuccess(60)).toContain('60')
    expect(zhCNMessages.feishu.credentialSuccess(60)).toContain('60')
    expect(enMessages.settings.common.noSettingsFound('theme')).toContain('theme')
    expect(zhCNMessages.settings.common.noSettingsFound('主题')).toContain('主题')
    expect(zhCNMessages.settings.repository.sectionTitle('Orca')).toBe('项目设置 > Orca')
  })

  it('smoke checks high-impact Settings copy in Chinese', () => {
    expect(zhCNMessages.settings.sidebar.searchPlaceholder).toBe('搜索设置')
    expect(zhCNMessages.settings.sections.general.title).toBe('通用')
    expect(zhCNMessages.settings.general.fields.workspaceDirectory.title).toBe('工作区目录')
    expect(zhCNMessages.settings.appearance.fields.theme.title).toBe('主题')
    expect(zhCNMessages.settings.appearance.themeOptions.system).toBe('跟随系统')
    expect(zhCNMessages.settingsPanes.notifications.fields.enable.title).toBe('启用通知')
    expect(zhCNMessages.settingsPanes.quickCommands.savedCommands.title).toBe('已保存命令')
    expect(zhCNMessages.settingsPanes.runtime.labels.activeServer).toBe('当前服务')
    expect(zhCNMessages.settingsPanes.git.branchPrefix.title).toBe('分支名前缀')
    expect(zhCNMessages.settingsPanes.commitMessageAi.enable.title).toBe('启用 AI Commit Message')
    expect(zhCNMessages.settingsPanes.commitMessageAi.thinking.levels.medium).toBe('中')
    expect(zhCNMessages.settingsPanes.input.middleClickPaste.title).toBe('中键粘贴选中内容')
    expect(zhCNMessages.settingsPanes.tasks.header.title).toBe('任务来源')
    expect(zhCNMessages.settingsPanes.privacy.telemetry.title).toBe('共享匿名使用数据')
    expect(zhCNMessages.settingsPanes.experimental.pet.title).toBe('桌面伙伴')
    expect(zhCNMessages.settingsPanes.terminal.sections.typography.title).toBe('排版')
    expect(zhCNMessages.settingsPanes.terminal.manageSessions.search.title).toBe('管理会话')
    expect(zhCNMessages.settingsPanes.ssh.header.targets).toBe('目标')
    expect(zhCNMessages.settingsPanes.ssh.status.connected).toBe('已连接')
    expect(zhCNMessages.settingsPanes.integrations.search.github.title).toBe('GitHub 集成')
    expect(zhCNMessages.settingsPanes.integrations.status.notAuthenticated).toBe('未认证')
    expect(zhCNMessages.settingsPanes.accounts.search.claude.title).toBe('Claude 账号')
    expect(zhCNMessages.settingsPanes.accounts.common.addAccount).toBe('添加账号')
    expect(zhCNMessages.settingsPanes.agents.defaultAgent.title).toBe('默认 Agent')
    expect(zhCNMessages.settingsPanes.floatingWorkspace.enable.label).toBe('启用浮动工作区')
    expect(zhCNMessages.settingsPanes.shortcuts.header.title).toBe('键盘快捷键')
    expect(zhCNMessages.settingsPanes.shortcuts.actions['worktree.quickOpen'].title).toBe(
      '跳转到文件'
    )
  })

  it('smoke checks workspace copy in English and Chinese', () => {
    expect(enMessages.workspace.create.createWorkspace).toBe('Create Workspace')
    expect(zhCNMessages.workspace.create.createWorkspace).toBe('创建工作区')
    expect(enMessages.workspace.delete.forceDelete).toBe('Force Delete')
    expect(zhCNMessages.workspace.delete.forceDelete).toBe('强制删除')
    expect(enMessages.workspace.cleanup.deleteSelected).toBe('Delete selected')
    expect(zhCNMessages.workspace.cleanup.deleteSelected).toBe('删除已选')
    expect(enMessages.workspace.menu.openInOrcaBrowser).toBe('Open in Orca Browser')
    expect(zhCNMessages.workspace.menu.openInOrcaBrowser).toBe('在 Orca 浏览器中打开')
  })

  it('keeps dangerous workspace delete wording explicit in Chinese', () => {
    expect(
      zhCNMessages.workspace.delete.mainWorktreeNotice('Git 不允许移除 main worktree。')
    ).toContain('main worktree')
    expect(zhCNMessages.workspace.menu.deleteChangedFilesHint).toContain('强制删除')
  })
})

function collectMessageShape(value: unknown): unknown {
  if (typeof value === 'function') {
    return 'function'
  }
  if (Array.isArray(value)) {
    return ['array']
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, collectMessageShape(child)])
    )
  }
  return 'string'
}
