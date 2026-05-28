import type { SettingFieldCopy } from './settings-types'

export type IntegrationsMessages = {
  search: {
    github: SettingFieldCopy
    gitlab: SettingFieldCopy
    bitbucket: SettingFieldCopy
    azureDevOps: SettingFieldCopy
    gitea: SettingFieldCopy
    linear: SettingFieldCopy
  }
  status: {
    connected: string
    configured: string
    notInstalled: string
    notAuthenticated: string
    notConfigured: string
    authFailed: string
    optionalSetup: string
  }
  actions: {
    installGitHubCli: string
    installGitLabCli: string
    learnMore: string
    recheck: string
    addWorkspace: string
    connect: string
    cancel: string
    test: string
    testing: string
    verifying: string
  }
  github: {
    description: string
    installHelp: string
    authHelp: string
  }
  gitlab: {
    description: string
    installHelp: string
    authHelp: string
  }
  bitbucket: {
    connectedDescription: (account: string | null) => string
    setupDescription: string
    configureHelp: string
    authFailedHelp: string
  }
  azureDevOps: {
    configuredDescription: (account: string | null, baseUrl: string | null) => string
    setupDescription: string
    configureHelp: string
    authFailedHelp: string
  }
  gitea: {
    configuredDescription: (account: string | null, baseUrl: string | null) => string
    setupDescription: string
    configureHelp: string
    authFailedHelp: string
  }
  linear: {
    description: string
    connectedDescription: (count: number) => string
    verified: string
    disconnectWorkspace: (workspace: string) => string
    workspaceKeyHint: string
    dialogTitle: string
    dialogDescriptionBeforeKey: string
    personalApiKey: string
    dialogDescriptionAfterKey: string
    createOneIn: string
    settingsSecurity: string
    newApiKey: string
    not: string
    newPasskey: string
    keychainHint: string
  }
  errors: {
    connectionFailed: string
  }
}
