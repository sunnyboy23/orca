#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const rendererRoot = resolve(repoRoot, 'src/renderer/src')

const watchedPhrases = [
  'Unable to resolve the workspace connection.',
  'No AI agents detected. Configure a default agent in Settings.',
  'Could not build the agent launch command.',
  'Started an AI agent for the conflicts.',
  'Started an AI agent for the broken checks.',
  'Failed to clear notes.',
  'Unsaved Changes',
  'Close Window?',
  'Loading editor...',
  'Create Worktree',
  'Create Workspace',
  'Delete Inactive Workspaces',
  'Workspace cleanup scan failed',
  'Non-Orca worktrees',
  'Workspace options',
  'Filter workspaces',
  'Hide sleeping',
  'Hide default branch',
  'Delete Selected',
  'Force Delete',
  'No deletable workspaces selected',
  'Open in Orca',
  'Live Ports'
]

const migratedSettingsPhrases = [
  'Back to app',
  'Search settings',
  'No matching project settings.',
  'No projects added yet.',
  'Loading settings...',
  'No settings found for',
  'Import from Ghostty',
  'Workspace defaults, app setup, and maintenance.',
  'Theme, zoom, app font, sidebars, and status bar.',
  'Workspace Directory',
  'Nest Workspaces',
  'Ask Before Deleting Workspaces',
  'Ask Before Deleting Automations',
  'Open In Menu',
  'Auto Save Files',
  'Auto Save Delay',
  'Default Diff View',
  'Default Diff File Tree',
  'Markdown Review Notes',
  'Prompt Cache Timer',
  'Check for Updates',
  'Star Orca on GitHub',
  'UI Zoom',
  'IDE Font',
  'Open Right Sidebar by Default',
  'Show Git-Ignored Files',
  'Titlebar App Name',
  'Status Bar',
  'Show Tasks Button',
  'Show Orca Mobile Button'
]

const migratedSettingsPanePhrases = [
  'Middle-click Paste from Selection',
  'Task Sources',
  'Task Providers',
  'Enable Notifications',
  'Agent Task Complete',
  'Terminal Bell',
  'Suppress While Focused',
  'Notification Sound',
  'Send Test Notification',
  'Quick Commands',
  'Saved Commands',
  'Add Command',
  'All commands',
  'No quick commands saved.',
  'Active Server',
  'Saved Servers',
  'Add Server',
  'Switch Server',
  'Remove Server',
  'Share this Orca server',
  'Local desktop',
  'No server connected',
  'Share anonymous usage data',
  'Privacy policy',
  'Diagnostic bundle',
  'Open trace folder',
  'Clear local traces',
  'OTLP export',
  'Pet',
  'Agents View',
  'Symlinks on worktrees',
  'Font Size',
  'Font Family',
  'Font Weight',
  'Line Height',
  'Font Ligatures',
  'GPU Acceleration',
  'Cursor Shape',
  'Blinking Cursor',
  'Cursor Opacity',
  'Inactive Pane Opacity',
  'Divider Thickness',
  'Focus Follows Mouse',
  'Copy on Select',
  'Allow TUI Clipboard Writes',
  'Dark Theme',
  'Light Theme',
  'Use Separate Theme In Light Mode',
  'Background Opacity',
  'Window Blur',
  'Horizontal Padding',
  'Vertical Padding',
  'Hide Mouse While Typing',
  'Color Overrides',
  'Setup Script Location',
  'Scrollback Size',
  'Word Separators',
  'Option as Alt',
  'Default Shell',
  'PowerShell Version',
  'Right-click to paste',
  'Manage Sessions',
  'Kill all sessions',
  'Restart daemon',
  'Search builtin themes',
  'No matching fonts.',
  'Import from Ghostty',
  'Branch Prefix',
  'Refresh Local Base Ref',
  'GitHub API Budget',
  'Orca Attribution',
  'Enable AI commit messages',
  'AI Commit Messages',
  'Thinking effort',
  'Custom prompt',
  'Custom command',
  'Refresh models',
  'Not configured',
  'Coming soon',
  'SSH Connections',
  'Add SSH Target',
  'Import from SSH Config',
  'Failed to load SSH targets',
  'No SSH targets configured.',
  'Edit SSH Target',
  'New SSH Target',
  'Disconnect',
  'Connect',
  'Remove SSH Target',
  'Reset Remote Relay?',
  'GitHub Integration',
  'GitLab Integration',
  'Bitbucket Integration',
  'Azure DevOps Integration',
  'Gitea Integration',
  'Linear Integration',
  'Not authenticated',
  'Auth failed',
  'Install GitHub CLI',
  'Install GitLab CLI',
  'Add workspace',
  'Connect Linear workspace',
  'Personal API key',
  'Claude Accounts',
  'Codex Accounts',
  'Active Codex Account',
  'Use Gemini CLI credentials',
  'OpenCode Go Session Cookie',
  'OpenCode Go Workspace ID',
  'Add Account',
  'Re-authenticate',
  'Remove Account',
  'Default Agent',
  'Keep computer awake while agents are working',
  'Available to install',
  'Detecting installed agents',
  'Floating Workspace',
  'Enable Floating Workspace',
  'Terminal Directory',
  'Toggle Button Location',
  'Keyboard Shortcuts',
  'Shortcuts in Terminal',
  'Recent Tab Order',
  'Keybindings JSON',
  'Edit File in Orca',
  'Open with Default App',
  'Reveal in File Manager',
  'Reload from Disk',
  'Change shortcut',
  'Listening for shortcut',
  'Unassigned'
]

