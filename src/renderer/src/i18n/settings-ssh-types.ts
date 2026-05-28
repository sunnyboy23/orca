import type { SettingFieldCopy } from './settings-types'

export type SshSettingsMessages = {
  search: {
    connections: SettingFieldCopy
    addTarget: SettingFieldCopy
    importConfig: SettingFieldCopy
    testConnection: SettingFieldCopy
  }
  toasts: {
    loadFailed: string
    hostAndUsernameRequired: string
    invalidPort: string
    invalidRelayGracePeriod: (maxSeconds: number) => string
    targetUpdated: string
    targetAdded: string
    saveFailed: string
    targetRemoved: string
    removeFailed: string
    connectionFailed: string
    disconnectFailed: string
    remoteTerminalsEnded: string
    endRemoteTerminalsFailed: string
    relayReset: string
    relayResetFailed: string
    connectionSuccessful: string
    connectionTestFailed: string
    testFailed: string
    noNewHosts: string
    importedHosts: (count: number) => string
    importFailed: string
  }
  header: {
    targets: string
    description: string
    import: string
    addTarget: string
    empty: string
  }
  status: Record<
    | 'disconnected'
    | 'connecting'
    | 'auth-failed'
    | 'deploying-relay'
    | 'connected'
    | 'reconnecting'
    | 'reconnection-failed'
    | 'error',
    string
  >
  card: {
    endingRemoteTerminals: string
    endRemoteTerminals: string
    resettingRemoteRelay: string
    resetRemoteRelay: string
    editTarget: string
    removingTarget: string
    removeTarget: string
    disconnect: string
    connecting: string
    test: string
    connect: string
  }
  form: {
    editTitle: string
    newTitle: string
    label: string
    host: string
    username: string
    port: string
    identityFile: string
    proxyCommand: string
    jumpHost: string
    relayGracePeriod: string
    keepAliveUntilReset: string
    keepAliveDescription: string
    relayHelp: (maxSeconds: number) => string
    saveChanges: string
    addTarget: string
    cancel: string
    placeholders: {
      label: string
      host: string
      username: string
      port: string
      identityFile: string
      proxyCommand: string
      jumpHost: string
      untilReset: string
    }
    help: {
      identityFile: string
      proxyCommand: string
      jumpHost: string
    }
  }
  dialogs: {
    cancel: string
    remove: {
      title: string
      description: string
      action: string
      busy: string
    }
    resetRelay: {
      title: string
      description: string
      action: string
      busy: string
    }
    terminate: {
      title: string
      description: string
      action: string
      busy: string
    }
  }
}
