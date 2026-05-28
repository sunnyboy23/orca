import type { StatusBarItem } from '../../../shared/types'

export type SettingSectionCopy = {
  title: string
  description: string
  webDescription?: string
  badge?: string
  keywords?: string[]
}

export type SettingFieldCopy = {
  title: string
  description?: string
  keywords: string[]
}

export type SettingsBaseMessages = {
  common: {
    beta: string
    optional: string
    loadingSettings: string
    noSettingsFound: (query: string) => string
    importFromGhostty: string
  }
  sidebar: {
    backToApp: string
    searchPlaceholder: string
    projects: string
    noMatchingProjects: string
    noProjects: string
  }
  groups: Record<
    'setup' | 'workflows' | 'interface' | 'capabilities' | 'remote' | 'safety' | 'experimental',
    string
  >
  sections: Record<
    | 'general'
    | 'agents'
    | 'accounts'
    | 'integrations'
    | 'git'
    | 'tasks'
    | 'floating-workspace'
    | 'appearance'
    | 'input'
    | 'terminal'
    | 'quick-commands'
    | 'browser'
    | 'notifications'
    | 'orchestration'
    | 'servers'
    | 'ssh'
    | 'mobile'
    | 'computer-use'
    | 'voice'
    | 'developer-permissions'
    | 'privacy'
    | 'shortcuts'
    | 'stats'
    | 'experimental',
    SettingSectionCopy
  >
  repository: {
    sectionTitle: (name: string) => string
  }
  computerUse: {
    platformLabel: {
      windows: string
      linux: string
      fallback: string
    }
    previewDetailsAria: (platform: string) => string
    previewDetails: (platform: string) => string
  }
}

export type SettingsGeneralMessages = {
    workspace: SettingSectionCopy
    editor: SettingSectionCopy
    updates: {
      title: string
      currentVersion: (version: string | null) => string
      check: SettingFieldCopy
      checkButton: string
      installUpdate: (version: string) => string
      restartToUpdate: (version: string) => string
      idle: string
      checking: string
      available: (version: string) => string
      releaseNotes: string
      latest: string
      downloading: (version: string, percent: number) => string
      downloaded: (version: string) => string
      updateError: (message: string) => string
      checkError: (message: string) => string
      downloadStartError: string
    }
    cacheTimer: {
      header: SettingSectionCopy
      cacheTimer: SettingFieldCopy
      timerDescription: string
      duration: SettingFieldCopy
      durationDescription: string
      fiveMinutes: string
      oneHour: string
    }
    support: {
      title: string
      star: SettingFieldCopy
      starring: string
      tryAgain: string
      starButton: string
      thanks: string
    }
    fields: {
      workspaceDirectory: SettingFieldCopy
      nestWorkspaces: SettingFieldCopy
      askBeforeDeletingWorkspaces: SettingFieldCopy
      askBeforeDeletingWorkspacesToggle: string
      askBeforeDeletingAutomations: SettingFieldCopy
      askBeforeDeletingAutomationsToggle: string
      openInMenu: SettingFieldCopy
      openInMenuDescription: string
      openInMenuCommandNote: string
      labelPlaceholder: string
      executableCommandPlaceholder: string
      addCursor: string
      addZed: string
      addCustomLauncher: string
      autoSaveFiles: SettingFieldCopy
      autoSaveDelay: SettingFieldCopy
      autoSaveDelayDescription: (defaultMs: number) => string
      defaultDiffView: SettingFieldCopy
      defaultDiffFileTree: SettingFieldCopy
      minimap: SettingFieldCopy
      markdownReviewNotes: SettingFieldCopy
    }
    actions: {
      browse: string
      remove: string
    }
    options: {
      inline: string
      sideBySide: string
      shown: string
      hidden: string
    }
}

export type SettingsAppearanceMessages = {
    unassigned: string
    sections: {
      interface: string
      layout: SettingSectionCopy
      titlebar: SettingSectionCopy
      statusBar: SettingSectionCopy
      sidebar: string
    }
    fields: {
      theme: SettingFieldCopy
      uiZoom: SettingFieldCopy
      uiZoomDescription: string
      ideFont: SettingFieldCopy
      openRightSidebar: SettingFieldCopy
      showGitIgnoredFiles: SettingFieldCopy
      showGitIgnoredFilesToggle: string
      titlebarAppName: SettingFieldCopy
      showTasksButton: SettingFieldCopy
      showMobileButton: SettingFieldCopy
      showMobileButtonToggle: string
    }
    themeOptions: Record<'system' | 'dark' | 'light', string>
    statusBarToggles: Record<
      StatusBarItem,
      SettingFieldCopy & {
        toggleDescription: string
      }
    >
}

export type SettingsMessages = SettingsBaseMessages & {
  general: SettingsGeneralMessages
  appearance: SettingsAppearanceMessages
}
