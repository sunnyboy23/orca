/* oxlint-disable max-lines */
import { useMemo } from 'react'
// Why: this registry mirrors the Settings sidebar in one neutral module so
// Cmd+J and Settings visibility cannot drift. Keep it free of Settings pane UI
// imports; the boundary is enforced by a focused architecture test.
import {
  BarChart3,
  Bell,
  Blocks,
  Bot,
  Cable,
  FlaskConical,
  GitBranch,
  Globe,
  Keyboard,
  ListChecks,
  Lock,
  Mic,
  MousePointerClick,
  Network,
  Palette,
  PanelsTopLeft,
  Play,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  SquareTerminal,
  TextCursorInput,
  UserCog
} from 'lucide-react'
import type { Repo } from '../../../shared/types'
import { getRepoKindLabel } from '../../../shared/repo-kind'
import { useAppStore } from '@/store'
import { isMacUserAgent, isWindowsUserAgent } from '@/components/terminal-pane/pane-helpers'
import type { SettingsNavSection } from '@/lib/settings-navigation-types'
import { getGeneralPaneSearchEntries } from '@/components/settings/general-search'
import { getAgentsPaneSearchEntries } from '@/components/settings/agents-search'
import { getAccountsPaneSearchEntries } from '@/components/settings/accounts-search'
import { getIntegrationsPaneSearchEntries } from '@/components/settings/integrations-search'
import { getGitPaneSearchEntries } from '@/components/settings/git-search'
import { getCommitMessageAiPaneSearchEntries } from '@/components/settings/commit-message-ai-search'
import { getTasksPaneSearchEntries } from '@/components/settings/tasks-search'
import { getFloatingWorkspaceSearchEntries } from '@/components/settings/floating-workspace-search'
import { getAppearancePaneSearchEntries } from '@/components/settings/appearance-search'
import { getInputPaneSearchEntries } from '@/components/settings/input-search'
import { getTerminalPaneSearchEntries } from '@/components/settings/terminal-search'
import { getQuickCommandsPaneSearchEntries } from '@/components/settings/quick-commands-search'
import { BROWSER_PANE_SEARCH_ENTRIES } from '@/components/settings/browser-pane-search'
import { getNotificationsPaneSearchEntries } from '@/components/settings/notifications-search'
import { ORCHESTRATION_PANE_SEARCH_ENTRIES } from '@/components/settings/orchestration-search'
import {
  getRuntimeEnvironmentsSearchEntry,
  getWebRuntimeEnvironmentsSearchEntry
} from '@/components/settings/runtime-environments-search'
import { getSshPaneSearchEntries } from '@/components/settings/ssh-search'
import { MOBILE_SETTINGS_PANE_SEARCH_ENTRIES } from '@/components/settings/mobile-settings-search'
import { COMPUTER_USE_PANE_SEARCH_ENTRIES } from '@/components/settings/computer-use-search'
import { VOICE_PANE_SEARCH_ENTRIES } from '@/components/settings/voice-pane-search'
import { DEVELOPER_PERMISSIONS_PANE_SEARCH_ENTRIES } from '@/components/settings/developer-permissions-search'
import { getPrivacyPaneSearchEntries } from '@/components/settings/privacy-search'
import { getShortcutsPaneSearchEntries } from '@/components/settings/shortcuts-search'
import { STATS_PANE_SEARCH_ENTRIES } from '@/components/stats/stats-search'
import { getExperimentalPaneSearchEntries } from '@/components/settings/experimental-search'
import { getRepositoryPaneSearchEntries } from '@/components/settings/repository-search'
import { useI18n } from '@/i18n'
import type { AccountsMessages } from '@/i18n/settings-accounts-types'
import type { AgentsMessages } from '@/i18n/settings-agents-types'
import type { FloatingWorkspaceMessages } from '@/i18n/settings-floating-workspace-types'
import { enSettingsMessages, type SettingsMessages } from '@/i18n/settings'
import type {
  ExperimentalMessages,
  InputMessages,
  PrivacyMessages,
  TasksMessages
} from '@/i18n/settings-core-panes-types'
import type { IntegrationsMessages } from '@/i18n/settings-integrations-types'
import type {
  CommitMessageAiMessages,
  GitMessages,
  NotificationsMessages,
  QuickCommandsMessages,
  RuntimeMessages
} from '@/i18n/settings-panes-types'
import type { ShortcutsMessages } from '@/i18n/settings-shortcuts-types'
import type { SettingsTerminalMessages } from '@/i18n/settings-terminal-types'
import type { SshSettingsMessages } from '@/i18n/settings-ssh-types'

export function isWebClientLocation(): boolean {
  return (
    Boolean((window as unknown as { __ORCA_WEB_CLIENT__?: boolean }).__ORCA_WEB_CLIENT__) ||
    window.location.pathname.endsWith('/web-index.html')
  )
}

