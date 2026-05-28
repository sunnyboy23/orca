import type { KeybindingActionId } from '../../../shared/keybindings'
import type { SettingFieldCopy } from './settings-types'

export type ShortcutActionCopy = {
  title: string
  keywords: string[]
}

export type ShortcutGroupName =
  | 'Global'
  | 'Tabs'
  | 'Tab Navigation'
  | 'Browser'
  | 'Editors'
  | 'File Explorer'
  | 'Composer'
  | 'Settings'
  | 'Terminal Panes'

export type ShortcutsMessages = {
  search: {
    terminalPolicy: SettingFieldCopy
    ctrlTab: SettingFieldCopy
    actionDescription: (group: string) => string
  }
  header: {
    title: string
    description: string
  }
  terminalPolicy: {
    title: string
    description: string
    detail: string
    orcaFirst: string
    terminalFirst: string
  }
  ctrlTab: {
    title: string
    description: string
    detail: string
    mostRecent: string
    tabStripOrder: string
  }
  terminalStatus: {
    terminal: {
      label: string
      description: string
    }
    terminalActive: {
      label: string
      description: string
    }
    orcaFirst: {
      label: string
      description: string
    }
    terminalFirst: {
      label: string
      description: string
    }
  }
  errors: {
    unableToParse: string
    invalidShortcutExample: string
    conflict: (binding: string, labels: string) => string
    saveFailed: string
    resetFailed: string
    disableFailed: string
  }
  file: {
    title: string
    pathFallback: string
    notAvailable: string
    openFailures: {
      notAbsolute: string
      notFound: string
      launchFailed: string
      fallback: string
    }
    failedOpenOrca: string
    failedExternal: string
    editInOrca: string
    menuAria: string
    openDefault: string
    openVSCode: string
    openCursor: string
    reveal: string
    reload: string
  }
  row: {
    unassigned: string
    modified: string
    recording: string
    pressKeys: string
    changeShortcut: string
    disableAria: (title: string) => string
    resetAria: (title: string) => string
    disableTooltip: string
    resetTooltip: string
  }
  groups: Record<ShortcutGroupName, string>
  actions: Record<KeybindingActionId, ShortcutActionCopy>
}
