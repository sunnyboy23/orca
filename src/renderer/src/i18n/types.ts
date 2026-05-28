import type { AppLanguage } from '../../../shared/types'
import type { AccountsMessages } from './settings-accounts-types'
import type {
  ExperimentalMessages,
  InputMessages,
  PrivacyMessages,
  TasksMessages
} from './settings-core-panes-types'
import type { IntegrationsMessages } from './settings-integrations-types'
import type { AgentsMessages } from './settings-agents-types'
import type { FloatingWorkspaceMessages } from './settings-floating-workspace-types'
import type {
  NotificationsMessages,
  CommitMessageAiMessages,
  GitMessages,
  QuickCommandsMessages,
  RuntimeMessages
} from './settings-panes-types'
import type { ShortcutsMessages } from './settings-shortcuts-types'
import type { SshSettingsMessages } from './settings-ssh-types'
import type { SettingsTerminalMessages } from './settings-terminal-types'
import type { SettingsMessages } from './settings'
import type { WorkspaceMessages } from './workspace'
import type { FeishuChannelMessages } from './feishu-channel-types'

export type SupportedLocale = 'en' | 'zh-CN'

export type LocalePreference = AppLanguage

export type I18nSettings = {
  appLanguage?: AppLanguage
}

export type I18nMessages = {
  common: {
    ready: string
    missing: (count: number) => string
    checking: string
    installed: string
    notInstalled: string
    install: string
    recheck: string
    remove: string
  }
  language: {
    title: string
    description: string
    system: string
    english: string
    chinese: string
  }
  orchestration: {
    title: string
    description: string
    switchLabel: string
    switchDescription: string
    ariaEnable: string
    skillTitle: string
    skillDescription: string
    terminalTitle: string
    terminalAriaLabel: string
  }
  feishu: {
    title: string
    description: string
    createBot: string
    appSecret: string
    wiki: string
    base: string
    repoBindings: string
    guideTitle: string
    guide: string
    developerConsole: string
    appId: string
    appIdPlaceholder: string
    appSecretLabel: string
    appSecretPlaceholder: string
    credentialTitle: string
    credentialIdle: string
    credentialChecking: string
    credentialSuccess: (expiresIn: number) => string
    connectionErrorFallback: string
    testCredentials: string
    eventChannelTitle: string
    eventChannelStatus: (state: string) => string
    eventChannelIdle: string
    eventChannelConnected: string
    eventChannelConnecting: string
    eventChannelFailed: string
    eventChannelStopped: string
    eventChannelLastConnected: (time: string) => string
    eventChannelLastEvent: (time: string) => string
    eventChannelLastError: (message: string) => string
    connectBot: string
    disconnectBot: string
    teamWikiTitle: string
    teamWikiDescription: string
    wikiSpaceId: string
    configNodeToken: string
    projectDocsRootToken: string
    configBaseAppToken: string
    defaultViewId: string
    reposTableId: string
    capabilitiesTableId: string
    dependenciesTableId: string
    agentsTableId: string
    policiesTableId: string
    localBindingsTitle: string
    localBindingsDescription: string
    addBinding: string
    noBindings: string
    localRepoPath: string
    optionalWorktreePath: string
  }
  feishuChannel: FeishuChannelMessages
  settingsSearch: {
    orchestration: {
      title: string
      description: string
      keywords: string[]
    }
  }
  settings: SettingsMessages
  settingsPanes: {
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
  }
  navigation: {
    tasks: string
    openGitHubTasks: string
    openGitLabTasks: string
    openLinearTasks: string
    automations: string
    orchestration: string
    agents: string
    orcaMobile: string
    newBadge: string
    hideFromSidebar: string
    search: string
    searchWorktreesAndBrowserTabs: string
  }
  window: {
    minimize: string
    maximize: string
    restore: string
    close: string
  }
  orchestrationPage: {
    title: string
    subtitle: string
    refreshRuns: string
    back: string
    refresh: string
    retry: string
    loadingRuns: string
    loadingRunsBody: string
    noRuns: string
    noRunsBody: string
    loadError: string
    runs: string
    recorded: (count: number) => string
    loadingRunDetail: string
    updated: string
    root: string
    waitingForDecision: string
    counts: {
      completed: string
      runningOrReady: string
      blocked: string
      failed: string
      artifacts: string
    }
    taskDag: string
    taskDagDescription: string
    noTasks: string
    depends: (taskId: string) => string
    noDependencies: string
    noArtifactDir: string
    repo: string
    worktree: string
    agent: string
    unassigned: string
    unresolved: string
    notDispatched: string
    artifactsTitle: string
    artifactsDescription: string
    noArtifacts: string
    task: string
    noChangedFiles: string
    moreFiles: (count: number) => string
    gates: string
    gatesDescription: string
    noGates: string
    resolved: string
    unknown: string
    taskBlocked: string
    taskFailed: string
    blockedBy: (taskId: string) => string
    runStatus: Record<'idle' | 'running' | 'completed' | 'failed', string>
    taskStatus: Record<
      'pending' | 'ready' | 'dispatched' | 'completed' | 'failed' | 'blocked',
      string
    >
  }
  terminal: {
    loadingEditor: string
    saveTimedOut: string
    unsavedChangesTitle: string
    unsavedFileChanges: (filename: string) => string
    unsavedGenericChanges: string
    cancel: string
    dontSave: string
    save: string
    closeWindowTitle: string
    closeWindowDescription: string
    close: string
  }
  sourceControl: {
    notes: string
    collapseNotes: string
    expandNotes: string
    copyAllNotes: string
    moreNoteActions: string
    clearAllNotes: string
    filterFiles: string
    deleteAllUntracked: string
    discardAll: string
    stageAll: string
    unstageAll: string
    failedToClearNotes: string
    noUnresolvedConflicts: string
    workspaceConnectionUnavailable: string
    noAgentsDetected: string
    agentLaunchCommandFailed: string
    agentPromptFailed: string
    conflictsAgentStarted: string
    commitFailureAgentStarted: string
  }
  workspace: WorkspaceMessages
}
