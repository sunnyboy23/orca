import type { AccountsMessages } from './settings-accounts-types'

export const accountsZhCN: AccountsMessages = {
  search: {
    claude: {
      title: 'Claude 账号',
      description: '为 Claude 提供可选账号切换，同时保留共享聊天上下文。',
      keywords: ['claude', 'account', 'switch', 'active', 'status bar', 'quota', '账号', '切换']
    },
    codex: {
      title: 'Codex 账号',
      description: '为 Codex 提供可选账号切换，并读取实时额度。',
      keywords: ['codex', 'account', 'rate limit', 'status bar', 'quota', '账号', '额度']
    },
    activeCodex: {
      title: '当前 Codex 账号',
      description: '选择哪个已保存的 Codex 账号用于实时额度读取。',
      keywords: ['codex', 'account', 'switch', 'active', 'status bar', '当前', '账号']
    },
    gemini: {
      title: '使用 Gemini CLI 凭证',
      description: '从本机 Gemini CLI 安装中提取 OAuth 凭证，用于向 Google 认证。',
      keywords: ['gemini', 'cli', 'oauth', 'credentials', 'experimental', 'rate limit', '凭证']
    },
    opencodeCookie: {
      title: 'OpenCode Go Session Cookie',
      description: '粘贴 opencode.ai session cookie，用于读取额度。',
      keywords: ['opencode', 'cookie', 'session', 'rate limit', 'status bar']
    },
    opencodeWorkspace: {
      title: 'OpenCode Go Workspace ID',
      description: '自动查找失败时，可手动填写 workspace ID。',
      keywords: ['opencode', 'workspace', 'id', 'wrk', 'rate limit', 'status bar']
    }
  },
  common: {
    accounts: '账号',
    addAccount: '添加账号',
    active: '当前',
    systemDefault: '系统默认',
    codexAccount: 'Codex 账号',
    claudeAccount: 'Claude 账号',
    reauthenticate: '重新认证',
    remove: '移除',
    removeAccount: '移除账号',
    cancel: '取消',
    clear: '清空'
  },
  toasts: {
    codexLoadFailed: '无法加载 Codex 账号。',
    claudeLoadFailed: '无法加载 Claude 账号。',
    codexUpdateFailed: 'Codex 账号更新失败。',
    claudeUpdated: 'Claude 账号已更新。',
    claudeUpdateFailed: 'Claude 账号更新失败。',
    claudeRestartDescription: (previous, next) =>
      `${previous} → ${next}。继续旧会话前，请重启正在运行的 Claude 终端。`
  },
  errors: {
    codexSignInTimeout: 'Codex 登录耗时过长，请重试。',
    codexUnavailable: 'Codex 登录暂时不可用，请稍后再试。',
    codexSignInFailed: 'Codex 登录失败，请重试。',
    claudeSignInFailed: 'Claude 登录失败，请重试。'
  },
  claude: {
    sectionDescription:
      '可选。Orca 可以使用你平常的 Claude 登录；只有需要在不移动聊天会话的情况下快速切换账号时，才需要在这里添加。',
    settingDescription: '为共享 Claude auth 文件提供可选账号切换。',
    rowDescription: 'Orca 只切换 Claude auth；配置和聊天历史仍保留在共享 Claude 根目录中。',
    systemDefaultDescription: '使用当前系统 Claude 登录。',
    empty: '还没有托管的 Claude 账号。添加前，Orca 会使用系统默认 Claude 登录。',
    removeDialogTitle: '移除 Claude 账号？',
    removeDialogDescription:
      'Orca 会删除这个已保存账号的托管 Claude auth。如果它当前正在使用，Orca 会回退到系统默认 Claude 登录。'
  },
  codex: {
    sectionDescription:
      '可选。Orca 可以使用你平常的 Codex 登录；只有需要在 Orca 内快速切换账号时，才需要添加账号。',
    wslDescription: (distro) =>
      `WSL 终端会使用 ${distro} 内的 Codex 登录。托管 Codex 账号切换只作用于宿主机终端。`,
    localAuthDescription: '每个账号都会在 Orca 中保留独立的本地登录上下文，账号认证只保存在本机。',
    settingDescription: '管理 Orca 用于实时额度读取的 Codex 账号。',
    rowDescription: (distro) =>
      distro
        ? `请在 ${distro} 中使用 codex login 切换 WSL Codex 账号。`
        : '添加 Codex 账号后即可在 Orca 中使用。',
    empty: (distro) =>
      distro
        ? `还没有托管的宿主机 Codex 账号。WSL 终端会使用 ${distro} 中的 Codex 登录。`
        : '还没有托管的 Codex 账号。添加前，Orca 会使用系统默认 Codex 登录。',
    systemDefaultDescription: '使用当前系统 Codex 登录。',
    removeDialogTitle: '移除 Codex 账号？',
    removeDialogDescription:
      'Orca 会删除这个已保存账号的托管 Codex home。如果它当前正在使用，Orca 会回退到系统默认 Codex 登录。'
  },
  gemini: {
    sectionDescription: '配置 Gemini provider。',
    title: '使用 Gemini CLI 凭证',
    titleWithExperiment: '使用 Gemini CLI 凭证（实验性）',
    description:
      '从本机 Gemini CLI 安装中提取 OAuth 凭证，用于向 Google 认证。这些凭证签发给 Gemini CLI，而不是 Orca。如果 Google 更新 CLI，功能可能失效，请自行评估风险。'
  },
  opencode: {
    sectionDescription: '配置 OpenCode Go provider。',
    cookieTitle: 'OpenCode Go Session Cookie',
    cookieLabel: 'OpenCode Go session cookie',
    cookieDescription: '粘贴 opencode.ai session cookie，用于读取额度。',
    cookieHelp:
      '可以粘贴原始 token（例如 Fe26.2**...），也可以粘贴完整 cookie header（例如 auth=Fe26.2**...）。在浏览器 DevTools → Network → 任意 opencode.ai 请求 → Cookie header 中查看。',
    workspaceTitle: 'OpenCode Go Workspace ID',
    workspaceLabel: 'Workspace ID override',
    workspaceDescription: '自动查找失败时，可手动填写 workspace ID。',
    workspaceHelp:
      '登录 opencode.ai 后可在 URL 中找到，例如 opencode.ai/workspace/wrk_.../go。',
    cookiePlaceholder: 'Fe26.2**... token 或 auth=Fe26.2**... header',
    workspacePlaceholder: 'wrk_...（留空则自动查找）'
  }
}
