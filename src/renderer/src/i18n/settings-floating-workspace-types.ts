import type { SettingFieldCopy } from './settings-types'

export type FloatingWorkspaceMessages = {
  search: SettingFieldCopy
  enable: {
    label: string
    description: string
  }
  directory: {
    label: string
    description: string
    chooseAria: string
  }
  toggleLocation: {
    label: string
    description: string
    floatingButton: string
    statusBar: string
  }
}
