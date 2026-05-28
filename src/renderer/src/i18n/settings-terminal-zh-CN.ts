/* oxlint-disable max-lines -- Why: this locale table is structured copy data;
   keeping each terminal locale together makes English/Chinese parity easier to review. */
import type { SettingsTerminalMessages } from './settings-terminal-types'

export const terminalZhCN: SettingsTerminalMessages = {
  sections: {
    windowsShell: {
      title: 'Windows Shell',
      description: '新终端窗格在 Windows 上默认使用的 shell。'
    },
    typography: {
      title: '排版',
      description: '新终端窗格和当前窗格实时使用的默认终端字体设置。'
    },
    rendering: {
      title: '渲染',
      description: '当前和新建终端窗格的渲染器行为。'
    },
    cursor: {
      title: '光标',
      description: 'Orca 终端窗格的默认光标外观。'
    },
    paneStyling: {
      title: '窗格样式',
      description: '控制非活动窗格变暗、分隔线粗细、鼠标行为和切换反馈。'
    },
    window: {
      title: '窗口',
      description: '终端窗口外观和背景设置。'
    },
    setupScript: {
      title: '工作区初始化脚本',
      description: '新建工作区时，仓库初始化脚本运行的位置。'
    },
    advanced: {
      title: '高级',
      description: '滚动缓冲区、词边界和平台相关终端行为。'
    },
    lightTheme: {
      title: '浅色主题',
      description: '配置可选的浅色模式终端外观。'
    }
  },
  options: {
    auto: '自动',
    on: '开启',
    off: '关闭',
    both: '两侧',
    left: '左侧',
    right: '右侧',
    custom: '自定义',
    commandPrompt: '命令提示符'
  },
  windowsShell: {
    defaultShell: {
      title: '默认 Shell',
      description: '选择 Windows 上新终端窗格默认使用的 shell。',
      rowDescription: '打开新终端窗格时使用的 shell。只对新终端生效。',
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
        'ubuntu',
        '默认'
      ]
    },
    rightClickToPaste: {
      title: '右键粘贴',
      description: '在 Windows 上，右键会把剪贴板内容粘贴进终端；Ctrl+右键打开上下文菜单。',
      rowDescription: '在 Windows 上，右键会粘贴剪贴板内容；Ctrl+右键打开上下文菜单。',
      keywords: ['terminal', 'windows', '右键', '粘贴', '上下文菜单', 'context menu']
    },
    powerShellVersion: {
      title: 'PowerShell 版本',
      description:
        '选择 PowerShell shell 选项为新终端窗格启动 Windows PowerShell 还是 PowerShell 7+。',
      rowDescription: '为新终端窗格选择 Windows PowerShell 或 PowerShell 7+。',
      autoFallback: '自动模式当前使用 Windows PowerShell，安装 PowerShell 7+ 后会自动切换。',
      downloadPowerShell: '下载 PowerShell 7+',
      keywords: [
        'terminal',
        'windows',
        'powershell',
        'windows powershell',
        'powershell 7',
        'pwsh',
        '版本',
        '高级'
      ]
    }
  },
  typography: {
    fontSize: {
      title: '字号',
      description: '新终端窗格和当前窗格实时使用的默认终端字号。',
      keywords: ['terminal', '排版', '字号', '文字大小', 'text size']
    },
    fontFamily: {
      title: '字体',
      description: '新终端窗格和当前窗格实时使用的默认终端字体。',
      keywords: ['terminal', '排版', '字体', 'font']
    },
    fontWeight: {
      title: '字重',
      description: '控制终端文字的字体粗细。',
      keywords: ['terminal', '排版', '字重', '粗细', 'weight']
    },
    lineHeight: {
      title: '行高',
      description: '控制终端行高倍数。',
      keywords: ['terminal', '排版', '行高', '间距', 'line height']
    },
    fontLigatures: {
      title: '字体连字',
      description:
        '对支持连字的字体渲染编程连字（例如 =>、!=、===）。“自动”只会为已知连字字体开启，例如 Fira Code、JetBrains Mono、Cascadia Code、Iosevka 等。',
      keywords: [
        'terminal',
        '排版',
        '连字',
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
    alwaysOn: '始终开启。不支持连字的字体会按原样渲染。',
    alwaysOff: '始终关闭，即使当前字体支持连字。',
    autoEnabled: (fontFamily) => `自动：已为“${fontFamily}”开启。`,
    autoDisabled: (fontFamily) => `自动：已为“${fontFamily}”关闭。`,
    currentFont: '当前字体',
    liveStatus: (enabled) => `字体连字当前${enabled ? '已开启' : '已关闭'}。`
  },
  rendering: {
    gpuAcceleration: {
      title: 'GPU 加速',
      description:
        '控制终端是否使用 xterm.js WebGL 渲染。自动模式会在 Linux 上使用 DOM 以避免驱动导致的字形损坏，其他平台优先尝试 WebGL，并在需要时回退到 DOM。',
      keywords: [
        'terminal',
        'gpu',
        '加速',
        'webgl',
        'renderer',
        '渲染',
        'graphics',
        'linux',
        'vscode'
      ]
    }
  },
  gpu: {
    auto: '自动模式在 Linux 上使用 DOM；其他平台尝试 WebGL，并在需要时回退到 DOM。',
    on: '终端窗格始终尝试使用 WebGL。',
    off: '已关闭 WebGL，使用兼容性最高的 DOM 渲染器。'
  },
  cursor: {
    shape: {
      title: '光标形状',
      description: 'Orca 终端窗格的默认光标外观。',
      keywords: ['terminal', '光标', 'cursor', 'bar', 'block', 'underline']
    },
    blink: {
      title: '光标闪烁',
      description: '使用所选光标形状的闪烁版本。',
      keywords: ['terminal', '光标', '闪烁', 'blink']
    },
    opacity: {
      title: '光标不透明度',
      description: '终端光标的不透明度。',
      keywords: ['terminal', '光标', '不透明度', '透明度', 'opacity']
    },
    options: {
      bar: '竖线',
      block: '块状',
      underline: '下划线'
    }
  },
  paneStyle: {
    inactivePaneOpacity: {
      title: '非活动窗格不透明度',
      description: '应用到当前未激活窗格的不透明度。',
      keywords: ['pane', 'opacity', 'dimming', '窗格', '不透明度', '变暗']
    },
    dividerThickness: {
      title: '分隔线粗细',
      description: '窗格分隔线的粗细。',
      keywords: ['pane', 'divider', 'thickness', '窗格', '分隔线', '粗细']
    },
    focusFollowsMouse: {
      title: '鼠标悬停即聚焦',
      description: '鼠标悬停到某个终端窗格时自动激活它，无需点击。',
      keywords: ['focus', 'mouse', 'hover', 'pane', 'ghostty', 'active', '聚焦', '鼠标']
    },
    copyOnSelect: {
      title: '选中即复制',
      description: '在终端中选中文本后立即自动复制到剪贴板。',
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
        'paste',
        '剪贴板',
        '复制',
        '选中'
      ]
    },
    osc52: {
      title: '允许 TUI 写入剪贴板（OSC 52）',
      description: '允许 tmux、Neovim 和 fzf 通过 PTY 写入系统剪贴板，包括 SSH 场景。',
      rowDescription: '允许终端内程序（tmux、Neovim、fzf、SSH）复制内容到系统剪贴板。',
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
        'paste',
        '剪贴板'
      ]
    }
  },
  theme: {
    darkTheme: {
      title: '深色主题',
      description: '选择深色模式下使用的终端主题。',
      keywords: ['terminal', 'theme', 'dark', 'preview', '主题', '深色', '预览']
    },
    darkDivider: {
      title: '深色分隔线颜色',
      description: '控制深色模式下窗格之间的分隔线颜色。',
      keywords: ['terminal', 'divider', 'dark', 'color', '分隔线', '深色', '颜色']
    },
    separateLight: {
      title: '浅色模式使用独立主题',
      description: '关闭后，浅色模式会复用深色终端主题。',
      keywords: ['terminal', 'light mode', 'theme', '浅色', '主题']
    },
    lightTheme: {
      title: '浅色主题',
      description: '选择 Orca 处于浅色模式时使用的终端主题。',
      keywords: ['terminal', 'theme', 'light', 'preview', '主题', '浅色', '预览']
    },
    lightDivider: {
      title: '浅色分隔线颜色',
      description: '控制浅色模式下窗格之间的分隔线颜色。',
      keywords: ['terminal', 'divider', 'light', 'color', '分隔线', '浅色', '颜色']
    },
    darkPreviewTitle: '深色模式预览',
    lightPreviewTitle: '浅色模式预览',
    lightPreviewDescription: '修改浅色主题或分隔线颜色时会实时更新。',
    systemMode: (mode) => `系统模式当前为${mode}。`,
    orcaMode: (mode) => `Orca 当前处于${mode}模式。`,
    mode: {
      dark: '深色',
      light: '浅色'
    }
  },
  themePicker: {
    searchPlaceholder: '搜索内置主题',
    selected: (theme) => `已选：${theme}`,
    showingMatching: (count, query) => `显示 ${count} 个匹配“${query}”的主题`,
    showingTotal: (count, total) => `显示 ${count} / ${total} 个主题`,
    current: '当前',
    noThemes: '没有找到主题。'
  },
  window: {
    backgroundOpacity: {
      title: '背景不透明度',
      description: '控制终端背景的透明程度。',
      rowDescription: '控制终端背景的透明程度。1 表示完全不透明，0 表示完全透明。',
      keywords: ['opacity', 'transparency', 'background', 'alpha', '背景', '透明度']
    },
    blur: {
      title: '窗口模糊',
      description: '为终端窗口应用背景模糊。需要重启后生效。',
      keywords: ['window', 'blur', 'background', 'transparency', 'vibrancy', '窗口', '模糊']
    },
    restartRequired: '需要重启',
    restartDescription: '重启 Orca 后窗口模糊设置才会生效。',
    restarting: '正在重启…',
    restartNow: '立即重启',
    horizontalPadding: {
      title: '水平内边距',
      description: '终端网格左右两侧的像素内边距。',
      keywords: ['padding', 'horizontal', 'spacing', 'margin', '水平', '内边距']
    },
    verticalPadding: {
      title: '垂直内边距',
      description: '终端网格上下两侧的像素内边距。',
      keywords: ['padding', 'vertical', 'spacing', 'margin', '垂直', '内边距']
    },
    hideMouse: {
      title: '输入时隐藏鼠标',
      description: '在终端中输入时隐藏鼠标指针。',
      keywords: ['mouse', 'hide', 'typing', 'cursor', '鼠标', '隐藏', '输入']
    },
    colorOverrides: {
      title: '颜色覆盖',
      description: '覆盖单个终端颜色。',
      keywords: ['color', 'override', 'ansi', 'palette', 'theme', '颜色', '覆盖']
    },
    colorOverrideGroups: {
      base: '基础',
      ansiNormal: 'ANSI 常规',
      ansiBright: 'ANSI 高亮'
    },
    colorFields: {
      foreground: { label: '前景色', description: '主文字颜色' },
      background: { label: '背景色', description: '终端背景颜色' },
      cursor: { label: '光标', description: '光标颜色' },
      cursorAccent: {
        label: '光标文字',
        description: '块状光标下方文字的颜色'
      },
      selectionBackground: {
        label: '选区背景',
        description: '选中文本的背景颜色'
      },
      selectionForeground: {
        label: '选区文字',
        description: '选中文本的文字颜色'
      },
      bold: {
        label: '粗体文字',
        description: '粗体文字颜色。未设置时使用普通文字颜色。'
      },
      black: { label: '黑色', description: 'ANSI 黑色' },
      red: { label: '红色', description: 'ANSI 红色' },
      green: { label: '绿色', description: 'ANSI 绿色' },
      yellow: { label: '黄色', description: 'ANSI 黄色' },
      blue: { label: '蓝色', description: 'ANSI 蓝色' },
      magenta: { label: '品红', description: 'ANSI 品红色' },
      cyan: { label: '青色', description: 'ANSI 青色' },
      white: { label: '白色', description: 'ANSI 白色' },
      brightBlack: { label: '亮黑色', description: 'ANSI 亮黑色' },
      brightRed: { label: '亮红色', description: 'ANSI 亮红色' },
      brightGreen: { label: '亮绿色', description: 'ANSI 亮绿色' },
      brightYellow: { label: '亮黄色', description: 'ANSI 亮黄色' },
      brightBlue: { label: '亮蓝色', description: 'ANSI 亮蓝色' },
      brightMagenta: { label: '亮品红', description: 'ANSI 亮品红色' },
      brightCyan: { label: '亮青色', description: 'ANSI 亮青色' },
      brightWhite: { label: '亮白色', description: 'ANSI 亮白色' }
    },
    resetColorOverrides: '重置所有颜色覆盖'
  },
  setupScript: {
    location: {
      title: '初始化脚本位置',
      description: '新建工作区时，仓库初始化脚本运行的位置。',
      rowDescription: '“新标签页”会在后台打开名为“Setup”的标签页运行初始化命令，不会抢走焦点。',
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
        'launch',
        '初始化',
        '脚本',
        '工作区'
      ]
    },
    options: {
      newTab: '新标签页',
      newTabAria: '在新标签页中运行',
      splitVertically: '垂直拆分',
      splitVerticallyAria: '垂直拆分',
      splitHorizontally: '水平拆分',
      splitHorizontallyAria: '水平拆分'
    }
  },
  advanced: {
    scrollback: {
      title: '滚动缓冲区大小',
      description: '终端滚动历史的最大缓冲区大小。',
      rowDescription: '新终端窗格的最大滚动历史缓冲区大小。',
      keywords: ['terminal', 'scrollback', 'buffer', 'memory', '滚动', '缓冲区', '内存']
    },
    wordSeparators: {
      title: '词分隔符',
      description: '双击选择时会被视为词边界的字符。',
      keywords: ['word', 'separator', 'boundary', 'double-click', 'selection', '词', '分隔符']
    }
  },
  macOption: {
    optionAsAlt: {
      title: 'Option 作为 Alt',
      description: '控制 macOS Option 键是发送 Alt/Esc 序列，还是用于输入组合字符。',
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
      us: '美式英文键盘：Option 会发送 Alt/Esc 序列',
      nonUs: '非美式键盘：Option 会组合输入 @、€、[、] 等字符',
      unknown: '未知键盘布局：Option 默认用于组合输入字符'
    },
    autoDetected: (label) => `自动：检测结果为 ${label}。`,
    offDescription: 'Option 会按当前键盘布局输入特殊字符。',
    bothDescription: '左右 Option 键都会发送 Alt/Esc 序列。',
    singleDescription: (side) => `${side} Option 键会发送 Alt/Esc，另一侧用于输入特殊字符。`
  },
  manageSessions: {
    search: {
      title: '管理会话',
      description: '通过结束会话、清除保存的滚动历史或重启 daemon，从卡住的终端中恢复。',
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
        'unfreeze',
        '会话',
        '重启',
        '恢复',
        '卡住'
      ]
    },
    unavailableDescription: '远程 runtime 服务处于活动状态时，无法管理本机会话。',
    localRuntimeRequired: '切回本地 runtime 后，才能重启或结束本机 daemon 会话。',
    description: '终端卡住或异常时，可以结束会话或重启底层 daemon 来恢复。',
    sessions: '会话',
    refresh: '刷新',
    loading: '正在加载…',
    empty: '没有会话。',
    unknown: '未知',
    states: {
      exited: '已退出',
      running: '运行中',
      starting: '启动中'
    },
    goToTerminal: (workspace) => `跳转到终端 ${workspace}`,
    killSessionAria: (sessionId) => `结束会话 ${sessionId}`,
    killAll: '结束全部会话',
    restartDaemon: '重启 daemon',
    toasts: {
      loadFailed: '无法加载会话。',
      killedSession: '会话已结束。',
      killSessionGone: '无法结束会话，它可能已经不存在。',
      killSessionFailed: '无法结束会话。',
      daemonRestarted: 'Daemon 已重启。',
      restartFailedCheckLogs: '重启失败，请检查日志。',
      restartFailed: '重启失败。',
      killedPartial: (killed, total, remaining) =>
        `已结束 ${total} 个会话中的 ${killed} 个，仍有 ${remaining} 个拒绝退出。`,
      killedCount: (count) => `已结束 ${count} 个会话。`,
      noSessionsRunning: '没有正在运行的会话。',
      refusedToExit: (count) => `${count} 个会话拒绝退出。`,
      killAllFailed: '无法结束会话。'
    },
    confirmOne: {
      title: '结束这个会话？',
      description: (sessionId) =>
        `将强制结束 ${sessionId}。该窗格中未保存的工作会丢失，此操作无法撤销。`,
      confirmLabel: '结束会话',
      busyLabel: '正在结束…'
    },
    daemonDialog: {
      restartTitle: '重启终端 daemon？',
      restartDescription:
        '这会结束所有正在运行的终端窗格并重启 daemon 进程。窗格会显示“Process exited”，之后可以立即重新打开。上一版本遗留协议的会话会被保留。此操作无法撤销。',
      restartConfirm: '重启 daemon',
      restarting: '正在重启…',
      killAllTitle: '结束全部终端会话？',
      killAllDescription:
        '这会强制结束所有工作区中正在运行的终端窗格。会话中未保存的工作会丢失。Daemon 本身会继续运行，并且可以立即打开新终端。此操作无法撤销。',
      killAllConfirm: '结束全部会话',
      killing: '正在结束…',
      cancel: '取消'
    }
  },
  formControls: {
    defaultValue: (value) => `默认：${value}`,
    clearFontSelection: '清空字体选择',
    clear: '清空',
    toggleFontSuggestions: '展开或收起字体建议',
    fonts: '字体',
    noMatchingFonts: '没有匹配的字体。'
  },
  ghosttyImport: {
    title: '从 Ghostty 导入',
    description: '一次性导入 Orca 支持的 Ghostty 终端设置。',
    keywords: ['ghostty', 'import', 'terminal', 'config', 'settings', '导入', '终端']
  }
}
