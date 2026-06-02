import type {
  NotificationsMessages,
  QuickCommandsMessages,
  RuntimeMessages,
  VoiceMessages
} from './settings-panes-types'

export const notificationsEn: NotificationsMessages = {
  system: {
    unsupported: 'Notifications are not supported on this system',
    customSoundFailed: 'Custom notification sound could not be played',
    soundFailed: 'Notification sound could not be played',
    macFailureTitle: 'macOS did not show the notification',
    macFailureDescription: 'Enable Allow notifications for Orca in System Settings.',
    windowsFailureTitle: 'Windows did not show the notification',
    windowsFailureDescription: 'Enable notifications for Orca in Windows Settings.',
    macRequestedTitle: 'Test notification requested',
    macRequestedDescription: 'If no macOS banner appeared, enable Allow notifications for Orca.',
    openSettings: 'Open Settings',
    sent: 'Test notification sent',
    genericFailureTitle: 'System did not show the notification',
    genericFailureDescription: 'Check your desktop notification settings for Orca.',
    disabled: 'Notifications are disabled',
    notDelivered: 'Test notification was not delivered'
  },
  fields: {
    enable: {
      title: 'Enable Notifications',
      description: 'Native system notifications for background events.',
      keywords: ['notifications', 'desktop', 'system', 'native']
    },
    agentTaskComplete: {
      title: 'Agent Task Complete',
      description: 'A coding agent finishes and becomes idle.',
      keywords: ['notifications', 'agent', 'complete', 'idle', 'task']
    },
    terminalBell: {
      title: 'Terminal Bell',
      description: 'A background terminal emits a bell character.',
      keywords: ['notifications', 'terminal', 'bell', 'attention']
    },
    suppressWhileFocused: {
      title: 'Suppress While Focused',
      description: 'Skip notifications when the triggering worktree is already visible.',
      keywords: ['notifications', 'focused', 'suppress', 'filtering']
    },
    sound: {
      title: 'Notification Sound',
      description: 'Choose the alert Orca plays when a desktop notification is delivered.',
      keywords: ['notifications', 'sound', 'audio', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']
    },
    volume: {
      title: 'Notification Volume',
      description: 'Playback volume for non-system notification sounds.',
      keywords: ['notifications', 'sound', 'volume', 'loudness']
    },
    sendTest: {
      title: 'Send Test Notification',
      description: 'Trigger a sample desktop notification using the native delivery path.',
      keywords: ['notifications', 'test']
    }
  },
  chooseSoundPlaceholder: 'Choose notification sound',
  chooseCustomFile: 'Choose Custom File',
  changeCustomFile: 'Change Custom File',
  customPath: (path) => `Custom: ${path}`,
  sendTestButton: 'Send Test Notification'
}

export const quickCommandsEn: QuickCommandsMessages = {
  scope: {
    global: 'Global',
    missingProject: 'Missing project',
    allCommands: 'All commands',
    none: 'None'
  },
  savedCommands: {
    title: 'Saved Commands',
    description:
      'Run them from the Quick Commands button in the tab bar, or right-click inside any terminal.',
    add: 'Add Command',
    empty: 'No quick commands saved.',
    emptyForScope: 'No commands in the selected scopes.',
    untitled: 'Untitled',
    noCommandText: 'No command text',
    enter: 'Enter',
    insert: 'Insert',
    editAria: (label) => `Edit ${label}`,
    removeAria: (label) => `Remove ${label}`
  },
  deleteDialog: {
    title: (label) => `Delete "${label}"?`,
    description: 'This quick command will be removed from your saved list.',
    confirm: 'Delete'
  },
  search: {
    title: 'Quick Commands',
    description:
      'Saved terminal commands that can be launched from any terminal, scoped globally or to a specific project.',
    keywords: [
      'quick',
      'command',
      'commands',
      'terminal',
      'shortcut',
      'snippet',
      'global',
      'project',
      'repo',
      'repository',
      'run',
      'launch',
      'pnpm',
      'npm',
      'yarn'
    ]
  }
}

export const runtimeEn: RuntimeMessages = {
  search: {
    title: 'Active Server',
    description: 'Choose local desktop, add a saved remote Orca server, or generate a pairing URL.',
    keywords: [
      'runtime',
      'environment',
      'server',
      'client',
      'remote',
      'pairing',
      'pairing url',
      'web client',
      'cloud',
      'vm',
      'dev box'
    ]
  },
  webSearch: {
    title: 'Active Server',
    description: 'Connect this browser to a saved Orca server.',
    keywords: [
      'runtime',
      'environment',
      'server',
      'client',
      'remote',
      'pairing code',
      'cloud',
      'vm'
    ]
  },
  labels: {
    activeServer: 'Active Server',
    localDesktop: 'Local desktop',
    noServerConnected: 'No server connected',
    remoteServer: 'remote server',
    savedServers: 'Saved Servers',
    serverName: 'Server name',
    pairingCode: 'Pairing code',
    shareServer: 'Share this Orca server',
    switchTo: 'Switch to',
    noEndpoint: 'No endpoint'
  },
  descriptions: {
    activeServerLocal:
      "Local keeps today's desktop behavior. Saved servers route supported client calls through the remote runtime.",
    activeServerWeb: 'Saved servers route this browser through a paired Orca runtime.',
    pairingHelp:
      'Run orca serve --pairing-address <host> on the server and paste the printed pairing URL.',
    noSavedServers: 'No saved servers.',
    shareServer: 'Create a revocable access grant so a browser or another Orca client can connect.',
    switchServer:
      'Orca will close remote terminals and browser tabs from the current server before loading projects from the next server.',
    removeActiveLocal:
      'Removing the active server first switches Orca back to Local desktop and closes remote terminals and browser tabs for that server.',
    removeActiveWeb:
      'Removing the active server disconnects this browser and closes remote terminals and browser tabs for that server.',
    removeInactive: 'This removes the saved server from Orca. It does not change the active server.'
  },
  actions: {
    refresh: 'Refresh servers',
    addServer: 'Add Server',
    cancel: 'Cancel',
    switch: 'Switch',
    remove: 'Remove',
    newLink: 'New Link',
    hideForm: 'Hide Form'
  },
  feedback: {
    loadFailed: 'Failed to load runtime environments.',
    required: 'Name and pairing code are required.',
    duplicate: (name) => `A server named "${name}" already exists.`,
    saveFailed: 'Failed to save runtime environment.',
    connected: (name) => `Connected to ${name}.`,
    saved: (name) => `Saved ${name}. Use Active Server to switch when ready.`,
    removed: (name) => `Removed ${name}.`,
    removeFailed: 'Failed to remove runtime environment.',
    switchLocalFailed: 'Could not switch to Local desktop. Fix the issue and try again.',
    disconnectFailed: 'Could not disconnect from this server. Fix the issue and try again.',
    switchFailed: 'Could not switch servers. Fix the issue and try again.',
    switched: (name) => `Switched to ${name}.`
  },
  placeholders: {
    serverName: 'Dev box',
    pairingCode: 'orca://pair#...'
  }
}

export const voiceEn: VoiceMessages = {
  enable: {
    title: 'Enable Voice Dictation',
    description: 'Dictate text into any focused pane.',
    dynamicDescription: (shortcut) => `Press ${shortcut} to dictate text into any focused pane.`,
    keywords: ['voice', 'dictation', 'speech', 'microphone', 'stt']
  },
  mode: {
    title: 'Dictation Mode',
    description: 'Toggle or hold-to-talk dictation behavior.',
    dynamicDescription: (shortcut) =>
      `Toggle: press ${shortcut} once to start, again to stop. Hold: dictate while ${shortcut} is held.`,
    toggle: 'Toggle',
    hold: 'Hold',
    keywords: ['voice', 'dictation', 'mode', 'toggle', 'hold']
  },
  model: {
    title: 'Speech Model',
    description: 'Select the local speech-to-text model used for dictation.',
    selectedDescription: (label, description) => `${label} — ${description}`,
    selectAndDownload: 'Select and download a model to enable dictation.',
    selectModel: 'Select Model',
    streaming: 'streaming',
    offline: 'offline',
    recommended: 'recommended',
    extracting: 'Extracting...',
    keywords: ['voice', 'speech', 'model', 'stt', 'download']
  },
  feedback: {
    permissionGranted: 'Microphone permission granted',
    openedSettings:
      'Opened macOS Privacy & Security. Enable dictation again after granting access.',
    permissionRequired: 'Microphone permission is required before enabling voice dictation.',
    requestFailed: 'Could not request microphone permission. Voice dictation was not enabled.',
    downloadFailed: 'Failed to download model.',
    deleteFailed: 'Failed to delete model.'
  }
}