export function buildSettingsNavigationMetadata({
  isMac,
  isWindows,
  isWebClient,
  repos,
  settingsMessages = enSettingsMessages,
  settingsPaneMessages
}: {
  isMac: boolean
  isWindows: boolean
  isWebClient: boolean
  repos: readonly Repo[]
  settingsMessages?: SettingsMessages
  settingsPaneMessages?: Partial<{
    accounts: AccountsMessages
    agents: AgentsMessages
    experimental: ExperimentalMessages
    commitMessageAi: CommitMessageAiMessages
    floatingWorkspace: FloatingWorkspaceMessages
    git: GitMessages
    input: InputMessages
    integrations: IntegrationsMessages
    notifications: NotificationsMessages
    privacy: PrivacyMessages
    quickCommands: QuickCommandsMessages
    runtime: RuntimeMessages
    shortcuts: ShortcutsMessages
    ssh: SshSettingsMessages
    tasks: TasksMessages
    terminal: SettingsTerminalMessages
  }>
}): SettingsNavSection[] {
  const sections = settingsMessages.sections
  const showDesktopOnlySettings = !isWebClient
  const terminalPaneSearchEntries = getTerminalPaneSearchEntries(
    {
      isWindows,
      isMac
    },
    settingsPaneMessages?.terminal
  )
  const runtimeMessages = settingsPaneMessages?.runtime
  const runtimeEnvironmentsSearchEntry = isWebClient
    ? getWebRuntimeEnvironmentsSearchEntry(runtimeMessages)
    : getRuntimeEnvironmentsSearchEntry(runtimeMessages)
  const gitSearchEntries = [
    ...getGitPaneSearchEntries(settingsPaneMessages?.git),
    ...getCommitMessageAiPaneSearchEntries(settingsPaneMessages?.commitMessageAi)
  ]

  return [
    {
      id: 'general',
      title: sections.general.title,
      description: sections.general.description,
      icon: SlidersHorizontal,
      searchEntries: getGeneralPaneSearchEntries(settingsMessages),
      group: 'setup'
    },
    {
      id: 'agents',
      title: sections.agents.title,
      description: sections.agents.description,
      icon: Bot,
      searchEntries: getAgentsPaneSearchEntries(settingsPaneMessages?.agents),
      group: 'setup'
    },
    {
      id: 'accounts',
      title: sections.accounts.title,
      description: sections.accounts.description,
      icon: UserCog,
      searchEntries: getAccountsPaneSearchEntries(settingsPaneMessages?.accounts),
      group: 'setup',
      badge: sections.accounts.badge
    },
    {
      id: 'integrations',
      title: sections.integrations.title,
      description: sections.integrations.description,
      icon: Blocks,
      searchEntries: getIntegrationsPaneSearchEntries(settingsPaneMessages?.integrations),
      group: 'setup'
    },
    {
      id: 'git',
      title: sections.git.title,
      description: sections.git.description,
      icon: GitBranch,
      // Why: the AI commit messages pane is rendered inside Git, so shared
      // metadata must search both surfaces wherever Git appears.
      searchEntries: gitSearchEntries,
      group: 'workflows'
    },
    {
      id: 'tasks',
      title: sections.tasks.title,
      description: sections.tasks.description,
      icon: ListChecks,
      searchEntries: getTasksPaneSearchEntries(settingsPaneMessages?.tasks),
      group: 'workflows'
    },
    {
      id: 'floating-workspace',
      title: sections['floating-workspace'].title,
      description: sections['floating-workspace'].description,
      icon: PanelsTopLeft,
      searchEntries: getFloatingWorkspaceSearchEntries(settingsPaneMessages?.floatingWorkspace),
      group: 'workflows'
    },
    {
      id: 'appearance',
      title: sections.appearance.title,
      description: sections.appearance.description,
      icon: Palette,
      searchEntries: getAppearancePaneSearchEntries(settingsMessages),
      group: 'interface'
    },
    {
      id: 'input',
      title: sections.input.title,
      description: sections.input.description,
      icon: TextCursorInput,
      searchEntries: getInputPaneSearchEntries(settingsPaneMessages?.input),
      group: 'interface'
    },
    {
      id: 'terminal',
      title: sections.terminal.title,
      description: sections.terminal.description,
      icon: SquareTerminal,
      searchEntries: terminalPaneSearchEntries,
      group: 'workflows'
    },
    {
      id: 'quick-commands',
      title: sections['quick-commands'].title,
      description: sections['quick-commands'].description,
      icon: Play,
      searchEntries: getQuickCommandsPaneSearchEntries(settingsPaneMessages?.quickCommands),
      group: 'workflows'
    },
    ...(showDesktopOnlySettings
      ? [
          {
            id: 'browser',
            title: sections.browser.title,
            description: sections.browser.description,
            icon: Globe,
            searchEntries: BROWSER_PANE_SEARCH_ENTRIES,
            group: 'workflows'
          },
          {
            id: 'notifications',
            title: sections.notifications.title,
            description: sections.notifications.description,
            icon: Bell,
            searchEntries: getNotificationsPaneSearchEntries(settingsPaneMessages?.notifications),
            group: 'interface'
          }
        ]
      : []),
    {
      id: 'orchestration',
      title: sections.orchestration.title,
      description: sections.orchestration.description,
      icon: Network,
      searchEntries: ORCHESTRATION_PANE_SEARCH_ENTRIES,
      group: 'capabilities'
    },
    {
      id: 'servers',
      title: sections.servers.title,
      description: isWebClient
        ? (sections.servers.webDescription ?? sections.servers.description)
        : sections.servers.description,
      icon: Server,
      searchEntries: [runtimeEnvironmentsSearchEntry],
      group: 'remote',
      badge: sections.servers.badge
    },
    ...(showDesktopOnlySettings
      ? [
          {
            id: 'ssh',
            title: sections.ssh.title,
            description: sections.ssh.description,
            icon: Cable,
            searchEntries: getSshPaneSearchEntries(settingsPaneMessages?.ssh),
            group: 'remote'
          },
          {
            id: 'mobile',
            title: sections.mobile.title,
            description: sections.mobile.description,
            icon: Smartphone,
            searchEntries: MOBILE_SETTINGS_PANE_SEARCH_ENTRIES,
            group: 'remote',
            badge: sections.mobile.badge
          },
          {
            id: 'computer-use',
            title: sections['computer-use'].title,
            description: sections['computer-use'].description,
            icon: MousePointerClick,
            searchEntries: COMPUTER_USE_PANE_SEARCH_ENTRIES,
            group: 'capabilities',
            badge: sections['computer-use'].badge
          },
          {
            id: 'voice',
            title: sections.voice.title,
            description: sections.voice.description,
            icon: Mic,
            searchEntries: VOICE_PANE_SEARCH_ENTRIES,
            group: 'capabilities',
            badge: sections.voice.badge
          }
        ]
      : []),
    ...(showDesktopOnlySettings && isMac
      ? [
          {
            id: 'developer-permissions',
            title: sections['developer-permissions'].title,
            description: sections['developer-permissions'].description,
            icon: ShieldCheck,
            searchEntries: DEVELOPER_PERMISSIONS_PANE_SEARCH_ENTRIES,
            group: 'safety'
          }
        ]
      : []),
    {
      id: 'privacy',
      title: sections.privacy.title,
      description: sections.privacy.description,
      icon: Lock,
      searchEntries: getPrivacyPaneSearchEntries(settingsPaneMessages?.privacy),
      group: 'safety'
    },
    {
      id: 'shortcuts',
      title: sections.shortcuts.title,
      description: sections.shortcuts.description,
      icon: Keyboard,
      searchEntries: getShortcutsPaneSearchEntries(settingsPaneMessages?.shortcuts),
      group: 'interface'
    },
    {
      id: 'stats',
      title: sections.stats.title,
      description: sections.stats.description,
      icon: BarChart3,
      searchEntries: STATS_PANE_SEARCH_ENTRIES,
      group: 'interface'
    },
    {
      id: 'experimental',
      title: sections.experimental.title,
      description: sections.experimental.description,
      icon: FlaskConical,
      searchEntries: getExperimentalPaneSearchEntries(settingsPaneMessages?.experimental),
      group: 'experimental'
    },
    ...repos.map((repo) => ({
      id: `repo-${repo.id}`,
      title: repo.displayName,
      description: `${getRepoKindLabel(repo)} • ${repo.path}`,
      icon: SlidersHorizontal,
      searchEntries: getRepositoryPaneSearchEntries(repo),
      group: 'repositories'
    }))
  ]
}

export function useSettingsNavigationMetadata(): SettingsNavSection[] {
  const { messages } = useI18n()
  const repos = useAppStore((state) => state.repos)
  const isMac = isMacUserAgent()
  const isWindows = isWindowsUserAgent()
  const isWebClient = isWebClientLocation()

  // Why: Settings and Cmd+J share this metadata so platform/runtime visibility
  // and search entries cannot drift. Keep this hook free of Settings pane UI
  // imports; see docs/reference/cmd-j-settings-actions-plan.md.
  return useMemo(
    () =>
      buildSettingsNavigationMetadata({
        isMac,
        isWindows,
        isWebClient,
        repos,
        settingsMessages: messages.settings,
        settingsPaneMessages: messages.settingsPanes
      }),
    [isMac, isWindows, isWebClient, repos, messages.settings, messages.settingsPanes]
  )
}
