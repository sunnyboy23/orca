import type { IntegrationsMessages } from './settings-integrations-types'

export const integrationsZhCN: IntegrationsMessages = {
  search: {
    github: {
      title: 'GitHub 集成',
      description: '通过 gh CLI 进行 GitHub 认证。',
      keywords: ['github', 'gh', 'integration', '集成', '认证']
    },
    gitlab: {
      title: 'GitLab 集成',
      description: '通过 glab CLI 进行 GitLab 认证。',
      keywords: ['gitlab', 'glab', 'integration', 'mr', 'merge request', '集成', '认证']
    },
    bitbucket: {
      title: 'Bitbucket 集成',
      description: '通过 API token 环境变量认证 Bitbucket Cloud。',
      keywords: ['bitbucket', 'integration', 'pull request', 'api token', '集成', '认证']
    },
    azureDevOps: {
      title: 'Azure DevOps 集成',
      description: '通过 token 环境变量认证 Azure DevOps Repos。',
      keywords: ['azure devops', 'azure repos', 'ado', 'integration', 'pull request', 'api token', '集成']
    },
    gitea: {
      title: 'Gitea 集成',
      description: '通过 API token 环境变量认证 Gitea。',
      keywords: ['gitea', 'self-hosted', 'integration', 'pull request', 'api token', '集成']
    },
    linear: {
      title: 'Linear 集成',
      description: '连接 Linear 以浏览和关联 issue。',
      keywords: ['linear', 'integration', 'api key', 'connect', 'disconnect', '集成', '连接']
    }
  },
  status: {
    connected: '已连接',
    configured: '已配置',
    notInstalled: '未安装',
    notAuthenticated: '未认证',
    notConfigured: '未配置',
    authFailed: '认证失败',
    optionalSetup: '可选配置'
  },
  actions: {
    installGitHubCli: '安装 GitHub CLI',
    installGitLabCli: '安装 GitLab CLI',
    learnMore: '了解更多',
    recheck: '重新检查',
    addWorkspace: '添加 workspace',
    connect: '连接',
    cancel: '取消',
    test: '测试',
    testing: '测试中...',
    verifying: '验证中...'
  },
  github: {
    description: '通过 gh CLI 使用 pull request、issue 和检查。',
    installHelp: '安装 GitHub CLI 后即可使用 pull request、issue 和检查。',
    authHelp: 'GitHub CLI 已安装但尚未认证。请在终端中运行以下命令：'
  },
  gitlab: {
    description: '通过 glab CLI 使用 merge request、issue、todo 和 pipeline。',
    installHelp: '安装 GitLab CLI 后即可使用 merge request、issue 和 pipeline。',
    authHelp: 'GitLab CLI 已安装但尚未认证。请在终端中运行以下命令：'
  },
  bitbucket: {
    connectedDescription: (account) =>
      account ? `${account} · Pull request 和构建状态` : 'Pull request 和构建状态',
    setupDescription: '通过 Bitbucket Cloud API token 使用 pull request 和构建状态。',
    configureHelp:
      '设置 ORCA_BITBUCKET_EMAIL 和 ORCA_BITBUCKET_API_TOKEN，或设置 ORCA_BITBUCKET_ACCESS_TOKEN。',
    authFailedHelp:
      'Bitbucket 凭证已配置但认证失败。请检查 token 和仓库权限；如果修改了环境变量，请重启 Orca。'
  },
  azureDevOps: {
    configuredDescription: (account, baseUrl) =>
      account
        ? `${account} · Pull request 和构建状态`
        : baseUrl
          ? `${baseUrl} · Pull request 和构建状态`
          : '已检测到 Azure Repos 的 pull request 和构建状态',
    setupDescription: '通过 Azure DevOps REST API token 使用 pull request 和构建状态。',
    configureHelp:
      '设置 ORCA_AZURE_DEVOPS_TOKEN，或设置 ORCA_AZURE_DEVOPS_ACCESS_TOKEN。仅当 Orca 无法从 git remote 推导 API base URL 时，再设置 ORCA_AZURE_DEVOPS_API_BASE_URL。',
    authFailedHelp:
      'Azure DevOps 凭证已配置但认证失败。请检查 token、API base URL 和仓库权限；如果修改了环境变量，请重启 Orca。'
  },
  gitea: {
    configuredDescription: (account, baseUrl) =>
      account
        ? `${account} · Pull request 和 commit 状态`
        : baseUrl
          ? `${baseUrl} · Pull request 和 commit 状态`
          : '已检测到仓库的 pull request 和 commit 状态',
    setupDescription: '通过 Gitea REST API 使用 pull request 和 commit 状态。',
    configureHelp:
      '公开仓库会从 git remote 自动识别。私有仓库请设置 ORCA_GITEA_TOKEN；仅当 Orca 无法从 remote 推导 API URL 时，再设置 ORCA_GITEA_API_BASE_URL。',
    authFailedHelp:
      'Gitea 凭证已配置但认证失败。请检查 token、API base URL 和仓库权限；如果修改了环境变量，请重启 Orca。'
  },
  linear: {
    description: '浏览 issue，并把 issue 关联到 workspace。',
    connectedDescription: (count) => `已连接 ${count} 个 workspace`,
    verified: '已验证',
    disconnectWorkspace: (workspace) => `断开 ${workspace}`,
    workspaceKeyHint: '每个 workspace 都使用单独的本地 API key。',
    dialogTitle: '连接 Linear workspace',
    dialogDescriptionBeforeKey: '粘贴',
    personalApiKey: 'Personal API key',
    dialogDescriptionAfterKey: '即可把 workspace 添加到 Orca。',
    createOneIn: '可在',
    settingsSecurity: 'Linear Settings → Security',
    newApiKey: 'New API key',
    not: '不是',
    newPasskey: 'New passkey',
    keychainHint: '你的 key 会通过系统钥匙串加密，并只保存在本机。'
  },
  errors: {
    connectionFailed: '连接失败'
  }
}
