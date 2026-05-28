/* eslint-disable max-lines -- Why: this locale table mirrors every shortcut action id so
 * Settings search, grouped rows, and conflict messages stay in one complete translation map. */
import type { ShortcutsMessages } from './settings-shortcuts-types'

const shortcutKeywords = (...keywords: string[]): string[] => ['shortcut', ...keywords]

export const shortcutsEn: ShortcutsMessages = {
  search: {
    terminalPolicy: {
      title: 'Shortcuts in Terminal',
      description: 'Choose whether Orca or the focused terminal wins when shortcuts overlap.',
      keywords: shortcutKeywords(
        'keyboard',
        'terminal',
        'tui',
        'shell',
        'agent',
        'conflict',
        'orca first',
        'terminal first'
      )
    },
    ctrlTab: {
      title: 'Recent Tab Order',
      description: 'Choose recent or sequential tab switching.',
      keywords: shortcutKeywords('tab', 'ctrl', 'control', 'recent', 'mru', 'sequential', 'switch')
    },
    actionDescription: (group) => `${group} shortcut`
  },
  header: {
    title: 'Keyboard Shortcuts',
    description: 'Customize shortcuts visually or edit the file directly.'
  },
  terminalPolicy: {
    title: 'Shortcuts in Terminal',
    description: 'Choose whether Orca or the focused terminal wins when shortcuts overlap.',
    detail:
      'Orca first keeps app shortcuts active in TUIs. Terminal first lets shell shortcuts win unless marked terminal-active.',
    orcaFirst: 'Orca first',
    terminalFirst: 'Terminal first'
  },
  ctrlTab: {
    title: 'Recent Tab Order',
    description: 'Choose recent or sequential tab switching.',
    detail: 'Choose whether recent tab switching follows recent use or the tab strip order.',
    mostRecent: 'Most recent',
    tabStripOrder: 'Tab strip order'
  },
  terminalStatus: {
    terminal: {
      label: 'Terminal',
      description: 'Runs from terminal panes.'
    },
    terminalActive: {
      label: 'Terminal active',
      description: 'Still runs while a terminal has keyboard focus.'
    },
    orcaFirst: {
      label: 'Orca first',
      description: 'Also runs while a terminal or TUI has keyboard focus.'
    },
    terminalFirst: {
      label: 'Terminal first',
      description: 'Disabled while a terminal or TUI has keyboard focus.'
    }
  },
  errors: {
    unableToParse: 'Unable to parse shortcut.',
    invalidShortcutExample: 'Use a shortcut like Ctrl+Shift+P or Cmd+K.',
    conflict: (binding, labels) => `${binding} conflicts with ${labels}.`,
    saveFailed: 'Failed to save shortcut.',
    resetFailed: 'Failed to reset shortcut.',
    disableFailed: 'Failed to disable shortcut.'
  },
  file: {
    title: 'Keybindings JSON',
    pathFallback: '~/.orca/keybindings.json',
    notAvailable: 'Keybindings file is not available.',
    openFailures: {
      notAbsolute: 'Keybindings path is not absolute.',
      notFound: 'Keybindings file was not found.',
      launchFailed: 'Could not launch that editor.',
      fallback: 'Could not open keybindings file.'
    },
    failedOpenOrca: 'Failed to open keybindings in Orca.',
    failedExternal: 'Failed to open external editor.',
    editInOrca: 'Edit File in Orca',
    menuAria: 'Open keybindings file menu',
    openDefault: 'Open with Default App',
    openVSCode: 'Open in VS Code',
    openCursor: 'Open in Cursor',
    reveal: 'Reveal in File Manager',
    reload: 'Reload from Disk'
  },
  row: {
    unassigned: 'Unassigned',
    modified: 'Modified',
    recording: 'Listening for shortcut. Esc cancels recording.',
    pressKeys: 'Press keys...',
    changeShortcut: 'Change shortcut',
    disableAria: (title) => `Disable ${title}`,
    resetAria: (title) => `Reset ${title}`,
    disableTooltip: 'Disable',
    resetTooltip: 'Reset'
  },
  groups: {
    Global: 'Global',
    Tabs: 'Tabs',
    'Tab Navigation': 'Tab Navigation',
    Browser: 'Browser',
    Editors: 'Editors',
    'File Explorer': 'File Explorer',
    Composer: 'Composer',
    Settings: 'Settings',
    'Terminal Panes': 'Terminal Panes'
  },
  actions: {
    'worktree.quickOpen': {
      title: 'Go to File',
      keywords: shortcutKeywords('global', 'file', 'quick open')
    },
    'app.settings': {
      title: 'Open Settings',
      keywords: shortcutKeywords('settings', 'preferences')
    },
    'app.forceReload': {
      title: 'Force Reload',
      keywords: shortcutKeywords('reload', 'refresh', 'force')
    },
    'file.exportPdf': {
      title: 'Export as PDF',
      keywords: shortcutKeywords('export', 'pdf', 'markdown')
    },
    'worktree.palette': {
      title: 'Switch worktree',
      keywords: shortcutKeywords('global', 'worktree', 'switch', 'jump')
    },
    'worktree.navigateUp': {
      title: 'Previous worktree',
      keywords: shortcutKeywords('global', 'worktree', 'previous', 'up')
    },
    'worktree.navigateDown': {
      title: 'Next worktree',
      keywords: shortcutKeywords('global', 'worktree', 'next', 'down')
    },
    'workspace.create': {
      title: 'Create worktree',
      keywords: shortcutKeywords('global', 'worktree', 'create', 'new workspace')
    },
    'voice.dictation': {
      title: 'Dictation',
      keywords: shortcutKeywords('dictation', 'voice', 'speech', 'microphone')
    },
    'view.tasks': {
      title: 'Open Tasks',
      keywords: shortcutKeywords('tasks', 'github issues', 'linear')
    },
    'sidebar.left.toggle': {
      title: 'Toggle Sidebar',
      keywords: shortcutKeywords('sidebar', 'left')
    },
    'sidebar.right.toggle': {
      title: 'Toggle Right Sidebar',
      keywords: shortcutKeywords('sidebar', 'right')
    },
    'sidebar.explorer.toggle': {
      title: 'Show Explorer',
      keywords: shortcutKeywords('sidebar', 'explorer', 'files')
    },
    'sidebar.search.toggle': {
      title: 'Show Search',
      keywords: shortcutKeywords('sidebar', 'search')
    },
    'sidebar.sourceControl.toggle': {
      title: 'Show Source Control',
      keywords: shortcutKeywords('sidebar', 'source control', 'git')
    },
    'sidebar.checks.toggle': {
      title: 'Show Checks',
      keywords: shortcutKeywords('sidebar', 'checks', 'ci')
    },
    'sidebar.ports.toggle': {
      title: 'Show Ports',
      keywords: shortcutKeywords('sidebar', 'ports')
    },
    'sidebar.focusWorktreeList': {
      title: 'Focus worktree list',
      keywords: shortcutKeywords('sidebar', 'worktree', 'focus')
    },
    'floatingTerminal.toggle': {
      title: 'Toggle Floating Terminal',
      keywords: shortcutKeywords('floating terminal', 'terminal')
    },
    'zoom.in': {
      title: 'Zoom In',
      keywords: shortcutKeywords('zoom', 'in', 'scale')
    },
    'zoom.out': {
      title: 'Zoom Out',
      keywords: shortcutKeywords('zoom', 'out', 'scale')
    },
    'zoom.reset': {
      title: 'Reset Size',
      keywords: shortcutKeywords('zoom', 'reset', 'size', 'actual')
    },
    'worktree.history.back': {
      title: 'Worktree History Back',
      keywords: shortcutKeywords('worktree', 'history', 'back')
    },
    'worktree.history.forward': {
      title: 'Worktree History Forward',
      keywords: shortcutKeywords('worktree', 'history', 'forward')
    },
    'tab.newTerminal': {
      title: 'New terminal tab',
      keywords: shortcutKeywords('tab', 'terminal', 'new')
    },
    'tab.newBrowser': {
      title: 'New browser tab',
      keywords: shortcutKeywords('tab', 'browser', 'new')
    },
    'tab.newMarkdown': {
      title: 'New markdown tab',
      keywords: shortcutKeywords('tab', 'markdown', 'file', 'new')
    },
    'tab.close': {
      title: 'Close active tab',
      keywords: shortcutKeywords('close', 'tab', 'pane')
    },
    'tab.reopenClosed': {
      title: 'Reopen closed tab',
      keywords: shortcutKeywords('tab', 'reopen', 'restore', 'closed')
    },
    'tab.nextSameType': {
      title: 'Next tab (same type)',
      keywords: shortcutKeywords('tab', 'next', 'switch', 'cycle')
    },
    'tab.previousSameType': {
      title: 'Previous tab (same type)',
      keywords: shortcutKeywords('tab', 'previous', 'switch', 'cycle')
    },
    'tab.nextAllTypes': {
      title: 'Next tab (all types)',
      keywords: shortcutKeywords('tab', 'next', 'switch', 'cycle', 'all', 'any')
    },
    'tab.previousAllTypes': {
      title: 'Previous tab (all types)',
      keywords: shortcutKeywords('tab', 'previous', 'switch', 'cycle', 'all', 'any')
    },
    'tab.previousRecent': {
      title: 'Previous recent tab',
      keywords: shortcutKeywords('tab', 'recent', 'mru', 'switch', 'last used')
    },
    'tab.nextTerminal': {
      title: 'Next terminal tab',
      keywords: shortcutKeywords('tab', 'terminal', 'next', 'switch')
    },
    'tab.previousTerminal': {
      title: 'Previous terminal tab',
      keywords: shortcutKeywords('tab', 'terminal', 'previous', 'switch')
    },
    'browser.find': {
      title: 'Find in Browser',
      keywords: shortcutKeywords('browser', 'find', 'search')
    },
    'browser.reload': {
      title: 'Reload Browser Page',
      keywords: shortcutKeywords('browser', 'reload', 'refresh')
    },
    'browser.hardReload': {
      title: 'Hard Reload Browser Page',
      keywords: shortcutKeywords('browser', 'reload', 'refresh', 'cache')
    },
    'browser.focusAddressBar': {
      title: 'Focus Browser Address Bar',
      keywords: shortcutKeywords('browser', 'address', 'url', 'location')
    },
    'browser.grabElement': {
      title: 'Grab Page Element',
      keywords: shortcutKeywords('browser', 'grab', 'copy', 'element')
    },
    'editor.find': {
      title: 'Find in editor',
      keywords: shortcutKeywords('editor', 'find', 'search')
    },
    'editor.save': {
      title: 'Save File',
      keywords: shortcutKeywords('editor', 'save')
    },
    'editor.markdownPreview': {
      title: 'Show Markdown Preview',
      keywords: shortcutKeywords('editor', 'markdown', 'preview')
    },
    'editor.copyContext': {
      title: 'Copy Context',
      keywords: shortcutKeywords('editor', 'copy', 'context')
    },
    'fileExplorer.copyPath': {
      title: 'Copy file path',
      keywords: shortcutKeywords('file explorer', 'copy', 'path')
    },
    'fileExplorer.copyRelativePath': {
      title: 'Copy relative file path',
      keywords: shortcutKeywords('file explorer', 'copy', 'relative', 'path')
    },
    'fileExplorer.delete': {
      title: 'Delete file',
      keywords: shortcutKeywords('file explorer', 'delete', 'remove', 'trash')
    },
    'composer.addAttachment': {
      title: 'Add Attachment',
      keywords: shortcutKeywords('composer', 'attachment', 'upload')
    },
    'settings.search': {
      title: 'Search Settings',
      keywords: shortcutKeywords('settings', 'search', 'find')
    },
    'terminal.copySelection': {
      title: 'Copy terminal selection',
      keywords: shortcutKeywords('terminal', 'copy', 'selection')
    },
    'terminal.paste': {
      title: 'Paste into terminal',
      keywords: shortcutKeywords('terminal', 'paste', 'clipboard')
    },
    'terminal.search': {
      title: 'Search active pane',
      keywords: shortcutKeywords('terminal', 'search', 'find')
    },
    'terminal.clear': {
      title: 'Clear active pane',
      keywords: shortcutKeywords('pane', 'clear')
    },
    'terminal.focusNextPane': {
      title: 'Focus next pane',
      keywords: shortcutKeywords('pane', 'focus', 'next')
    },
    'terminal.focusPreviousPane': {
      title: 'Focus previous pane',
      keywords: shortcutKeywords('pane', 'focus', 'previous')
    },
    'terminal.equalizePaneSizes': {
      title: 'Equalize pane sizes',
      keywords: shortcutKeywords('pane', 'split', 'equalize', 'resize', 'balance', 'size')
    },
    'terminal.expandPane': {
      title: 'Expand / collapse pane',
      keywords: shortcutKeywords('pane', 'expand', 'collapse')
    },
    'terminal.closePane': {
      title: 'Close active pane',
      keywords: shortcutKeywords('pane', 'close')
    },
    'terminal.splitRight': {
      title: 'Split terminal right',
      keywords: shortcutKeywords('pane', 'split', 'right')
    },
    'terminal.splitDown': {
      title: 'Split terminal down',
      keywords: shortcutKeywords('pane', 'split', 'down')
    }
  }
}
