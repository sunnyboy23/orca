import type { SshSettingsMessages } from './settings-ssh-types'

export const sshEn: SshSettingsMessages = {
  search: {
    connections: {
      title: 'SSH Connections',
      description: 'Manage remote SSH targets.',
      keywords: ['ssh', 'remote', 'server', 'connection', 'host']
    },
    addTarget: {
      title: 'Add SSH Target',
      description: 'Add a new remote SSH target.',
      keywords: ['ssh', 'add', 'new', 'target', 'host', 'server']
    },
    importConfig: {
      title: 'Import from SSH Config',
      description: 'Import hosts from ~/.ssh/config.',
      keywords: ['ssh', 'import', 'config', 'hosts']
    },
    testConnection: {
      title: 'Test Connection',
      description: 'Test connectivity to an SSH target.',
      keywords: ['ssh', 'test', 'connection', 'ping']
    }
  },
  toasts: {
    loadFailed: 'Failed to load SSH targets',
    hostAndUsernameRequired: 'Host and username are required',
    invalidPort: 'Port must be between 1 and 65535',
    invalidRelayGracePeriod: (maxSeconds) =>
      `Relay grace period must be between 60 and ${maxSeconds} seconds, or choose keep alive until reset`,
    targetUpdated: 'Target updated',
    targetAdded: 'Target added',
    saveFailed: 'Failed to save target',
    targetRemoved: 'Target removed',
    removeFailed: 'Failed to remove target',
    connectionFailed: 'Connection failed',
    disconnectFailed: 'Disconnect failed',
    remoteTerminalsEnded: 'Remote terminals ended',
    endRemoteTerminalsFailed: 'Failed to end remote terminals',
    relayReset: 'Remote relay reset',
    relayResetFailed: 'Failed to reset remote relay',
    connectionSuccessful: 'Connection successful',
    connectionTestFailed: 'Connection test failed',
    testFailed: 'Test failed',
    noNewHosts: 'No new hosts found in ~/.ssh/config',
    importedHosts: (count) => `Imported ${count} host${count > 1 ? 's' : ''}`,
    importFailed: 'Import failed'
  },
  header: {
    targets: 'Targets',
    description: 'Add a remote host to connect to it in Orca.',
    import: 'Import',
    addTarget: 'Add Target',
    empty: 'No SSH targets configured.'
  },
  status: {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    'auth-failed': 'Auth failed',
    'deploying-relay': 'Deploying relay...',
    connected: 'Connected',
    reconnecting: 'Reconnecting...',
    'reconnection-failed': 'Reconnection failed',
    error: 'Error'
  },
  card: {
    endingRemoteTerminals: 'Ending remote terminals',
    endRemoteTerminals: 'End remote terminals',
    resettingRemoteRelay: 'Resetting remote relay',
    resetRemoteRelay: 'Reset remote relay',
    editTarget: 'Edit target',
    removingTarget: 'Removing target',
    removeTarget: 'Remove target',
    disconnect: 'Disconnect',
    connecting: 'Connecting',
    test: 'Test',
    connect: 'Connect'
  },
  form: {
    editTitle: 'Edit SSH Target',
    newTitle: 'New SSH Target',
    label: 'Label',
    host: 'Host *',
    username: 'Username *',
    port: 'Port',
    identityFile: 'Identity File',
    proxyCommand: 'Proxy Command',
    jumpHost: 'Jump Host',
    relayGracePeriod: 'Relay Grace Period (seconds)',
    keepAliveUntilReset: 'Keep alive until reset',
    keepAliveDescription:
      'Remote terminals stay available until you end them or reset the relay.',
    relayHelp: (maxSeconds) =>
      `How long the relay keeps terminals alive after disconnect. Default: 10800 (3 hours). Maximum: ${maxSeconds} (7 days).`,
    saveChanges: 'Save Changes',
    addTarget: 'Add Target',
    cancel: 'Cancel',
    placeholders: {
      label: 'My Server',
      host: '192.168.1.100 or server.example.com',
      username: 'deploy',
      port: '22',
      identityFile: '~/.ssh/id_ed25519 (leave empty for SSH agent)',
      proxyCommand: 'e.g. cloudflared access ssh --hostname %h',
      jumpHost: 'bastion.example.com',
      untilReset: 'Until reset'
    },
    help: {
      identityFile: 'Optional. SSH agent is used by default.',
      proxyCommand: 'Optional. Used for tunneling (e.g. Cloudflare Access, ProxyCommand).',
      jumpHost: 'Optional. Equivalent to ProxyJump / ssh -J.'
    }
  },
  dialogs: {
    cancel: 'Cancel',
    remove: {
      title: 'Remove SSH Target',
      description: 'This will remove the target and end any active remote terminals.',
      action: 'Remove',
      busy: 'Removing'
    },
    resetRelay: {
      title: 'Reset Remote Relay?',
      description:
        'This force-stops the remote relay for this SSH target. Active remote terminals and port forwards for this target will end.',
      action: 'Reset Relay',
      busy: 'Resetting'
    },
    terminate: {
      title: 'End Remote Terminals?',
      description:
        'This will stop active terminal sessions on this SSH target. Reconnecting will not restore them.',
      action: 'End Terminals',
      busy: 'Ending'
    }
  }
}
