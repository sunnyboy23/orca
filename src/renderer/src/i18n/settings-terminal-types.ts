import type { SettingFieldCopy, SettingSectionCopy } from './settings-types'

export type SettingsTerminalMessages = {
  sections: Record<
    | 'windowsShell'
    | 'typography'
    | 'rendering'
    | 'cursor'
    | 'paneStyling'
    | 'window'
    | 'setupScript'
    | 'advanced',
    SettingSectionCopy
  > & {
    lightTheme: SettingSectionCopy
  }
  options: {
    auto: string
    on: string
    off: string
    both: string
    left: string
    right: string
    custom: string
    commandPrompt: string
  }
  windowsShell: {
    defaultShell: SettingFieldCopy & { rowDescription: string }
    rightClickToPaste: SettingFieldCopy & { rowDescription: string }
    powerShellVersion: SettingFieldCopy & {
      rowDescription: string
      autoFallback: string
      downloadPowerShell: string
    }
  }
  typography: {
    fontSize: SettingFieldCopy
    fontFamily: SettingFieldCopy
    fontWeight: SettingFieldCopy
    lineHeight: SettingFieldCopy
    fontLigatures: SettingFieldCopy
  }
  ligatures: {
    alwaysOn: string
    alwaysOff: string
    autoEnabled: (fontFamily: string) => string
    autoDisabled: (fontFamily: string) => string
    currentFont: string
    liveStatus: (enabled: boolean) => string
  }
  rendering: {
    gpuAcceleration: SettingFieldCopy
  }
  gpu: {
    auto: string
    on: string
    off: string
  }
  cursor: {
    shape: SettingFieldCopy
    blink: SettingFieldCopy
    opacity: SettingFieldCopy
    options: {
      bar: string
      block: string
      underline: string
    }
  }
  paneStyle: {
    inactivePaneOpacity: SettingFieldCopy
    dividerThickness: SettingFieldCopy
    focusFollowsMouse: SettingFieldCopy
    copyOnSelect: SettingFieldCopy
    osc52: SettingFieldCopy & { rowDescription: string }
  }
  theme: {
    darkTheme: SettingFieldCopy
    darkDivider: SettingFieldCopy
    separateLight: SettingFieldCopy
    lightTheme: SettingFieldCopy
    lightDivider: SettingFieldCopy
    darkPreviewTitle: string
    lightPreviewTitle: string
    lightPreviewDescription: string
    systemMode: (mode: string) => string
    orcaMode: (mode: string) => string
    mode: {
      dark: string
      light: string
    }
  }
  themePicker: {
    searchPlaceholder: string
    selected: (theme: string) => string
    showingMatching: (count: number, query: string) => string
    showingTotal: (count: number, total: number) => string
    current: string
    noThemes: string
  }
  window: {
    backgroundOpacity: SettingFieldCopy & { rowDescription: string }
    blur: SettingFieldCopy
    restartRequired: string
    restartDescription: string
    restarting: string
    restartNow: string
    horizontalPadding: SettingFieldCopy
    verticalPadding: SettingFieldCopy
    hideMouse: SettingFieldCopy
    colorOverrides: SettingFieldCopy
    colorOverrideGroups: {
      base: string
      ansiNormal: string
      ansiBright: string
    }
    colorFields: Record<
      | 'foreground'
      | 'background'
      | 'cursor'
      | 'cursorAccent'
      | 'selectionBackground'
      | 'selectionForeground'
      | 'bold'
      | 'black'
      | 'red'
      | 'green'
      | 'yellow'
      | 'blue'
      | 'magenta'
      | 'cyan'
      | 'white'
      | 'brightBlack'
      | 'brightRed'
      | 'brightGreen'
      | 'brightYellow'
      | 'brightBlue'
      | 'brightMagenta'
      | 'brightCyan'
      | 'brightWhite',
      { label: string; description: string }
    >
    resetColorOverrides: string
  }
  setupScript: {
    location: SettingFieldCopy & { rowDescription: string }
    options: {
      newTab: string
      newTabAria: string
      splitVertically: string
      splitVerticallyAria: string
      splitHorizontally: string
      splitHorizontallyAria: string
    }
  }
  advanced: {
    scrollback: SettingFieldCopy & { rowDescription: string }
    wordSeparators: SettingFieldCopy
  }
  macOption: {
    optionAsAlt: SettingFieldCopy
    detected: {
      us: string
      nonUs: string
      unknown: string
    }
    autoDetected: (label: string) => string
    offDescription: string
    bothDescription: string
    singleDescription: (side: string) => string
  }
  manageSessions: {
    search: SettingFieldCopy
    unavailableDescription: string
    localRuntimeRequired: string
    description: string
    sessions: string
    refresh: string
    loading: string
    empty: string
    unknown: string
    states: {
      exited: string
      running: string
      starting: string
    }
    goToTerminal: (workspace: string) => string
    killSessionAria: (sessionId: string) => string
    killAll: string
    restartDaemon: string
    toasts: {
      loadFailed: string
      killedSession: string
      killSessionGone: string
      killSessionFailed: string
      daemonRestarted: string
      restartFailedCheckLogs: string
      restartFailed: string
      killedPartial: (killed: number, total: number, remaining: number) => string
      killedCount: (count: number) => string
      noSessionsRunning: string
      refusedToExit: (count: number) => string
      killAllFailed: string
    }
    confirmOne: {
      title: string
      description: (sessionId: string) => string
      confirmLabel: string
      busyLabel: string
    }
    daemonDialog: {
      restartTitle: string
      restartDescription: string
      restartConfirm: string
      restarting: string
      killAllTitle: string
      killAllDescription: string
      killAllConfirm: string
      killing: string
      cancel: string
    }
  }
  formControls: {
    defaultValue: (value: number) => string
    clearFontSelection: string
    clear: string
    toggleFontSuggestions: string
    fonts: string
    noMatchingFonts: string
  }
  ghosttyImport: SettingFieldCopy
}