const ignoredFiles = new Set([
  'src/renderer/src/i18n/en.ts',
  'src/renderer/src/i18n/settings-accounts-en.ts',
  'src/renderer/src/i18n/settings-accounts-zh-CN.ts',
  'src/renderer/src/i18n/settings-accounts-types.ts',
  'src/renderer/src/i18n/settings-agents-en.ts',
  'src/renderer/src/i18n/settings-agents-zh-CN.ts',
  'src/renderer/src/i18n/settings-agents-types.ts',
  'src/renderer/src/i18n/settings-base-en.ts',
  'src/renderer/src/i18n/settings-base-zh-CN.ts',
  'src/renderer/src/i18n/settings-en.ts',
  'src/renderer/src/i18n/settings-general-en.ts',
  'src/renderer/src/i18n/settings-general-zh-CN.ts',
  'src/renderer/src/i18n/settings-appearance-en.ts',
  'src/renderer/src/i18n/settings-appearance-zh-CN.ts',
  'src/renderer/src/i18n/settings-core-panes-en.ts',
  'src/renderer/src/i18n/settings-core-panes-zh-CN.ts',
  'src/renderer/src/i18n/settings-core-panes-types.ts',
  'src/renderer/src/i18n/settings-floating-workspace-en.ts',
  'src/renderer/src/i18n/settings-floating-workspace-zh-CN.ts',
  'src/renderer/src/i18n/settings-floating-workspace-types.ts',
  'src/renderer/src/i18n/settings-commit-message-ai-en.ts',
  'src/renderer/src/i18n/settings-commit-message-ai-zh-CN.ts',
  'src/renderer/src/i18n/settings-git-en.ts',
  'src/renderer/src/i18n/settings-git-zh-CN.ts',
  'src/renderer/src/i18n/settings-integrations-en.ts',
  'src/renderer/src/i18n/settings-integrations-zh-CN.ts',
  'src/renderer/src/i18n/settings-integrations-types.ts',
  'src/renderer/src/i18n/settings-panes-en.ts',
  'src/renderer/src/i18n/settings-panes-zh-CN.ts',
  'src/renderer/src/i18n/settings-panes-types.ts',
  'src/renderer/src/i18n/settings-shortcuts-en.ts',
  'src/renderer/src/i18n/settings-shortcuts-zh-CN.ts',
  'src/renderer/src/i18n/settings-shortcuts-types.ts',
  'src/renderer/src/i18n/settings-terminal-en.ts',
  'src/renderer/src/i18n/settings-terminal-zh-CN.ts',
  'src/renderer/src/i18n/settings-terminal-types.ts',
  'src/renderer/src/i18n/settings-ssh-en.ts',
  'src/renderer/src/i18n/settings-ssh-zh-CN.ts',
  'src/renderer/src/i18n/settings-ssh-types.ts',
  'src/renderer/src/i18n/settings-zh-CN.ts',
  'src/renderer/src/i18n/settings-types.ts',
  'src/renderer/src/i18n/workspace-en.ts',
  'src/renderer/src/i18n/workspace-menu-en.ts',
  'src/renderer/src/i18n/zh-CN.ts',
  'src/renderer/src/i18n/workspace-zh-CN.ts',
  'src/renderer/src/i18n/workspace-menu-zh-CN.ts',
  'src/renderer/src/i18n/i18n.test.ts'
])

const englishDefaultCopyFiles = new Set(['src/renderer/src/components/shared/useDaemonActions.tsx'])

const files = collectSourceFiles(rendererRoot)

const findings = []
for (const file of files) {
  const rel = relative(repoRoot, file)
  if (
    ignoredFiles.has(rel) ||
    englishDefaultCopyFiles.has(rel) ||
    rel.endsWith('.test.ts') ||
    rel.endsWith('.test.tsx') ||
    rel.endsWith('.test-d.ts')
  ) {
    continue
  }
  const content = stripComments(readFileSync(file, 'utf8'))
  const phrases = isMigratedSettingsFile(rel)
    ? [...watchedPhrases, ...migratedSettingsPhrases, ...migratedSettingsPanePhrases]
    : watchedPhrases
  for (const phrase of phrases) {
    const index = findDisplayPhraseIndex(content, phrase)
    if (index === null) {
      continue
    }
    const line = content.slice(0, index).split('\n').length
    findings.push(`${rel}:${line}: ${phrase}`)
  }
}

