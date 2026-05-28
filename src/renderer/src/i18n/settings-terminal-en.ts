/* oxlint-disable max-lines -- Why: this locale table is structured copy data;
   keeping each terminal locale together makes English/Chinese parity easier to review. */
import type { SettingsTerminalMessages } from './settings-terminal-types'

export const terminalEn: SettingsTerminalMessages = {
  sections: {
    windowsShell: {
      title: 'Windows Shell',
      description: 'Default shell for new terminal panes on Windows.'
    },
    typography: {
      title: 'Typography',
      description: 'Default terminal typography for new panes and live updates.'
    },
    rendering: {
      title: 'Rendering',
      description: 'Terminal renderer behavior for live panes and new panes.'
    },
    cursor: {
      title: 'Cursor',
      description: 'Default cursor appearance for Orca terminal panes.'
    },
    paneStyling: {
      title: 'Pane Styling',
      description:
        'Control inactive pane dimming, divider thickness, mouse behavior, and transition timing.'
    },
    window: {
      title: 'Window',
      description: 'Window appearance and background settings.'
    },
    setupScript: {
      title: 'Workspace Setup Script',
      description: 'Where the repository setup script runs when a new workspace is created.'
    },
    advanced: {
      title: 'Advanced',
      description: 'Scrollback, word boundaries, and platform-specific terminal behaviors.'
    },
    lightTheme: {
      title: 'Light Theme',
      description: 'Configure the optional light-mode terminal appearance.'
    }
  },
  options: {
    auto: 'Auto',
    on: 'On',
    off: 'Off',
    both: 'Both',
    left: 'Left',
    right: 'Right',
    custom: 'Custom',
    commandPrompt: 'Command Prompt'
  },
  windowsShell: {
    defaultShell: {
      title: 'Default Shell',
      description: 'Choose the default shell for new terminal panes on Windows.',
      rowDescription: 'Shell used when opening a new terminal pane. Takes effect for new terminals.',
      keywords: [
        'terminal',
        'windows',
        'shell',
        'powershell',
        'cmd',
        'command prompt',
        'default',
        'wsl',
        'linux',
        'bash',
        'ubuntu'
      ]
    },
    rightClickToPaste: {
      title: 'Right-click to paste',
      description:
        'On Windows, right-click pastes the clipboard into the terminal. Use Ctrl+right-click to open the context menu.',
      rowDescription:
        'On Windows, right-click pastes the clipboard. Ctrl+right-click opens the context menu.',
      keywords: ['terminal', 'windows', 'right click', 'paste', 'context menu']
    },
    powerShellVersion: {
      title: 'PowerShell Version',
      description:
        'Choose whether the PowerShell shell option launches Windows PowerShell or PowerShell 7+ for new terminal panes.',
      rowDescription: 'Choose between Windows PowerShell and PowerShell 7+ for new terminal panes.',
      autoFallback:
        'Auto uses Windows PowerShell now and switches to PowerShell 7+ when installed.',
      downloadPowerShell: 'Download PowerShell 7+',
      keywords: [
        'terminal',
        'windows',
        'powershell',
        'windows powershell',
        'powershell 7',
        'pwsh',
        'version',
        'advanced'
      ]
    }
  },
  typography: {
    fontSize: {
      title: 'Font Size',
      description: 'Default terminal font size for new panes and live updates.',
      keywords: ['terminal', 'typography', 'text size']
    },
    fontFamily: {
      title: 'Font Family',
      description: 'Default terminal font family for new panes and live updates.',
      keywords: ['terminal', 'typography', 'font']
    },
    fontWeight: {
      title: 'Font Weight',
      description: 'Controls the terminal text font weight.',
      keywords: ['terminal', 'typography', 'weight']
    },
    lineHeight: {
      title: 'Line Height',
      description: 'Controls the terminal line height multiplier.',
      keywords: ['terminal', 'typography', 'line height', 'spacing']
    },
    fontLigatures: {
      title: 'Font Ligatures',
      description:
        'Render programming ligatures (e.g. =>, !=, ===) for fonts that ship them. "Auto" enables ligatures only for known ligature fonts (Fira Code, JetBrains Mono, Cascadia Code, Iosevka, etc.).',
      keywords: [
        'terminal',
        'typography',
        'ligatures',
        'ligature',
        'fira code',
        'jetbrains mono',
        'cascadia code',
        'iosevka',
        'calt',
        'font features'
      ]
    }
  },
  ligatures: {
    alwaysOn: 'Always on. Fonts without ligatures simply render as-is.',
    alwaysOff: 'Always off, even for fonts that ship them.',
    autoEnabled: (fontFamily) => `Auto — enabled for "${fontFamily}".`,
    autoDisabled: (fontFamily) => `Auto — disabled for "${fontFamily}".`,
    currentFont: 'the current font',
    liveStatus: (enabled) => `Ligatures are currently ${enabled ? 'enabled' : 'disabled'}.`
  },
  rendering: {
    gpuAcceleration: {
      title: 'GPU Acceleration',
      description:
        'Controls whether the terminal uses xterm.js WebGL rendering. Auto uses DOM on Linux to avoid driver glyph corruption, and otherwise tries WebGL with DOM fallback.',
      keywords: [
        'terminal',
        'gpu',
        'acceleration',
        'webgl',
        'renderer',
        'rendering',
        'graphics',
        'linux',
        'vscode'
      ]
    }
  },
  gpu: {
    auto: 'Auto uses DOM on Linux; tries WebGL with DOM fallback elsewhere.',
    on: 'WebGL is always attempted for terminal panes.',
    off: 'WebGL disabled; DOM renderer for max compatibility.'
  },
  cursor: {
    shape: {
      title: 'Cursor Shape',
      description: 'Default cursor appearance for Orca terminal panes.',
      keywords: ['terminal', 'cursor', 'bar', 'block', 'underline']
    },
    blink: {
      title: 'Blinking Cursor',
      description: 'Uses the blinking variant of the selected cursor shape.',
      keywords: ['terminal', 'cursor', 'blink']
    },
    opacity: {
      title: 'Cursor Opacity',
      description: 'Opacity of the terminal cursor.',
      keywords: ['terminal', 'cursor', 'opacity', 'transparency']
    },
    options: {
      bar: 'Bar',
      block: 'Block',
      underline: 'Underline'
    }
  },
  paneStyle: {
    inactivePaneOpacity: {
      title: 'Inactive Pane Opacity',
      description: 'Opacity applied to panes that are not currently active.',
      keywords: ['pane', 'opacity', 'dimming']
    },
    dividerThickness: {
      title: 'Divider Thickness',
      description: 'Thickness of the pane divider line.',
      keywords: ['pane', 'divider', 'thickness']
    },
    focusFollowsMouse: {
      title: 'Focus Follows Mouse',
      description: 'Hovering a terminal pane activates it without needing to click.',
      keywords: ['focus', 'follows', 'mouse', 'hover', 'pane', 'ghostty', 'active']
    },
    copyOnSelect: {
      title: 'Copy on Select',
      description: 'Automatically copy terminal selections to the clipboard.',
      keywords: [
        'clipboard',
        'copy',
        'select',
        'selection',
        'auto',
        'automatic',
        'x11',
        'linux',
        'gnome',
        'paste'
      ]
    },
    osc52: {
      title: 'Allow TUI Clipboard Writes (OSC 52)',
      description:
        'Let tmux, Neovim, and fzf copy to the system clipboard over the PTY (including over SSH).',
      rowDescription:
        'Let programs in the terminal (tmux, Neovim, fzf, SSH) copy to your system clipboard.',
      keywords: [
        'osc 52',
        'osc52',
        'clipboard',
        'tmux',
        'neovim',
        'nvim',
        'fzf',
        'ssh',
        'remote',
        'copy',
        'paste'
      ]
    }
  },
  theme: {
    darkTheme: {
      title: 'Dark Theme',
      description: 'Choose the terminal theme used in dark mode.',
      keywords: ['terminal', 'theme', 'dark', 'preview']
    },
    darkDivider: {
      title: 'Dark Divider Color',
      description: 'Controls the split divider line between panes in dark mode.',
      keywords: ['terminal', 'divider', 'dark', 'color']
    },
    separateLight: {
      title: 'Use Separate Theme In Light Mode',
      description: 'When disabled, light mode reuses the dark terminal theme.',
      keywords: ['terminal', 'light mode', 'theme']
    },
    lightTheme: {
      title: 'Light Theme',
      description: 'Choose the theme used when Orca is in light mode.',
      keywords: ['terminal', 'theme', 'light', 'preview']
    },
    lightDivider: {
      title: 'Light Divider Color',
      description: 'Controls the split divider line between panes in light mode.',
      keywords: ['terminal', 'divider', 'light', 'color']
    },
    darkPreviewTitle: 'Dark Mode Preview',
    lightPreviewTitle: 'Light Mode Preview',
    lightPreviewDescription: 'Updates live as you change the light theme or divider color.',
    systemMode: (mode) => `System mode is currently ${mode}.`,
    orcaMode: (mode) => `Orca is currently in ${mode} mode.`,
    mode: {
      dark: 'Dark',
      light: 'Light'
    }
  },
  themePicker: {
    searchPlaceholder: 'Search builtin themes',
    selected: (theme) => `Selected: ${theme}`,
    showingMatching: (count, query) => `Showing ${count} matching "${query}"`,
    showingTotal: (count, total) => `Showing ${count} of ${total}`,
    current: 'Current',
    noThemes: 'No themes found.'
  },
  window: {
    backgroundOpacity: {
      title: 'Background Opacity',
      description: 'Controls the transparency of the terminal background.',
      rowDescription:
        'Controls the transparency of the terminal background. 1 is fully opaque, 0 is fully transparent.',
      keywords: ['opacity', 'transparency', 'background', 'alpha']
    },
    blur: {
      title: 'Window Blur',
      description: 'Apply background blur to the terminal window. Requires restart.',
      keywords: ['window', 'blur', 'background', 'transparency', 'vibrancy']
    },
    restartRequired: 'Restart required',
    restartDescription: 'Restart Orca to apply the window blur change.',
    restarting: 'Restarting…',
    restartNow: 'Restart now',
    horizontalPadding: {
      title: 'Horizontal Padding',
      description: 'Horizontal padding around the terminal grid in pixels.',
      keywords: ['padding', 'horizontal', 'spacing', 'margin']
    },
    verticalPadding: {
      title: 'Vertical Padding',
      description: 'Vertical padding around the terminal grid in pixels.',
      keywords: ['padding', 'vertical', 'spacing', 'margin']
    },
    hideMouse: {
      title: 'Hide Mouse While Typing',
      description: 'Hide the mouse cursor when typing in the terminal.',
      keywords: ['mouse', 'hide', 'typing', 'cursor']
    },
    colorOverrides: {
      title: 'Color Overrides',
      description: 'Override individual terminal colors.',
      keywords: ['color', 'override', 'ansi', 'palette', 'theme']
    },
    colorOverrideGroups: {
      base: 'Base',
      ansiNormal: 'ANSI Normal',
      ansiBright: 'ANSI Bright'
    },
    colorFields: {
      foreground: { label: 'Foreground', description: 'Main text color' },
      background: { label: 'Background', description: 'Terminal background color' },
      cursor: { label: 'Cursor', description: 'Cursor color' },
      cursorAccent: {
        label: 'Cursor Text',
        description: 'Color of text under the cursor (block cursor)'
      },
      selectionBackground: {
        label: 'Selection Background',
        description: 'Background color of selected text'
      },
      selectionForeground: {
        label: 'Selection Foreground',
        description: 'Text color of selected text'
      },
      bold: {
        label: 'Bold Text',
        description: 'Color for bold text. Falls back to the normal color if not set.'
      },
      black: { label: 'Black', description: 'ANSI black color' },
      red: { label: 'Red', description: 'ANSI red color' },
      green: { label: 'Green', description: 'ANSI green color' },
      yellow: { label: 'Yellow', description: 'ANSI yellow color' },
      blue: { label: 'Blue', description: 'ANSI blue color' },
      magenta: { label: 'Magenta', description: 'ANSI magenta color' },
      cyan: { label: 'Cyan', description: 'ANSI cyan color' },
      white: { label: 'White', description: 'ANSI white color' },
      brightBlack: { label: 'Bright Black', description: 'ANSI bright black color' },
      brightRed: { label: 'Bright Red', description: 'ANSI bright red color' },
      brightGreen: { label: 'Bright Green', description: 'ANSI bright green color' },
      brightYellow: { label: 'Bright Yellow', description: 'ANSI bright yellow color' },
      brightBlue: { label: 'Bright Blue', description: 'ANSI bright blue color' },
      brightMagenta: { label: 'Bright Magenta', description: 'ANSI bright magenta color' },
      brightCyan: { label: 'Bright Cyan', description: 'ANSI bright cyan color' },
      brightWhite: { label: 'Bright White', description: 'ANSI bright white color' }
    },
    resetColorOverrides: 'Reset all color overrides'
  },
  setupScript: {
    location: {
      title: 'Setup Script Location',
      description: 'Where the repository setup script runs when a new workspace is created.',
      rowDescription:
        '"New Tab" opens the setup command in a background tab titled "Setup" without stealing focus.',
      keywords: [
        'setup',
        'script',
        'workspace',
        'split',
        'horizontal',
        'vertical',
        'tab',
        'new',
        'location',
        'launch'
      ]
    },
    options: {
      newTab: 'New Tab',
      newTabAria: 'Run in a new tab',
      splitVertically: 'Split Vertically',
      splitVerticallyAria: 'Split vertically',
      splitHorizontally: 'Split Horizontally',
      splitHorizontallyAria: 'Split horizontally'
    }
  },
  advanced: {
    scrollback: {
      title: 'Scrollback Size',
      description: 'Maximum terminal scrollback buffer size.',
      rowDescription: 'Maximum terminal scrollback buffer size for new terminal panes.',
      keywords: ['terminal', 'scrollback', 'buffer', 'memory']
    },
    wordSeparators: {
      title: 'Word Separators',
      description: 'Characters treated as word boundaries for double-click selection.',
      keywords: ['word', 'separator', 'boundary', 'double-click', 'selection']
    }
  },
  macOption: {
    optionAsAlt: {
      title: 'Option as Alt',
      description:
        'Controls whether the macOS Option key sends Alt/Esc sequences or composes characters.',
      keywords: [
        'terminal',
        'option',
        'alt',
        'key',
        'meta',
        'compose',
        'mac',
        'macos',
        'keyboard',
        'german',
        'international',
        'readline',
        'ghostty'
      ]
    },
    detected: {
      us: 'US English — Option sends Alt/Esc sequences',
      nonUs: 'non-US layout — Option composes characters like @, €, [, ]',
      unknown: 'unknown layout — Option composes characters (safe default)'
    },
    autoDetected: (label) => `Auto — detected: ${label}.`,
    offDescription: 'Option composes special characters for your keyboard layout.',
    bothDescription: 'Both Option keys send Alt/Esc sequences.',
    singleDescription: (side) =>
      `The ${side} Option key sends Alt/Esc; the other composes special characters.`
  },
  manageSessions: {
    search: {
      title: 'Manage Sessions',
      description:
        'Recover from frozen terminals by killing sessions, clearing saved scrollback, or restarting the daemon.',
      keywords: [
        'daemon',
        'pty',
        'sessions',
        'manage',
        'kill',
        'kill all',
        'clear',
        'history',
        'scrollback',
        'restart',
        'terminal',
        'recover',
        'frozen',
        'unfreeze'
      ]
    },
    unavailableDescription:
      'Session management is unavailable while a remote runtime server is active.',
    localRuntimeRequired: 'Switch back to the local runtime to restart or kill local daemon sessions.',
    description:
      'Recover from a frozen or misbehaving terminal by killing sessions or restarting the underlying daemon.',
    sessions: 'Sessions',
    refresh: 'Refresh',
    loading: 'Loading…',
    empty: 'No sessions.',
    unknown: 'unknown',
    states: {
      exited: 'exited',
      running: 'running',
      starting: 'starting'
    },
    goToTerminal: (workspace) => `Go to terminal ${workspace}`,
    killSessionAria: (sessionId) => `Kill session ${sessionId}`,
    killAll: 'Kill all sessions',
    restartDaemon: 'Restart daemon',
    toasts: {
      loadFailed: 'Couldn’t load sessions.',
      killedSession: 'Killed session.',
      killSessionGone: 'Couldn’t kill session — it may already be gone.',
      killSessionFailed: 'Couldn’t kill session.',
      daemonRestarted: 'Daemon restarted.',
      restartFailedCheckLogs: 'Restart failed — check logs.',
      restartFailed: 'Restart failed.',
      killedPartial: (killed, total, remaining) =>
        `Killed ${killed} of ${total} sessions. ${remaining} refused to exit.`,
      killedCount: (count) => `Killed ${count} session${count === 1 ? '' : 's'}.`,
      noSessionsRunning: 'No sessions running.',
      refusedToExit: (count) => `${count} session${count === 1 ? '' : 's'} refused to exit.`,
      killAllFailed: 'Couldn’t kill sessions.'
    },
    confirmOne: {
      title: 'Kill this session?',
      description: (sessionId) =>
        `Force-quits ${sessionId}. Any unsaved work in that pane is lost. This can't be undone.`,
      confirmLabel: 'Kill session',
      busyLabel: 'Killing…'
    },
    daemonDialog: {
      restartTitle: 'Restart the terminal daemon?',
      restartDescription:
        'Kills every running terminal pane and restarts the daemon process. Panes show “Process exited” and can be reopened immediately. Legacy-protocol sessions from a previous app version are preserved. This can’t be undone.',
      restartConfirm: 'Restart daemon',
      restarting: 'Restarting…',
      killAllTitle: 'Kill all terminal sessions?',
      killAllDescription:
        'This force-quits every running terminal pane across all workspaces. Any unsaved work in those sessions is lost. The daemon itself keeps running, and new terminals can be opened immediately. This can’t be undone.',
      killAllConfirm: 'Kill all sessions',
      killing: 'Killing…',
      cancel: 'Cancel'
    }
  },
  formControls: {
    defaultValue: (value) => `Default: ${value}`,
    clearFontSelection: 'Clear font selection',
    clear: 'Clear',
    toggleFontSuggestions: 'Toggle font suggestions',
    fonts: 'Fonts',
    noMatchingFonts: 'No matching fonts.'
  },
  ghosttyImport: {
    title: 'Import from Ghostty',
    description: 'One-time import of supported Ghostty terminal settings.',
    keywords: ['ghostty', 'import', 'terminal', 'config', 'settings']
  }
}
