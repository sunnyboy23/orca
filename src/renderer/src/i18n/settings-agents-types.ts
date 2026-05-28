import type { SettingFieldCopy } from './settings-types'

export type AgentsMessages = {
  search: {
    agents: SettingFieldCopy
    defaultAgent: SettingFieldCopy
    statusHooks: SettingFieldCopy
    awake: SettingFieldCopy & {
      description: string
      windowsDescription: string
    }
  }
  defaultAgent: {
    title: string
    description: string
    auto: string
    blank: string
  }
  awake: {
    title: string
    description: string
    windowsDescription: string
  }
  statusHooks: {
    title: string
    description: string
  }
  row: {
    command: string
    reset: string
    detected: string
    notInstalled: string
    defaultAgent: string
    setDefault: string
    default: string
    customizeCommand: string
    docs: string
    install: string
    collapseCommand: string
    expandCommand: string
    overrideHelp: string
  }
  sections: {
    installed: string
    detectedCount: (count: number) => string
    availableToInstall: string
    agentsCount: (count: number) => string
    refreshTitle: string
    refreshing: string
    refresh: string
    detecting: string
  }
}
