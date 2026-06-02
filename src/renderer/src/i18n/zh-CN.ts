import type { I18nMessages } from './types'
import { accountsZhCN } from './settings-accounts-zh-CN'
import { agentsZhCN } from './settings-agents-zh-CN'
import { zhCNSettingsMessages } from './settings'
import { commitMessageAiZhCN } from './settings-commit-message-ai-zh-CN'
import { experimentalZhCN, inputZhCN, privacyZhCN, tasksZhCN } from './settings-core-panes-zh-CN'
import { floatingWorkspaceZhCN } from './settings-floating-workspace-zh-CN'
import { gitZhCN } from './settings-git-zh-CN'
import { integrationsZhCN } from './settings-integrations-zh-CN'
import {
  notificationsZhCN,
  quickCommandsZhCN,
  runtimeZhCN,
  voiceZhCN
} from './settings-panes-zh-CN'
import { shortcutsZhCN } from './settings-shortcuts-zh-CN'
import { sshZhCN } from './settings-ssh-zh-CN'
import { terminalZhCN } from './settings-terminal-zh-CN'
import { zhCNWorkspaceMessages } from './workspace-zh-CN'
import { feishuChannelZhCN } from './feishu-channel-zh-CN'

export const zhCNMessages = {
  common: {
    ready: '已就绪',
    missing: (count: number) => `还差 ${count} 项`,
    checking: '检查中...',
    installed: '已安装',
    notInstalled: '未安装',
    install: '安装',
    recheck: '重新检查',
    remove: '移除'
  },
  language: {
    title: '语言',
    description: '选择 Orca 界面的显示语言。跟随系统会使用浏览器或桌面环境的语言。',
    system: '跟随系统',
    english: 'English',
    chinese: '简体中文'
  },
  orchestration: {
    title: 'Agent 编排',
    description: '通过消息、任务 DAG、分发和决策门协调多个编程 Agent。',
    switchLabel: 'Agent 编排',
    switchDescription: '让多个编程 Agent 通过任务 DAG、上下文注入和决策门协同工作。',
    ariaEnable: '启用 Agent 编排',
    skillTitle: '编排技能',
    skillDescription: '让 Agent 能通过 Orca 传递上下文并协同处理任务。',
    terminalTitle: '编排设置',
    terminalAriaLabel: '编排技能安装终端'
  },
  feishu: {
    title: '飞书个人机器人',
    description:
      '每位成员创建自己的飞书机器人。Orca 只需要 App ID 和 App Secret 来通信；应用权限和事件订阅仍在飞书后台配置。',
    createBot: '创建机器人',
    appSecret: 'App Secret',
    wiki: '团队知识库',
    base: '多维表格',
    repoBindings: '仓库绑定',
    guideTitle: '个人飞书机器人',
    guide:
      '在飞书开发者后台创建机器人，把 App ID 和 App Secret 填到这里。Orca 会把密钥保存在本机，并用它向飞书申请访问凭证。事件订阅、回调地址和机器人权限仍在飞书后台配置。',
    developerConsole: '开发者后台',
    appId: '机器人 App ID',
    appIdPlaceholder: 'cli_xxx',
    appSecretLabel: 'App Secret',
    appSecretPlaceholder: '飞书开发者后台中的 App Secret',
    credentialTitle: '凭证验证',
    credentialIdle: '验证 App ID 和 App Secret 是否能申请飞书访问凭证，不代表事件长连接已接通。',
    credentialChecking: '正在向飞书申请访问凭证...',
    credentialSuccess: (expiresIn: number) => `凭证验证通过，访问凭证将在 ${expiresIn} 秒后过期。`,
    connectionErrorFallback: '飞书连接测试失败。',
    testCredentials: '验证凭证',
    eventChannelTitle: '事件通道',
    eventChannelStatus: (state: string) => `当前状态：${state}`,
    eventChannelIdle: '尚未连接。连接后，Orca 会通过飞书长连接接收机器人消息。',
    eventChannelConnected: '已连接飞书事件通道，可以在飞书里向机器人发送任务。',
    eventChannelConnecting: '正在连接飞书事件通道...',
    eventChannelFailed: '事件通道连接失败，请检查飞书后台权限、事件订阅和应用发布状态。',
    eventChannelStopped: '事件通道已断开。',
    eventChannelLastConnected: (time: string) => `最近连接：${time}`,
    eventChannelLastEvent: (time: string) => `最近事件：${time}`,
    eventChannelLastError: (message: string) => `最近错误：${message}`,
    connectBot: '连接机器人',
    disconnectBot: '断开连接',
    teamWikiTitle: '团队知识库来源',
    teamWikiDescription:
      '团队成员统一授权到一个飞书知识库。Orca 会从这个知识空间发现公共配置和项目资料。',
    wikiSpaceId: '知识空间 ID',
    configNodeToken: '配置节点 token',
    projectDocsRootToken: '项目资料根节点 token',
    configBaseAppToken: '配置 Base app token',
    defaultViewId: '默认视图 ID',
    reposTableId: 'Repos 表 ID',
    capabilitiesTableId: 'Capabilities 表 ID',
    dependenciesTableId: 'Dependencies 表 ID',
    agentsTableId: 'Agents 表 ID',
    policiesTableId: 'Policies 表 ID',
    localBindingsTitle: '本机仓库绑定',
    localBindingsDescription: '把公共配置中的 repo_name 映射到这台机器上的本地或 SSH 工作区路径。',
    addBinding: '添加绑定',
    noBindings: '还没有配置仓库绑定。',
    localRepoPath: '本地仓库路径',
    optionalWorktreePath: '可选 worktree 路径'
  },
  feishuChannel: feishuChannelZhCN,
  settingsSearch: {
    orchestration: {
      title: 'Agent 编排',
      description: '通过消息、任务 DAG、分发和决策门协调多个编程 Agent。',
      keywords: [
        '编排',
        '多 Agent',
        '智能体',
        '协作',
        '消息',
        '分发',
        '任务',
        'DAG',
        'worker',
        'coordinator',
        '飞书'
      ]
    }
  },
  settings: zhCNSettingsMessages,
  settingsPanes: {
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
    terminal: terminalZhCN,
    voice: voiceZhCN
  },
  navigation: {
    tasks: '任务',
    openGitHubTasks: '打开 GitHub 任务',
    openGitLabTasks: '打开 GitLab 任务',
    openLinearTasks: '打开 Linear 任务',
    automations: '自动化',
    orchestration: '编排',
    agents: 'Agent',
    orcaMobile: 'Orca Mobile',
    newBadge: '新',
    hideFromSidebar: '从侧边栏隐藏',
    search: '搜索',
    searchWorktreesAndBrowserTabs: '搜索 worktree 和浏览器标签页'
  },
  window: {
    applicationMenu: '应用菜单',
    minimize: '最小化',
    maximize: '最大化',
    restore: '还原',
    close: '关闭'
  },
  updateCard: {
    dismiss: '关闭',
    dismissTip: '关闭提示',
    checking: '正在检查更新',
    latest: '已经是最新版本',
    available: '有可用更新',
    downloading: '正在下载更新',
    downloaded: '更新已准备安装',
    error: '更新错误',
    status: '更新状态',
    updateError: '更新错误',
    checkFailed: '检查更新失败',
    completeUpdateFailed: '无法完成更新。',
    checkUpdatesFailed: '无法检查更新。',
    retryDownload: '重试下载',
    recheck: '重新检查',
    restartInstallFailed: '无法重启并安装更新。',
    tryAgain: '重试',
    installing: '正在安装...',
    reassurance: '更新期间不会中断正在运行的终端会话。',
    newRelease: (title) => `新版本：${title}`,
    moreSinceLastUpdate: (count) => `上次更新后还有 ${count} 个版本`,
    fullReleaseNotes: '查看完整发布说明',
    update: '更新',
    releaseNotes: '发布说明',
    updateReady: (version) => `Orca v${version} 已准备好。`,
    sessionsNotInterrupted: '终端会话不会被中断。',
    downloadingTitle: '正在下载更新',
    minimizeToStatusBar: '最小化到状态栏',
    downloadingVersion: (version) => `正在下载 Orca v${version}。`,
    downloadingProgress: (percent) => `正在下载... ${percent}%`,
    downloadManually: '手动下载',
    readyToInstall: '已准备安装',
    downloadedRestart: (version) => `Orca v${version} 已下载完成。准备好后请重启安装。`,
    restartToUpdate: '重启并更新'
  },
  comboboxes: {
    agent: {
      blankTerminal: '空白终端',
      currentDefault: '当前默认',
      setAsDefault: '设为默认',
      search: '搜索 Agent...',
      noMatch: '没有匹配的 Agent。',
      manageAgents: '管理 Agent'
    },
    repo: {
      selectRepo: '选择仓库...',
      search: '搜索项目/文件夹...',
      noMatch: '没有匹配的项目或文件夹。',
      addingProject: '正在添加项目...',
      addProject: '添加项目'
    }
  },
  editorChrome: {
    slashCommands: '斜杠菜单',
    searchBlocks: '搜索内容块',
    searchBlocksPlaceholder: '搜索内容块...',
    noBlocksFound: '没有找到内容块',
    pasteOrTypeLink: '粘贴或输入链接...',
    openLink: '打开链接',
    editLink: '编辑链接',
    removeLink: '移除链接'
  },
  orchestrationPage: {
    title: '编排',
    subtitle: 'HelloAGENTS 运行监控',
    refreshRuns: '刷新运行',
    back: '返回',
    refresh: '刷新',
    retry: '重试',
    loadingRuns: '正在加载运行',
    loadingRunsBody: '正在读取本机编排数据库。',
    noRuns: '还没有运行',
    noRunsBody: '当 Orchestrator 通过 Orca 创建任务后，运行记录会显示在这里。',
    loadError: '无法加载编排状态',
    runs: '运行',
    recorded: (count: number) => `共 ${count} 条记录`,
    loadingRunDetail: '正在加载运行详情',
    updated: '更新于',
    root: '根仓库',
    waitingForDecision: '等待决策',
    counts: {
      completed: '已完成',
      runningOrReady: '运行中或就绪',
      blocked: '已阻塞',
      failed: '失败',
      artifacts: '产物'
    },
    taskDag: '任务 DAG',
    taskDagDescription: '查看依赖顺序、分发目标和 worker 执行结果。',
    noTasks: '这次运行还没有记录任务。',
    depends: (taskId: string) => `依赖 ${taskId}`,
    noDependencies: '无依赖',
    noArtifactDir: '无产物目录',
    repo: '仓库',
    worktree: 'Worktree',
    agent: 'Agent',
    unassigned: '未分配',
    unresolved: '未解析',
    notDispatched: '未分发',
    artifactsTitle: '产物',
    artifactsDescription: '从运行工作区索引到的 worker manifest。',
    noArtifacts: '还没有记录产物。',
    task: '任务',
    noChangedFiles: '没有列出变更文件。',
    moreFiles: (count: number) => `还有 ${count} 个文件`,
    gates: '决策门',
    gatesDescription: '当前和历史人工决策。',
    noGates: '还没有记录决策门。',
    resolved: '已决策',
    unknown: '未知',
    taskBlocked: '任务已阻塞。',
    taskFailed: '任务失败。',
    blockedBy: (taskId: string) => `被 ${taskId} 阻塞。`,
    runStatus: {
      idle: '空闲',
      running: '运行中',
      completed: '已完成',
      failed: '失败'
    },
    taskStatus: {
      pending: '等待中',
      ready: '已就绪',
      dispatched: '运行中',
      completed: '已完成',
      failed: '失败',
      blocked: '已阻塞'
    }
  },
  terminal: {
    loadingEditor: '正在加载编辑器...',
    saveTimedOut: '保存超时或失败。请先处理错误，再关闭文件。',
    unsavedChangesTitle: '有未保存的更改',
    unsavedFileChanges: (filename: string) => `"${filename}" 有未保存的更改。关闭前要保存吗？`,
    unsavedGenericChanges: '这个文件有未保存的更改。',
    cancel: '取消',
    dontSave: '不保存',
    save: '保存',
    closeWindowTitle: '关闭窗口？',
    closeWindowDescription: '有本地终端进程仍在运行。仍要关闭窗口吗？',
    close: '关闭'
  },
  sourceControl: {
    notes: '备注',
    collapseNotes: '收起备注',
    expandNotes: '展开备注',
    copyAllNotes: '复制全部备注',
    moreNoteActions: '更多备注操作',
    clearAllNotes: '清空全部备注...',
    filterFiles: '筛选文件...',
    deleteAllUntracked: '删除全部未跟踪文件',
    discardAll: '全部放弃',
    stageAll: '全部暂存',
    unstageAll: '全部取消暂存',
    failedToClearNotes: '清空备注失败。',
    noUnresolvedConflicts: '没有可发送的未解决冲突。',
    workspaceConnectionUnavailable: '无法解析工作区连接。',
    noAgentsDetected: '未检测到 AI Agent。请先在设置中配置默认 Agent。',
    agentLaunchCommandFailed: '无法生成 Agent 启动命令。',
    agentPromptFailed: '无法生成 Agent 提示词。',
    conflictsAgentStarted: '已为这些冲突启动 AI Agent。',
    commitFailureAgentStarted: '已为这次提交失败启动 AI Agent。'
  },
  workspace: zhCNWorkspaceMessages
} as const satisfies I18nMessages
