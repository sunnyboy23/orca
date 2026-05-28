import type { I18nMessages } from './types'
import { accountsEn } from './settings-accounts-en'
import { agentsEn } from './settings-agents-en'
import { enSettingsMessages } from './settings'
import { commitMessageAiEn } from './settings-commit-message-ai-en'
import { experimentalEn, inputEn, privacyEn, tasksEn } from './settings-core-panes-en'
import { floatingWorkspaceEn } from './settings-floating-workspace-en'
import { gitEn } from './settings-git-en'
import { integrationsEn } from './settings-integrations-en'
import { notificationsEn, quickCommandsEn, runtimeEn } from './settings-panes-en'
import { shortcutsEn } from './settings-shortcuts-en'
import { sshEn } from './settings-ssh-en'
import { terminalEn } from './settings-terminal-en'
import { enWorkspaceMessages } from './workspace-en'
import { feishuChannelEn } from './feishu-channel-en'

export const enMessages = {
  common: {
    ready: 'Ready',
    missing: (count: number) => `${count} missing`,
    checking: 'Checking...',
    installed: 'Installed',
    notInstalled: 'Not installed',
    install: 'Install',
    recheck: 'Re-check',
    remove: 'Remove'
  },
  language: {
    title: 'Language',
    description:
      'Choose the display language for Orca. System follows your browser or desktop locale.',
    system: 'System',
    english: 'English',
    chinese: '简体中文'
  },
  orchestration: {
    title: 'Agent Orchestration',
    description:
      'Coordinate multiple coding agents via messaging, task DAGs, dispatch, and decision gates.',
    switchLabel: 'Agent Orchestration',
    switchDescription:
      'Coordinate multiple coding agents with messaging, task DAGs, dispatch with preamble injection, decision gates, and coordinator loops.',
    ariaEnable: 'Enable agent orchestration',
    skillTitle: 'Orchestration skill',
    skillDescription: 'Enables agents to hand off context and coordinate work through Orca.',
    terminalTitle: 'Orchestration setup',
    terminalAriaLabel: 'Orchestration skill install terminal'
  },
  feishu: {
    title: 'Feishu personal bot setup',
    description:
      'Each user creates their own Feishu bot. Orca only needs the app ID and app secret to communicate; Feishu app permissions and event subscriptions stay in Feishu.',
    createBot: 'Create bot',
    appSecret: 'App secret',
    wiki: 'Team Wiki',
    base: 'Base',
    repoBindings: 'Repo bindings',
    guideTitle: 'Personal Feishu bot',
    guide:
      'Create a bot in Feishu Developer Console, copy its app ID, and store the generated app secret here. Orca stores the secret locally and uses it to request Feishu access tokens. Configure event subscriptions, callback URL, and bot permissions in Feishu.',
    developerConsole: 'Developer Console',
    appId: 'Bot app ID',
    appIdPlaceholder: 'cli_xxx',
    appSecretLabel: 'App secret',
    appSecretPlaceholder: 'App Secret from Feishu Developer Console',
    credentialTitle: 'Credential check',
    credentialIdle:
      'Checks whether the app ID and app secret can request a Feishu access token. This does not mean the event long connection is online.',
    credentialChecking: 'Requesting a Feishu access token...',
    credentialSuccess: (expiresIn: number) =>
      `Credentials verified. Token expires in ${expiresIn}s.`,
    connectionErrorFallback: 'Failed to test Feishu connection.',
    testCredentials: 'Check credentials',
    eventChannelTitle: 'Event channel',
    eventChannelStatus: (state: string) => `Current status: ${state}`,
    eventChannelIdle:
      'Not connected yet. After connecting, Orca receives bot messages through Feishu long connection.',
    eventChannelConnected:
      'Connected to Feishu event channel. You can send tasks to the bot in Feishu.',
    eventChannelConnecting: 'Connecting to Feishu event channel...',
    eventChannelFailed:
      'Event channel connection failed. Check Feishu permissions, event subscriptions, and app release status.',
    eventChannelStopped: 'Event channel disconnected.',
    eventChannelLastConnected: (time: string) => `Last connected: ${time}`,
    eventChannelLastEvent: (time: string) => `Last event: ${time}`,
    eventChannelLastError: (message: string) => `Last error: ${message}`,
    connectBot: 'Connect bot',
    disconnectBot: 'Disconnect',
    teamWikiTitle: 'Team Wiki source',
    teamWikiDescription:
      'Team members are authorized on one Feishu Wiki. Orca discovers public config and project docs from that knowledge space.',
    wikiSpaceId: 'Wiki space ID',
    configNodeToken: 'Config node token',
    projectDocsRootToken: 'Project docs root token',
    configBaseAppToken: 'Config Base app token',
    defaultViewId: 'Default view ID',
    reposTableId: 'Repos table ID',
    capabilitiesTableId: 'Capabilities table ID',
    dependenciesTableId: 'Dependencies table ID',
    agentsTableId: 'Agents table ID',
    policiesTableId: 'Policies table ID',
    localBindingsTitle: 'Local repo bindings',
    localBindingsDescription:
      "Map public repo_name values to this user's local or SSH workspace paths.",
    addBinding: 'Add binding',
    noBindings: 'No repo bindings configured yet.',
    localRepoPath: 'Local repo path',
    optionalWorktreePath: 'Optional worktree path'
  },
  feishuChannel: feishuChannelEn,
  settingsSearch: {
    orchestration: {
      title: 'Agent Orchestration',
      description:
        'Coordinate multiple coding agents via messaging, task DAGs, dispatch, and decision gates.',
      keywords: [
        'orchestration',
        'multi-agent',
        'agents',
        'coordination',
        'messaging',
        'dispatch',
        'task',
        'DAG',
        'worker',
        'coordinator'
      ]
    }
  },
  settings: enSettingsMessages,
  settingsPanes: {
    accounts: accountsEn,
    agents: agentsEn,
    commitMessageAi: commitMessageAiEn,
    experimental: experimentalEn,
    floatingWorkspace: floatingWorkspaceEn,
    git: gitEn,
    input: inputEn,
    integrations: integrationsEn,
    notifications: notificationsEn,
    privacy: privacyEn,
    quickCommands: quickCommandsEn,
    runtime: runtimeEn,
    shortcuts: shortcutsEn,
    ssh: sshEn,
    tasks: tasksEn,
    terminal: terminalEn
  },
  navigation: {
    tasks: 'Tasks',
    openGitHubTasks: 'Open GitHub tasks',
    openGitLabTasks: 'Open GitLab tasks',
    openLinearTasks: 'Open Linear tasks',
    automations: 'Automations',
    orchestration: 'Orchestration',
    agents: 'Agents',
    orcaMobile: 'Orca Mobile',
    newBadge: 'New',
    hideFromSidebar: 'Hide from sidebar',
    search: 'Search',
    searchWorktreesAndBrowserTabs: 'Search worktrees and browser tabs'
  },
  window: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    close: 'Close'
  },
  orchestrationPage: {
    title: 'Orchestration',
    subtitle: 'HelloAGENTS run monitor',
    refreshRuns: 'Refresh runs',
    back: 'Back',
    refresh: 'Refresh',
    retry: 'Retry',
    loadingRuns: 'Loading runs',
    loadingRunsBody: 'Reading the local orchestration database.',
    noRuns: 'No runs yet',
    noRunsBody: 'Runs will appear here after an Orchestrator creates tasks through Orca.',
    loadError: 'Could not load orchestration state',
    runs: 'Runs',
    recorded: (count: number) => `${count} recorded`,
    loadingRunDetail: 'Loading run detail',
    updated: 'Updated',
    root: 'Root',
    waitingForDecision: 'Waiting for decision',
    counts: {
      completed: 'Completed',
      runningOrReady: 'Running or ready',
      blocked: 'Blocked',
      failed: 'Failed',
      artifacts: 'Artifacts'
    },
    taskDag: 'Task DAG',
    taskDagDescription: 'Dependency order, dispatch target, and worker result.',
    noTasks: 'No tasks recorded for this run.',
    depends: (taskId: string) => `depends ${taskId}`,
    noDependencies: 'No dependencies',
    noArtifactDir: 'No artifact dir',
    repo: 'Repo',
    worktree: 'Worktree',
    agent: 'Agent',
    unassigned: 'Unassigned',
    unresolved: 'Unresolved',
    notDispatched: 'Not dispatched',
    artifactsTitle: 'Artifacts',
    artifactsDescription: 'Worker manifests indexed from the run workspace.',
    noArtifacts: 'No artifacts recorded.',
    task: 'task',
    noChangedFiles: 'No changed files listed.',
    moreFiles: (count: number) => `+${count} more files`,
    gates: 'Gates',
    gatesDescription: 'Current and historical human decisions.',
    noGates: 'No decision gates recorded.',
    resolved: 'Resolved',
    unknown: 'Unknown',
    taskBlocked: 'Task is blocked.',
    taskFailed: 'Task failed.',
    blockedBy: (taskId: string) => `Blocked by ${taskId}.`,
    runStatus: {
      idle: 'Idle',
      running: 'Running',
      completed: 'Completed',
      failed: 'Failed'
    },
    taskStatus: {
      pending: 'Waiting',
      ready: 'Ready',
      dispatched: 'Running',
      completed: 'Completed',
      failed: 'Failed',
      blocked: 'Blocked'
    }
  },
  terminal: {
    loadingEditor: 'Loading editor...',
    saveTimedOut: 'Save timed out or failed. Fix errors before closing.',
    unsavedChangesTitle: 'Unsaved Changes',
    unsavedFileChanges: (filename: string) =>
      `"${filename}" has unsaved changes. Do you want to save before closing?`,
    unsavedGenericChanges: 'This file has unsaved changes.',
    cancel: 'Cancel',
    dontSave: "Don't Save",
    save: 'Save',
    closeWindowTitle: 'Close Window?',
    closeWindowDescription:
      'There are local terminals with running processes. Close the window anyway?',
    close: 'Close'
  },
  sourceControl: {
    notes: 'Notes',
    collapseNotes: 'Collapse notes',
    expandNotes: 'Expand notes',
    copyAllNotes: 'Copy all notes',
    moreNoteActions: 'More note actions',
    clearAllNotes: 'Clear all notes...',
    filterFiles: 'Filter files...',
    deleteAllUntracked: 'Delete all untracked',
    discardAll: 'Discard all',
    stageAll: 'Stage all',
    unstageAll: 'Unstage all',
    failedToClearNotes: 'Failed to clear notes.',
    noUnresolvedConflicts: 'No unresolved conflicts to send.',
    workspaceConnectionUnavailable: 'Unable to resolve the workspace connection.',
    noAgentsDetected: 'No AI agents detected. Configure a default agent in Settings.',
    agentLaunchCommandFailed: 'Could not build the agent launch command.',
    agentPromptFailed: 'Could not build the agent prompt.',
    conflictsAgentStarted: 'Started an AI agent for the conflicts.',
    commitFailureAgentStarted: 'Started an AI agent for the commit failure.'
  },
  workspace: enWorkspaceMessages
} as const satisfies I18nMessages
