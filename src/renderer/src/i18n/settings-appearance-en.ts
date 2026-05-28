import type { SettingsAppearanceMessages } from './settings-types'

export const settingsAppearanceEn: SettingsAppearanceMessages = {
    unassigned: 'Unassigned',
    sections: {
      interface: 'Interface',
      layout: {
        title: 'Layout',
        description: 'Default layout when creating new worktrees.'
      },
      titlebar: {
        title: 'Titlebar',
        description: 'Control what appears in the application titlebar.'
      },
      statusBar: {
        title: 'Status Bar',
        description:
          'Choose which indicators appear at the bottom of the window. You can also right-click the status bar for the same toggles.'
      },
      sidebar: 'Sidebar'
    },
    fields: {
      theme: {
        title: 'Theme',
        description: 'Choose how Orca looks in the app window.',
        keywords: ['dark', 'light', 'system']
      },
      uiZoom: {
        title: 'UI Zoom',
        description: 'Scale the entire application interface.',
        keywords: ['zoom', 'scale', 'shortcut']
      },
      uiZoomDescription:
        'Scale the entire application interface. Use the shortcuts below when not in a terminal pane.',
      ideFont: {
        title: 'IDE Font',
        description: 'Choose the font used by the Orca interface.',
        keywords: ['font', 'typeface', 'typography', 'ide', 'orca', 'interface', 'app', 'ui']
      },
      openRightSidebar: {
        title: 'Open Right Sidebar by Default',
        description: 'Automatically expand the file explorer panel when creating a new worktree.',
        keywords: ['layout', 'file explorer', 'sidebar']
      },
      showGitIgnoredFiles: {
        title: 'Show Git-Ignored Files',
        description: 'Show files matched by .gitignore in the file explorer.',
        keywords: ['git', 'gitignore', 'ignored', 'file explorer', 'sidebar', 'hide']
      },
      showGitIgnoredFilesToggle:
        'Turn off to hide files matched by .gitignore from the file explorer.',
      titlebarAppName: {
        title: 'Titlebar App Name',
        description: 'Show Orca in the titlebar.',
        keywords: ['titlebar', 'orca', 'app', 'name', 'brand']
      },
      showTasksButton: {
        title: 'Show Tasks Button',
        description: 'Show the Tasks button at the top of the left sidebar.',
        keywords: ['tasks', 'sidebar', 'button', 'hide', 'show', 'github', 'linear']
      },
      showMobileButton: {
        title: 'Show Orca Mobile Button',
        description: 'Show the Orca Mobile button at the top of the left sidebar.',
        keywords: ['mobile', 'phone', 'sidebar', 'button', 'hide', 'show', 'toolbox']
      },
      showMobileButtonToggle:
        'Show the Orca Mobile shortcut in the sidebar. It remains available from Toolbox.'
    },
    themeOptions: {
      system: 'System',
      dark: 'Dark',
      light: 'Light'
    },
    statusBarToggles: {
      claude: {
        title: 'Claude Usage',
        description: 'Show Claude token and cost usage in the status bar.',
        keywords: ['status bar', 'claude', 'usage', 'tokens', 'cost', 'anthropic'],
        toggleDescription: 'Show Claude token and cost usage for the active workspace.'
      },
      codex: {
        title: 'Codex Usage',
        description: 'Show Codex token and cost usage in the status bar.',
        keywords: ['status bar', 'codex', 'usage', 'tokens', 'cost', 'openai'],
        toggleDescription: 'Show Codex token and cost usage for the active workspace.'
      },
      gemini: {
        title: 'Gemini Usage',
        description: 'Show Gemini token and cost usage in the status bar.',
        keywords: ['status bar', 'gemini', 'usage', 'tokens', 'cost', 'google'],
        toggleDescription: 'Show Gemini token and cost usage for the active workspace.'
      },
      'opencode-go': {
        title: 'OpenCode Go Usage',
        description: 'Show OpenCode Go token and cost usage in the status bar.',
        keywords: ['status bar', 'opencode', 'opencode-go', 'usage', 'tokens', 'cost'],
        toggleDescription: 'Show OpenCode Go token and cost usage for the active workspace.'
      },
      ssh: {
        title: 'SSH Status',
        description: 'Show the active SSH connection status in the status bar.',
        keywords: ['status bar', 'ssh', 'remote', 'connection', 'host'],
        toggleDescription:
          'Show the active SSH connection. Only visible once an SSH target is configured.'
      },
      'resource-usage': {
        title: 'Resource Manager',
        description:
          'Show CPU, memory, terminal sessions, and workspace disk usage in the status bar.',
        keywords: ['status bar', 'resource', 'manager', 'memory', 'cpu', 'terminal', 'disk', 'space'],
        toggleDescription:
          'Show the Resource Manager. Click it for CPU, memory, sessions, daemon controls, and workspace disk scans.'
      },
      ports: {
        title: 'Ports',
        description: 'Show live workspace ports in the status bar.',
        keywords: ['status bar', 'ports', 'localhost', 'server', 'workspace'],
        toggleDescription:
          'Show live workspace ports. Click it for workspace-scoped ports and external listeners.'
      }
    }
  }
