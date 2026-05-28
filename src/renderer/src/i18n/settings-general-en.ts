import type { SettingsGeneralMessages } from './settings-types'

export const settingsGeneralEn: SettingsGeneralMessages = {
    workspace: {
      title: 'Workspace',
      description: 'Configure where new workspaces are created.'
    },
    editor: {
      title: 'Editor',
      description: 'Configure how Orca persists file edits.'
    },
    updates: {
      title: 'Updates',
      currentVersion: (version) => `Current version: ${version ?? '...'}`,
      check: {
        title: 'Check for Updates',
        description: 'Check for app updates and install a newer Orca version.',
        keywords: ['update', 'version', 'release notes', 'download']
      },
      checkButton: 'Check for Updates',
      installUpdate: (version) => `Install Update (${version})`,
      restartToUpdate: (version) => `Restart to Update (${version})`,
      idle: 'Updates are checked automatically on launch.',
      checking: 'Checking for updates...',
      available: (version) => `Version ${version} is available.`,
      releaseNotes: 'Release notes',
      latest: 'You’re on the latest version.',
      downloading: (version, percent) => `Downloading v${version}... ${percent}%`,
      downloaded: (version) => `Version ${version} is ready to install.`,
      updateError: (message) => `Update error. ${message}`,
      checkError: (message) => `Update check failed. ${message}`,
      downloadStartError: 'Could not start the update download.'
    },
    cacheTimer: {
      header: {
        title: 'Prompt Cache Timer',
        description:
          'Claude caches your conversation to reduce costs. When idle too long the cache expires and the next message resends full context at higher cost. This shows a countdown so you know when to resume.',
        keywords: ['cache', 'timer', 'prompt', 'ttl', 'claude', 'cost', 'tokens']
      },
      cacheTimer: {
        title: 'Cache Timer',
        description: 'Show a countdown after a Claude agent becomes idle.',
        keywords: ['cache', 'timer', 'prompt', 'ttl', 'claude', 'cost', 'tokens']
      },
      timerDescription: 'Show a countdown in the sidebar after a Claude agent becomes idle.',
      duration: {
        title: 'Timer Duration',
        description: "Match this to your provider's cache TTL.",
        keywords: ['cache', 'timer', 'duration', 'ttl']
      },
      durationDescription: "Match this to your provider's cache TTL. The default is 5 minutes.",
      fiveMinutes: '5 minutes',
      oneHour: '1 hour'
    },
    support: {
      title: 'Support Orca',
      star: {
        title: 'Star Orca on GitHub',
        description: 'Support the project with a GitHub star via the gh CLI.',
        keywords: ['star', 'github', 'support', 'feedback', 'like']
      },
      starring: 'Starring...',
      tryAgain: 'Try Again',
      starButton: 'Star',
      thanks: 'Thanks for the support!'
    },
    fields: {
      workspaceDirectory: {
        title: 'Workspace Directory',
        description: 'Root directory where workspace folders are created.',
        keywords: ['workspace', 'folder', 'path', 'worktree']
      },
      nestWorkspaces: {
        title: 'Nest Workspaces',
        description: 'Create workspaces inside a repo-named subfolder.',
        keywords: ['nested', 'subfolder', 'directory']
      },
      askBeforeDeletingWorkspaces: {
        title: 'Ask Before Deleting Workspaces',
        description: 'Show a confirmation dialog before deleting a workspace.',
        keywords: ['delete', 'worktree', 'confirm', 'dialog', 'skip', 'prompt']
      },
      askBeforeDeletingWorkspacesToggle:
        'Show a confirmation before deleting a workspace from the context menu. Failed deletes still surface a Force Delete option.',
      askBeforeDeletingAutomations: {
        title: 'Ask Before Deleting Automations',
        description: 'Show a confirmation dialog before deleting an automation and its run history.',
        keywords: ['delete', 'automation', 'confirm', 'dialog', 'skip', 'prompt']
      },
      askBeforeDeletingAutomationsToggle:
        'Show a confirmation before deleting automations and their run history.',
      openInMenu: {
        title: 'Open In Menu',
        description: 'Add custom launchers to the workspace Open in menu.',
        keywords: ['open in', 'editor', 'launcher', 'cursor', 'zed', 'command', 'vscode']
      },
      openInMenuDescription:
        "VS Code is always included first. Add executables to show extra entries in each workspace's Open in menu.",
      openInMenuCommandNote:
        'Commands are not shell-parsed. Use only an executable command name. For flags, use a wrapper script.',
      labelPlaceholder: 'Label',
      executableCommandPlaceholder: 'Executable command',
      addCursor: 'Add Cursor',
      addZed: 'Add Zed',
      addCustomLauncher: 'Add Custom Launcher',
      autoSaveFiles: {
        title: 'Auto Save Files',
        description: 'Save editor and editable diff changes automatically after a short pause.',
        keywords: ['autosave', 'save']
      },
      autoSaveDelay: {
        title: 'Auto Save Delay',
        description: 'How long Orca waits after your last edit before saving automatically.',
        keywords: ['autosave', 'delay', 'milliseconds']
      },
      autoSaveDelayDescription: (defaultMs) =>
        `How long Orca waits after your last edit before saving automatically. First launch defaults to ${defaultMs} ms.`,
      defaultDiffView: {
        title: 'Default Diff View',
        description: 'Preferred presentation format for showing git diffs by default.',
        keywords: ['diff', 'view', 'inline', 'side-by-side', 'split']
      },
      defaultDiffFileTree: {
        title: 'Default Diff File Tree',
        description: 'Show or hide the file tree when opening combined diff views.',
        keywords: ['diff', 'tree', 'file tree', 'combined diff', 'sidebar']
      },
      minimap: {
        title: 'Minimap',
        description: 'Show the minimap overview when editing a file.',
        keywords: ['minimap', 'overview', 'code', 'scroll']
      },
      markdownReviewNotes: {
        title: 'Markdown Review Notes',
        description:
          'Show local markdown note controls in rich editor mode and agent handoff actions.',
        keywords: ['markdown', 'review', 'notes', 'annotations', 'agents']
      }
    },
    actions: {
      browse: 'Browse',
      remove: 'Remove'
    },
    options: {
      inline: 'Inline',
      sideBySide: 'Side-by-side',
      shown: 'Shown',
      hidden: 'Hidden'
    }
  }