function isMigratedSettingsFile(rel) {
  return (
    rel === 'src/renderer/src/components/settings/Settings.tsx' ||
    rel === 'src/renderer/src/components/settings/SettingsSidebar.tsx' ||
    rel === 'src/renderer/src/components/settings/GeneralPane.tsx' ||
    rel === 'src/renderer/src/components/settings/AppearancePane.tsx' ||
    rel === 'src/renderer/src/components/settings/InputPane.tsx' ||
    rel === 'src/renderer/src/components/settings/TasksPane.tsx' ||
    rel === 'src/renderer/src/components/settings/PrivacyPane.tsx' ||
    rel === 'src/renderer/src/components/settings/PrivacyDiagnosticsSection.tsx' ||
    rel === 'src/renderer/src/components/settings/PrivacyDiagnosticBundleControls.tsx' ||
    rel === 'src/renderer/src/components/settings/ExperimentalPane.tsx' ||
    rel === 'src/renderer/src/components/settings/general-search.ts' ||
    rel === 'src/renderer/src/components/settings/appearance-search.ts' ||
    rel === 'src/renderer/src/components/settings/input-search.ts' ||
    rel === 'src/renderer/src/components/settings/tasks-search.ts' ||
    rel === 'src/renderer/src/components/settings/privacy-search.ts' ||
    rel === 'src/renderer/src/components/settings/experimental-search.ts' ||
    rel === 'src/renderer/src/components/settings/NotificationsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/QuickCommandsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/RuntimeEnvironmentsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/notifications-search.ts' ||
    rel === 'src/renderer/src/components/settings/quick-commands-search.ts' ||
    rel === 'src/renderer/src/components/settings/runtime-environments-search.ts' ||
    rel === 'src/renderer/src/components/settings/TerminalPane.tsx' ||
    rel === 'src/renderer/src/components/settings/TerminalThemeSections.tsx' ||
    rel === 'src/renderer/src/components/settings/TerminalWindowSection.tsx' ||
    rel === 'src/renderer/src/components/settings/ManageSessionsSection.tsx' ||
    rel === 'src/renderer/src/components/settings/SettingsFormControls.tsx' ||
    rel === 'src/renderer/src/components/settings/terminal-search.ts' ||
    rel === 'src/renderer/src/components/settings/terminal-windows-search.ts' ||
    rel === 'src/renderer/src/components/settings/GitPane.tsx' ||
    rel === 'src/renderer/src/components/settings/CommitMessageAiPane.tsx' ||
    rel === 'src/renderer/src/components/settings/git-search.ts' ||
    rel === 'src/renderer/src/components/settings/commit-message-ai-search.ts' ||
    rel === 'src/renderer/src/components/settings/SSHPane.tsx' ||
    rel === 'src/renderer/src/components/settings/SshTargetCard.tsx' ||
    rel === 'src/renderer/src/components/settings/SshTargetForm.tsx' ||
    rel === 'src/renderer/src/components/settings/SshTargetDestructiveActions.tsx' ||
    rel === 'src/renderer/src/components/settings/SshDestructiveActionDialog.tsx' ||
    rel === 'src/renderer/src/components/settings/ssh-search.ts' ||
    rel === 'src/renderer/src/components/settings/IntegrationsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/integrations-search.ts' ||
    rel === 'src/renderer/src/components/settings/AccountsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/accounts-search.ts' ||
    rel === 'src/renderer/src/components/settings/AgentsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/AgentAwakeSetting.tsx' ||
    rel === 'src/renderer/src/components/settings/agent-awake-copy.ts' ||
    rel === 'src/renderer/src/components/settings/agents-search.ts' ||
    rel === 'src/renderer/src/components/settings/FloatingWorkspacePane.tsx' ||
    rel === 'src/renderer/src/components/settings/floating-workspace-search.ts' ||
    rel === 'src/renderer/src/components/settings/ShortcutsPane.tsx' ||
    rel === 'src/renderer/src/components/settings/ShortcutBindingRow.tsx' ||
    rel === 'src/renderer/src/components/settings/KeybindingsFileActions.tsx' ||
    rel === 'src/renderer/src/components/settings/shortcuts-search.ts' ||
    rel === 'src/renderer/src/components/settings/shortcut-copy.ts' ||
    rel === 'src/renderer/src/hooks/useSettingsNavigationMetadata.ts'
  )
}

function stripComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

function findDisplayPhraseIndex(content, phrase) {
  let fromIndex = 0
  while (fromIndex < content.length) {
    const index = content.indexOf(phrase, fromIndex)
    if (index === -1) {
      return null
    }
    if (!isIdentifierFragment(content, index, phrase.length)) {
      return index
    }
    fromIndex = index + phrase.length
  }
  return null
}

function isIdentifierFragment(content, index, length) {
  return (
    isIdentifierChar(content[index - 1] ?? '') || isIdentifierChar(content[index + length] ?? '')
  )
}

function isIdentifierChar(char) {
  return /[A-Za-z0-9_$]/.test(char)
}

if (findings.length > 0) {
  console.log(findings.join('\n'))
  process.exitCode = 1
}

function collectSourceFiles(dir) {
  const entries = readdirSync(dir)
  return entries.flatMap((entry) => {
    const path = resolve(dir, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      return collectSourceFiles(path)
    }
    return path.endsWith('.ts') || path.endsWith('.tsx') ? [path] : []
  })
}
