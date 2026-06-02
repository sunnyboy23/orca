import type { SettingFieldCopy } from './settings-types'

export type NotificationsMessages = {
  system: {
    unsupported: string
    customSoundFailed: string
    soundFailed: string
    macFailureTitle: string
    macFailureDescription: string
    windowsFailureTitle: string
    windowsFailureDescription: string
    macRequestedTitle: string
    macRequestedDescription: string
    openSettings: string
    sent: string
    genericFailureTitle: string
    genericFailureDescription: string
    disabled: string
    notDelivered: string
  }
  fields: {
    enable: SettingFieldCopy
    agentTaskComplete: SettingFieldCopy
    terminalBell: SettingFieldCopy
    suppressWhileFocused: SettingFieldCopy
    sound: SettingFieldCopy
    volume: SettingFieldCopy
    sendTest: SettingFieldCopy
  }
  chooseSoundPlaceholder: string
  chooseCustomFile: string
  changeCustomFile: string
  customPath: (path: string) => string
  sendTestButton: string
}

export type QuickCommandsMessages = {
  scope: {
    global: string
    missingProject: string
    allCommands: string
    none: string
  }
  savedCommands: {
    title: string
    description: string
    add: string
    empty: string
    emptyForScope: string
    untitled: string
    noCommandText: string
    enter: string
    insert: string
    editAria: (label: string) => string
    removeAria: (label: string) => string
  }
  deleteDialog: {
    title: (label: string) => string
    description: string
    confirm: string
  }
  search: SettingFieldCopy
}

export type RuntimeMessages = {
  search: SettingFieldCopy
  webSearch: SettingFieldCopy
  labels: {
    activeServer: string
    localDesktop: string
    noServerConnected: string
    remoteServer: string
    savedServers: string
    serverName: string
    pairingCode: string
    shareServer: string
    switchTo: string
    noEndpoint: string
  }
  descriptions: {
    activeServerLocal: string
    activeServerWeb: string
    pairingHelp: string
    noSavedServers: string
    shareServer: string
    switchServer: string
    removeActiveLocal: string
    removeActiveWeb: string
    removeInactive: string
  }
  actions: {
    refresh: string
    addServer: string
    cancel: string
    switch: string
    remove: string
    newLink: string
    hideForm: string
  }
  feedback: {
    loadFailed: string
    required: string
    duplicate: (name: string) => string
    saveFailed: string
    connected: (name: string) => string
    saved: (name: string) => string
    removed: (name: string) => string
    removeFailed: string
    switchLocalFailed: string
    disconnectFailed: string
    switchFailed: string
    switched: (name: string) => string
  }
  placeholders: {
    serverName: string
    pairingCode: string
  }
}

export type VoiceMessages = {
  enable: SettingFieldCopy & {
    dynamicDescription: (shortcut: string) => string
  }
  mode: SettingFieldCopy & {
    toggle: string
    hold: string
    dynamicDescription: (shortcut: string) => string
  }
  model: SettingFieldCopy & {
    selectedDescription: (label: string, description: string) => string
    selectAndDownload: string
    selectModel: string
    streaming: string
    offline: string
    recommended: string
    extracting: string
  }
  feedback: {
    permissionGranted: string
    openedSettings: string
    permissionRequired: string
    requestFailed: string
    downloadFailed: string
    deleteFailed: string
  }
}

export type GitMessages = {
  branchPrefix: SettingFieldCopy & {
    options: Record<'gitUsername' | 'custom' | 'none', string>
    noGitUsername: string
    customPlaceholder: string
  }
  refreshLocalBaseRef: SettingFieldCopy & {
    rowDescription: string
  }
  githubApiBudget: SettingFieldCopy
  attribution: SettingFieldCopy
}

export type CommitMessageAiMessages = {
  header: {
    title: string
    description: string
  }
  enable: SettingFieldCopy & {
    rowDescription: string
  }
  agent: SettingFieldCopy & {
    rowDescription: string
    notConfigured: string
    comingSoon: string
    custom: string
    unsupportedDefault: (agent: string) => string
    unsupportedSelectedComingSoon: (agent: string) => string
    unsupportedSelected: (agent: string) => string
    chooseSupported: string
  }
  customCommand: SettingFieldCopy & {
    label: string
    help: {
      beforePlaceholder: string
      afterPlaceholder: string
      stdin: string
      quoting: string
    }
    placeholder: (placeholder: string) => string
  }
  model: SettingFieldCopy & {
    dynamicDescription: string
    staticDescription: string
    refresh: string
    discoveryFailed: string
  }
  thinking: SettingFieldCopy & {
    rowDescription: string
    levels: Record<'off' | 'low' | 'medium' | 'high' | 'xhigh' | 'max', string>
  }
  customPrompt: SettingFieldCopy & {
    rowDescription: string
    placeholder: string
    unsavedChanges: string
    saved: string
    discard: string
    saving: string
    save: string
  }
}
