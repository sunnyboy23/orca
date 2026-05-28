/* eslint-disable max-lines -- Why: this locale table mirrors every shortcut action id so
 * Settings search, grouped rows, and conflict messages stay in one complete translation map. */
import type { ShortcutsMessages } from './settings-shortcuts-types'

const shortcutKeywords = (...keywords: string[]): string[] => ['快捷键', ...keywords]

export const shortcutsZhCN: ShortcutsMessages = {
  search: {
    terminalPolicy: {
      title: '终端里的快捷键',
      description: '设置快捷键冲突时由 Orca 还是当前终端优先响应。',
      keywords: shortcutKeywords(
        'shortcut',
        'keyboard',
        'terminal',
        'tui',
        'shell',
        'agent',
        'conflict',
        'orca first',
        'terminal first',
        '终端',
        '冲突',
        '优先级'
      )
    },
    ctrlTab: {
      title: '最近标签页顺序',
      description: '选择按最近使用或标签栏顺序切换标签页。',
      keywords: shortcutKeywords(
        'tab',
        'ctrl',
        'control',
        'recent',
        'mru',
        'sequential',
        'switch',
        '标签页',
        '最近'
      )
    },
    actionDescription: (group) => `${group}快捷键`
  },
  header: {
    title: '键盘快捷键',
    description: '可视化调整快捷键，也可以直接编辑配置文件。'
  },
  terminalPolicy: {
    title: '终端里的快捷键',
    description: '设置快捷键冲突时由 Orca 还是当前终端优先响应。',
    detail:
      'Orca 优先会让应用快捷键在 TUI 中继续生效。终端优先则让 shell 快捷键先响应，除非该快捷键标记为终端内可用。',
    orcaFirst: 'Orca 优先',
    terminalFirst: '终端优先'
  },
  ctrlTab: {
    title: '最近标签页顺序',
    description: '选择按最近使用或标签栏顺序切换标签页。',
    detail: '设置最近标签页切换时，是按照最近使用记录，还是按照标签栏中的顺序。',
    mostRecent: '最近使用',
    tabStripOrder: '标签栏顺序'
  },
  terminalStatus: {
    terminal: {
      label: '终端',
      description: '只在终端面板中生效。'
    },
    terminalActive: {
      label: '终端可用',
      description: '终端获得键盘焦点时仍会生效。'
    },
    orcaFirst: {
      label: 'Orca 优先',
      description: '终端或 TUI 获得焦点时仍由 Orca 响应。'
    },
    terminalFirst: {
      label: '终端优先',
      description: '终端或 TUI 获得焦点时停用，让终端先响应。'
    }
  },
  errors: {
    unableToParse: '无法解析这个快捷键。',
    invalidShortcutExample: '请输入类似 Ctrl+Shift+P 或 Cmd+K 的快捷键。',
    conflict: (binding, labels) => `${binding} 与 ${labels} 冲突。`,
    saveFailed: '保存快捷键失败。',
    resetFailed: '重置快捷键失败。',
    disableFailed: '停用快捷键失败。'
  },
  file: {
    title: 'Keybindings JSON',
    pathFallback: '~/.orca/keybindings.json',
    notAvailable: '快捷键配置文件不可用。',
    openFailures: {
      notAbsolute: '快捷键配置路径不是绝对路径。',
      notFound: '没有找到快捷键配置文件。',
      launchFailed: '无法启动这个编辑器。',
      fallback: '无法打开快捷键配置文件。'
    },
    failedOpenOrca: '无法在 Orca 中打开快捷键配置。',
    failedExternal: '无法打开外部编辑器。',
    editInOrca: '在 Orca 中编辑',
    menuAria: '打开快捷键配置文件菜单',
    openDefault: '用默认应用打开',
    openVSCode: '用 VS Code 打开',
    openCursor: '用 Cursor 打开',
    reveal: '在文件管理器中显示',
    reload: '从磁盘重新加载'
  },
  row: {
    unassigned: '未设置',
    modified: '已修改',
    recording: '正在监听快捷键，按 Esc 取消。',
    pressKeys: '按下快捷键...',
    changeShortcut: '修改快捷键',
    disableAria: (title) => `停用 ${title}`,
    resetAria: (title) => `重置 ${title}`,
    disableTooltip: '停用',
    resetTooltip: '重置'
  },
  groups: {
    Global: '全局',
    Tabs: '标签页',
    'Tab Navigation': '标签页导航',
    Browser: '浏览器',
    Editors: '编辑器',
    'File Explorer': '文件资源管理器',
    Composer: '输入框',
    Settings: '设置',
    'Terminal Panes': '终端面板'
  },
  actions: {
    'worktree.quickOpen': {
      title: '跳转到文件',
      keywords: shortcutKeywords('global', 'file', 'quick open', '全局', '文件', '快速打开')
    },
    'app.settings': {
      title: '打开设置',
      keywords: shortcutKeywords('settings', 'preferences', '设置', '偏好设置')
    },
    'app.forceReload': {
      title: '强制重新加载',
      keywords: shortcutKeywords('reload', 'refresh', 'force', '刷新', '重载')
    },
    'file.exportPdf': {
      title: '导出为 PDF',
      keywords: shortcutKeywords('export', 'pdf', 'markdown', '导出')
    },
    'worktree.palette': {
      title: '切换 worktree',
      keywords: shortcutKeywords('global', 'worktree', 'switch', 'jump', '全局', '切换', '跳转')
    },
    'worktree.navigateUp': {
      title: '上一个 worktree',
      keywords: shortcutKeywords('global', 'worktree', 'previous', 'up', '上一个')
    },
    'worktree.navigateDown': {
      title: '下一个 worktree',
      keywords: shortcutKeywords('global', 'worktree', 'next', 'down', '下一个')
    },
    'workspace.create': {
      title: '创建 worktree',
      keywords: shortcutKeywords('global', 'worktree', 'create', 'new workspace', '创建', '新建')
    },
    'voice.dictation': {
      title: '语音输入',
      keywords: shortcutKeywords('dictation', 'voice', 'speech', 'microphone', '语音', '麦克风')
    },
    'view.tasks': {
      title: '打开任务',
      keywords: shortcutKeywords('tasks', 'github issues', 'linear', '任务')
    },
    'sidebar.left.toggle': {
      title: '显示/隐藏侧边栏',
      keywords: shortcutKeywords('sidebar', 'left', '侧边栏', '左侧')
    },
    'sidebar.right.toggle': {
      title: '显示/隐藏右侧边栏',
      keywords: shortcutKeywords('sidebar', 'right', '右侧边栏')
    },
    'sidebar.explorer.toggle': {
      title: '显示资源管理器',
      keywords: shortcutKeywords('sidebar', 'explorer', 'files', '资源管理器', '文件')
    },
    'sidebar.search.toggle': {
      title: '显示搜索',
      keywords: shortcutKeywords('sidebar', 'search', '搜索')
    },
    'sidebar.sourceControl.toggle': {
      title: '显示 Source Control',
      keywords: shortcutKeywords('sidebar', 'source control', 'git', '源码管理')
    },
    'sidebar.checks.toggle': {
      title: '显示 Checks',
      keywords: shortcutKeywords('sidebar', 'checks', 'ci', '检查')
    },
    'sidebar.ports.toggle': {
      title: '显示端口',
      keywords: shortcutKeywords('sidebar', 'ports', '端口')
    },
    'sidebar.focusWorktreeList': {
      title: '聚焦 worktree 列表',
      keywords: shortcutKeywords('sidebar', 'worktree', 'focus', '聚焦', '列表')
    },
    'floatingTerminal.toggle': {
      title: '显示/隐藏浮动终端',
      keywords: shortcutKeywords('floating terminal', 'terminal', '浮动终端', '终端')
    },
    'zoom.in': {
      title: '放大',
      keywords: shortcutKeywords('zoom', 'in', 'scale', '放大', '缩放')
    },
    'zoom.out': {
      title: '缩小',
      keywords: shortcutKeywords('zoom', 'out', 'scale', '缩小', '缩放')
    },
    'zoom.reset': {
      title: '重置缩放',
      keywords: shortcutKeywords('zoom', 'reset', 'size', 'actual', '重置')
    },
    'worktree.history.back': {
      title: 'worktree 历史后退',
      keywords: shortcutKeywords('worktree', 'history', 'back', '历史', '后退')
    },
    'worktree.history.forward': {
      title: 'worktree 历史前进',
      keywords: shortcutKeywords('worktree', 'history', 'forward', '历史', '前进')
    },
    'tab.newTerminal': {
      title: '新建终端标签页',
      keywords: shortcutKeywords('tab', 'terminal', 'new', '标签页', '终端', '新建')
    },
    'tab.newBrowser': {
      title: '新建浏览器标签页',
      keywords: shortcutKeywords('tab', 'browser', 'new', '标签页', '浏览器', '新建')
    },
    'tab.newMarkdown': {
      title: '新建 Markdown 标签页',
      keywords: shortcutKeywords('tab', 'markdown', 'file', 'new', '标签页', '笔记', '新建')
    },
    'tab.close': {
      title: '关闭当前标签页',
      keywords: shortcutKeywords('close', 'tab', 'pane', '关闭', '标签页')
    },
    'tab.reopenClosed': {
      title: '重新打开已关闭标签页',
      keywords: shortcutKeywords('tab', 'reopen', 'restore', 'closed', '恢复', '重新打开')
    },
    'tab.nextSameType': {
      title: '下一个同类型标签页',
      keywords: shortcutKeywords('tab', 'next', 'switch', 'cycle', '标签页', '下一个')
    },
    'tab.previousSameType': {
      title: '上一个同类型标签页',
      keywords: shortcutKeywords('tab', 'previous', 'switch', 'cycle', '标签页', '上一个')
    },
    'tab.nextAllTypes': {
      title: '下一个标签页',
      keywords: shortcutKeywords('tab', 'next', 'switch', 'cycle', 'all', 'any', '标签页', '下一个')
    },
    'tab.previousAllTypes': {
      title: '上一个标签页',
      keywords: shortcutKeywords(
        'tab',
        'previous',
        'switch',
        'cycle',
        'all',
        'any',
        '标签页',
        '上一个'
      )
    },
    'tab.previousRecent': {
      title: '上一个最近使用的标签页',
      keywords: shortcutKeywords('tab', 'recent', 'mru', 'switch', 'last used', '最近', '标签页')
    },
    'tab.nextTerminal': {
      title: '下一个终端标签页',
      keywords: shortcutKeywords('tab', 'terminal', 'next', 'switch', '终端', '下一个')
    },
    'tab.previousTerminal': {
      title: '上一个终端标签页',
      keywords: shortcutKeywords('tab', 'terminal', 'previous', 'switch', '终端', '上一个')
    },
    'browser.find': {
      title: '在浏览器中查找',
      keywords: shortcutKeywords('browser', 'find', 'search', '浏览器', '查找', '搜索')
    },
    'browser.reload': {
      title: '重新加载浏览器页面',
      keywords: shortcutKeywords('browser', 'reload', 'refresh', '浏览器', '刷新')
    },
    'browser.hardReload': {
      title: '强制重新加载浏览器页面',
      keywords: shortcutKeywords(
        'browser',
        'reload',
        'refresh',
        'cache',
        '浏览器',
        '缓存',
        '强制刷新'
      )
    },
    'browser.focusAddressBar': {
      title: '聚焦浏览器地址栏',
      keywords: shortcutKeywords('browser', 'address', 'url', 'location', '地址栏')
    },
    'browser.grabElement': {
      title: '抓取页面元素',
      keywords: shortcutKeywords('browser', 'grab', 'copy', 'element', '页面元素', '抓取')
    },
    'editor.find': {
      title: '在编辑器中查找',
      keywords: shortcutKeywords('editor', 'find', 'search', '编辑器', '查找')
    },
    'editor.save': {
      title: '保存文件',
      keywords: shortcutKeywords('editor', 'save', '编辑器', '保存')
    },
    'editor.markdownPreview': {
      title: '显示 Markdown 预览',
      keywords: shortcutKeywords('editor', 'markdown', 'preview', '预览')
    },
    'editor.copyContext': {
      title: '复制上下文',
      keywords: shortcutKeywords('editor', 'copy', 'context', '上下文')
    },
    'fileExplorer.copyPath': {
      title: '复制文件路径',
      keywords: shortcutKeywords('file explorer', 'copy', 'path', '文件', '路径')
    },
    'fileExplorer.copyRelativePath': {
      title: '复制相对文件路径',
      keywords: shortcutKeywords('file explorer', 'copy', 'relative', 'path', '相对路径')
    },
    'fileExplorer.delete': {
      title: '删除文件',
      keywords: shortcutKeywords('file explorer', 'delete', 'remove', 'trash', '删除')
    },
    'composer.addAttachment': {
      title: '添加附件',
      keywords: shortcutKeywords('composer', 'attachment', 'upload', '附件', '上传')
    },
    'settings.search': {
      title: '搜索设置',
      keywords: shortcutKeywords('settings', 'search', 'find', '设置', '搜索')
    },
    'terminal.copySelection': {
      title: '复制终端选中内容',
      keywords: shortcutKeywords('terminal', 'copy', 'selection', '终端', '复制')
    },
    'terminal.paste': {
      title: '粘贴到终端',
      keywords: shortcutKeywords('terminal', 'paste', 'clipboard', '终端', '粘贴')
    },
    'terminal.search': {
      title: '搜索当前面板',
      keywords: shortcutKeywords('terminal', 'search', 'find', '终端', '搜索')
    },
    'terminal.clear': {
      title: '清空当前面板',
      keywords: shortcutKeywords('pane', 'clear', '面板', '清空')
    },
    'terminal.focusNextPane': {
      title: '聚焦下一个面板',
      keywords: shortcutKeywords('pane', 'focus', 'next', '面板', '聚焦')
    },
    'terminal.focusPreviousPane': {
      title: '聚焦上一个面板',
      keywords: shortcutKeywords('pane', 'focus', 'previous', '面板', '聚焦')
    },
    'terminal.equalizePaneSizes': {
      title: '均分面板大小',
      keywords: shortcutKeywords(
        'pane',
        'split',
        'equalize',
        'resize',
        'balance',
        'size',
        '面板',
        '均分'
      )
    },
    'terminal.expandPane': {
      title: '展开/收起面板',
      keywords: shortcutKeywords('pane', 'expand', 'collapse', '展开', '收起')
    },
    'terminal.closePane': {
      title: '关闭当前面板',
      keywords: shortcutKeywords('pane', 'close', '关闭', '面板')
    },
    'terminal.splitRight': {
      title: '向右拆分终端',
      keywords: shortcutKeywords('pane', 'split', 'right', '拆分', '右侧')
    },
    'terminal.splitDown': {
      title: '向下拆分终端',
      keywords: shortcutKeywords('pane', 'split', 'down', '拆分', '下方')
    }
  }
}
