import type { SettingFieldCopy } from './settings-types'

export type AccountsMessages = {
  search: {
    claude: SettingFieldCopy
    codex: SettingFieldCopy
    activeCodex: SettingFieldCopy
    gemini: SettingFieldCopy
    opencodeCookie: SettingFieldCopy
    opencodeWorkspace: SettingFieldCopy
  }
  common: {
    accounts: string
    addAccount: string
    active: string
    systemDefault: string
    codexAccount: string
    claudeAccount: string
    reauthenticate: string
    remove: string
    removeAccount: string
    cancel: string
    clear: string
  }
  toasts: {
    codexLoadFailed: string
    claudeLoadFailed: string
    codexUpdateFailed: string
    claudeUpdated: string
    claudeUpdateFailed: string
    claudeRestartDescription: (previous: string, next: string) => string
  }
  errors: {
    codexSignInTimeout: string
    codexUnavailable: string
    codexSignInFailed: string
    claudeSignInFailed: string
  }
  claude: {
    sectionDescription: string
    settingDescription: string
    rowDescription: string
    systemDefaultDescription: string
    empty: string
    removeDialogTitle: string
    removeDialogDescription: string
  }
  codex: {
    sectionDescription: string
    wslDescription: (distro: string) => string
    localAuthDescription: string
    settingDescription: string
    rowDescription: (distro?: string | null) => string
    empty: (distro?: string | null) => string
    systemDefaultDescription: string
    removeDialogTitle: string
    removeDialogDescription: string
  }
  gemini: {
    sectionDescription: string
    title: string
    titleWithExperiment: string
    description: string
  }
  opencode: {
    sectionDescription: string
    cookieTitle: string
    cookieLabel: string
    cookieDescription: string
    cookieHelp: string
    workspaceTitle: string
    workspaceLabel: string
    workspaceDescription: string
    workspaceHelp: string
    cookiePlaceholder: string
    workspacePlaceholder: string
  }
}
