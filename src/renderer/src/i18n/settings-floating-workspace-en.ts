import type { FloatingWorkspaceMessages } from './settings-floating-workspace-types'

export const floatingWorkspaceEn: FloatingWorkspaceMessages = {
  search: {
    title: 'Floating Workspace',
    description:
      'Enable the floating workspace, choose where new tabs start, and choose where the toggle button appears.',
    keywords: [
      'floating workspace',
      'floating terminal',
      'quick terminal',
      'global',
      'terminal',
      'browser',
      'markdown',
      'note',
      'notes',
      'quick panel',
      'launch directory',
      'toggle button',
      'status bar'
    ]
  },
  enable: {
    label: 'Enable Floating Workspace',
    description: 'Shows the floating workspace button and panel.'
  },
  directory: {
    label: 'Terminal Directory',
    description:
      "New floating terminal tabs start here. Markdown notes are saved in Orca's app-owned floating workspace.",
    chooseAria: 'Choose floating workspace directory'
  },
  toggleLocation: {
    label: 'Toggle Button Location',
    description: 'The keyboard shortcut works regardless of where the toggle is shown.',
    floatingButton: 'Floating Button',
    statusBar: 'Status Bar'
  }
}
