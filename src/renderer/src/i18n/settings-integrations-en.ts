import type { IntegrationsMessages } from './settings-integrations-types'

export const integrationsEn: IntegrationsMessages = {
  search: {
    github: {
      title: 'GitHub Integration',
      description: 'GitHub authentication via the gh CLI.',
      keywords: ['github', 'gh', 'integration']
    },
    gitlab: {
      title: 'GitLab Integration',
      description: 'GitLab authentication via the glab CLI.',
      keywords: ['gitlab', 'glab', 'integration', 'mr', 'merge request']
    },
    bitbucket: {
      title: 'Bitbucket Integration',
      description: 'Bitbucket Cloud authentication via API token environment variables.',
      keywords: ['bitbucket', 'integration', 'pull request', 'api token']
    },
    azureDevOps: {
      title: 'Azure DevOps Integration',
      description: 'Azure DevOps Repos authentication via token environment variables.',
      keywords: ['azure devops', 'azure repos', 'ado', 'integration', 'pull request', 'api token']
    },
    gitea: {
      title: 'Gitea Integration',
      description: 'Gitea authentication via API token environment variables.',
      keywords: ['gitea', 'self-hosted', 'integration', 'pull request', 'api token']
    },
    linear: {
      title: 'Linear Integration',
      description: 'Connect Linear to browse and link issues.',
      keywords: ['linear', 'integration', 'api key', 'connect', 'disconnect']
    }
  },
  status: {
    connected: 'Connected',
    configured: 'Configured',
    notInstalled: 'Not installed',
    notAuthenticated: 'Not authenticated',
    notConfigured: 'Not configured',
    authFailed: 'Auth failed',
    optionalSetup: 'Optional setup'
  },
  actions: {
    installGitHubCli: 'Install GitHub CLI',
    installGitLabCli: 'Install GitLab CLI',
    learnMore: 'Learn more',
    recheck: 'Re-check',
    addWorkspace: 'Add workspace',
    connect: 'Connect',
    cancel: 'Cancel',
    test: 'Test',
    testing: 'Testing...',
    verifying: 'Verifying...'
  },
  github: {
    description: 'Pull requests, issues, and checks via the gh CLI.',
    installHelp: 'Install the GitHub CLI to enable pull requests, issues, and checks.',
    authHelp:
      'The GitHub CLI is installed but not authenticated. Run this command in a terminal:'
  },
  gitlab: {
    description: 'Merge requests, issues, todos, and pipelines via the glab CLI.',
    installHelp: 'Install the GitLab CLI to enable merge requests, issues, and pipelines.',
    authHelp:
      'The GitLab CLI is installed but not authenticated. Run this command in a terminal:'
  },
  bitbucket: {
    connectedDescription: (account) =>
      account ? `${account} · Pull requests and build statuses` : 'Pull requests and build statuses',
    setupDescription: 'Pull requests and build statuses via Bitbucket Cloud API tokens.',
    configureHelp:
      'Set ORCA_BITBUCKET_EMAIL and ORCA_BITBUCKET_API_TOKEN, or set ORCA_BITBUCKET_ACCESS_TOKEN.',
    authFailedHelp:
      'Bitbucket credentials are configured but could not authenticate. Check the token and repository permissions, then restart Orca if environment variables changed.'
  },
  azureDevOps: {
    configuredDescription: (account, baseUrl) =>
      account
        ? `${account} · Pull requests and build statuses`
        : baseUrl
          ? `${baseUrl} · Pull requests and build statuses`
          : 'Pull requests and build statuses for detected Azure Repos',
    setupDescription: 'Pull requests and build statuses via Azure DevOps REST API tokens.',
    configureHelp:
      'Set ORCA_AZURE_DEVOPS_TOKEN, or set ORCA_AZURE_DEVOPS_ACCESS_TOKEN. Set ORCA_AZURE_DEVOPS_API_BASE_URL only when Orca cannot derive the API base URL from the git remote.',
    authFailedHelp:
      'Azure DevOps credentials are configured but could not authenticate. Check the token, API base URL, and repository permissions, then restart Orca if environment variables changed.'
  },
  gitea: {
    configuredDescription: (account, baseUrl) =>
      account
        ? `${account} · Pull requests and commit statuses`
        : baseUrl
          ? `${baseUrl} · Pull requests and commit statuses`
          : 'Pull requests and commit statuses for detected repositories',
    setupDescription: 'Pull requests and commit statuses via the Gitea REST API.',
    configureHelp:
      'Public repositories are detected from their git remote. Set ORCA_GITEA_TOKEN for private repositories, and set ORCA_GITEA_API_BASE_URL only when Orca cannot derive the API URL from the remote.',
    authFailedHelp:
      'Gitea credentials are configured but could not authenticate. Check the token, API base URL, and repository permissions, then restart Orca if environment variables changed.'
  },
  linear: {
    description: 'Browse and link issues to workspaces.',
    connectedDescription: (count) => `${count} workspace${count === 1 ? '' : 's'} connected`,
    verified: 'Verified',
    disconnectWorkspace: (workspace) => `Disconnect ${workspace}`,
    workspaceKeyHint: 'Each workspace uses its own locally stored API key.',
    dialogTitle: 'Connect Linear workspace',
    dialogDescriptionBeforeKey: 'Paste a',
    personalApiKey: 'Personal API key',
    dialogDescriptionAfterKey: 'to add a workspace to Orca.',
    createOneIn: 'Create one in',
    settingsSecurity: 'Linear Settings → Security',
    newApiKey: 'New API key',
    not: 'not',
    newPasskey: 'New passkey',
    keychainHint: 'Your key is encrypted via the OS keychain and stored locally.'
  },
  errors: {
    connectionFailed: 'Connection failed'
  }
}
