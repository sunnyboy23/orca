import type { SettingsBaseMessages } from './settings-types'

export const settingsBaseEn: SettingsBaseMessages = {
common: {
    beta: 'Beta',
    optional: 'Optional',
    loadingSettings: 'Loading settings...',
    noSettingsFound: (query) => `No settings found for "${query}"`,
    importFromGhostty: 'Import from Ghostty'
  },
  sidebar: {
    backToApp: 'Back to app',
    searchPlaceholder: 'Search settings',
    projects: 'Projects',
    noMatchingProjects: 'No matching project settings.',
    noProjects: 'No projects added yet.'
  },
  groups: {
    setup: 'Set Up',
    workflows: 'Workflows',
    interface: 'Interface',
    capabilities: 'AI Capabilities',
    remote: 'Remote Access',
    safety: 'Safety',
    experimental: 'Experimental'
  },
  sections: {
    general: {
      title: 'General',
      description: 'Workspace defaults, app setup, and maintenance.'
    },
    agents: {
      title: 'Agents',
      description: 'Manage AI agents, set a default, and customize commands.'
    },
    accounts: {
      title: 'AI Provider Accounts',
      description:
        'Optional. Orca works with your existing provider logins; add accounts only if you want Orca to help switch between them.',
      badge: 'Optional'
    },
    integrations: {
      title: 'Integrations',
      description: 'Connect GitHub, GitLab, Linear, and source-hosting services.'
    },
    git: {
      title: 'Git & Source Control',
      description: 'Branch naming, base refs, attribution, and AI commit messages.'
    },
    tasks: {
      title: 'Task Sources',
      description: 'Choose which task providers appear in the Tasks page and sidebar.'
    },
    'floating-workspace': {
      title: 'Floating Workspace',
      description: 'Global terminal, browser, and markdown tabs.'
    },
    appearance: {
      title: 'Appearance',
      description: 'Theme, zoom, app font, sidebars, and status bar.'
    },
    input: {
      title: 'Input & Editing',
      description: 'Selection and editing behavior.'
    },
    terminal: {
      title: 'Terminal',
      description: 'Shells, terminal appearance, and pane behavior.'
    },
    'quick-commands': {
      title: 'Quick Commands',
      description: 'Saved terminal commands, scoped globally or per project.'
    },
    browser: {
      title: 'Browser',
      description: 'Home page, link routing, and session cookies.'
    },
    notifications: {
      title: 'Notifications',
      description: 'Native desktop notifications for agent activity and terminal events.'
    },
    orchestration: {
      title: 'Orchestration',
      description: 'Coordinate multiple coding agents through Orca.'
    },
    servers: {
      title: 'Remote Orca Servers',
      description: 'Switch between local desktop mode and paired remote Orca runtimes.',
      webDescription: 'Connect this browser to a saved Orca server.',
      badge: 'Beta'
    },
    ssh: {
      title: 'SSH Hosts',
      description: 'Remote SSH hosts for files, terminals, and git.'
    },
    mobile: {
      title: 'Mobile',
      description: 'Control terminals and agents from your phone.',
      badge: 'Beta'
    },
    'computer-use': {
      title: 'Computer Use',
      description: 'Enable agents to control any app on your computer.',
      badge: 'Beta'
    },
    voice: {
      title: 'Voice',
      description: 'Local speech-to-text dictation with on-device models.',
      badge: 'Beta'
    },
    'developer-permissions': {
      title: 'macOS Permissions',
      description: 'macOS privacy access for terminal-launched developer tools.'
    },
    privacy: {
      title: 'Privacy & Telemetry',
      description: 'Anonymous usage data and telemetry controls.'
    },
    shortcuts: {
      title: 'Shortcuts',
      description: 'Keyboard shortcuts for common actions.'
    },
    stats: {
      title: 'Stats & Usage',
      description: 'Orca stats plus Claude, Codex, and OpenCode usage analytics.'
    },
    experimental: {
      title: 'Experimental',
      description: 'New features that are still taking shape. Give them a try.'
    }
  },
  repository: {
    sectionTitle: (name) => `Project Settings > ${name}`
  },
  computerUse: {
    platformLabel: {
      windows: 'Windows',
      linux: 'Linux',
      fallback: 'This platform'
    },
    previewDetailsAria: (platform) => `${platform} Computer Use preview details`,
    previewDetails: (platform) =>
      `${platform} Computer Use is an early preview. Some apps and desktop environments may behave inconsistently.`
  }
}
