import type {
  NotificationsMessages,
  QuickCommandsMessages,
  RuntimeMessages,
  VoiceMessages
} from './settings-panes-types'

export const notificationsZhCN: NotificationsMessages = {
  system: {
    unsupported: '当前系统不支持通知',
    customSoundFailed: '无法播放自定义通知声音',
    soundFailed: '无法播放通知声音',
    macFailureTitle: 'macOS 没有显示通知',
    macFailureDescription: '请在系统设置中允许 Orca 发送通知。',
    windowsFailureTitle: 'Windows 没有显示通知',
    windowsFailureDescription: '请在 Windows 设置中允许 Orca 发送通知。',
    macRequestedTitle: '已请求发送测试通知',
    macRequestedDescription: '如果没有看到 macOS 横幅，请在系统设置中允许 Orca 发送通知。',
    openSettings: '打开设置',
    sent: '测试通知已发送',
    genericFailureTitle: '系统没有显示通知',
    genericFailureDescription: '请检查 Orca 的桌面通知设置。',
    disabled: '通知已关闭',
    notDelivered: '测试通知未送达'
  },
  fields: {
    enable: {
      title: '启用通知',
      description: '后台事件使用系统桌面通知提醒。',
      keywords: ['通知', '桌面', '系统', '原生', 'notifications']
    },
    agentTaskComplete: {
      title: 'Agent 任务完成',
      description: '编程 Agent 完成任务并进入空闲状态时通知。',
      keywords: ['通知', 'agent', '完成', '空闲', '任务']
    },
    terminalBell: {
      title: '终端铃声',
      description: '后台终端发出 bell 字符时通知。',
      keywords: ['通知', '终端', '铃声', 'bell', 'attention']
    },
    suppressWhileFocused: {
      title: '当前工作区可见时静默',
      description: '触发通知的 worktree 已经可见时跳过通知。',
      keywords: ['通知', '聚焦', '静默', '过滤', 'focused', 'suppress']
    },
    sound: {
      title: '通知声音',
      description: '选择桌面通知送达时 Orca 播放的提示音。',
      keywords: ['通知', '声音', '音频', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']
    },
    volume: {
      title: '通知音量',
      description: '非系统通知声音的播放音量。',
      keywords: ['通知', '声音', '音量', 'volume']
    },
    sendTest: {
      title: '发送测试通知',
      description: '通过原生通知链路触发一条示例桌面通知。',
      keywords: ['通知', '测试', 'test']
    }
  },
  chooseSoundPlaceholder: '选择通知声音',
  chooseCustomFile: '选择自定义文件',
  changeCustomFile: '更换自定义文件',
  customPath: (path) => `自定义：${path}`,
  sendTestButton: '发送测试通知'
}

export const quickCommandsZhCN: QuickCommandsMessages = {
  scope: {
    global: '全局',
    missingProject: '项目缺失',
    allCommands: '全部命令',
    none: '无'
  },
  savedCommands: {
    title: '已保存命令',
    description: '可从标签栏的快捷命令按钮运行，也可在任意终端中右键运行。',
    add: '添加命令',
    empty: '还没有保存快捷命令。',
    emptyForScope: '所选作用域中没有命令。',
    untitled: '未命名',
    noCommandText: '没有命令内容',
    enter: '回车',
    insert: '插入',
    editAria: (label) => `编辑 ${label}`,
    removeAria: (label) => `移除 ${label}`
  },
  deleteDialog: {
    title: (label) => `删除“${label}”？`,
    description: '这个快捷命令会从已保存列表中移除。',
    confirm: '删除'
  },
  search: {
    title: '快捷命令',
    description: '保存可从任意终端启动的命令，并按全局或项目作用域使用。',
    keywords: [
      '快捷',
      '命令',
      '终端',
      '片段',
      '全局',
      '项目',
      '仓库',
      '运行',
      '启动',
      'quick',
      'command',
      'terminal',
      'global',
      'project',
      'pnpm',
      'npm',
      'yarn'
    ]
  }
}

export const runtimeZhCN: RuntimeMessages = {
  search: {
    title: '当前服务',
    description: '选择本地桌面、添加远程 Orca 服务，或生成配对链接。',
    keywords: [
      'runtime',
      '环境',
      '服务',
      '客户端',
      '远程',
      '配对',
      '链接',
      'web client',
      '云端',
      '虚拟机'
    ]
  },
  webSearch: {
    title: '当前服务',
    description: '将这个浏览器连接到已保存的 Orca 服务。',
    keywords: ['runtime', '环境', '服务', '客户端', '远程', '配对码', '云端', '虚拟机']
  },
  labels: {
    activeServer: '当前服务',
    localDesktop: '本地桌面',
    noServerConnected: '未连接服务',
    remoteServer: '远程服务',
    savedServers: '已保存服务',
    serverName: '服务名称',
    pairingCode: '配对码',
    shareServer: '共享这个 Orca 服务',
    switchTo: '切换到',
    noEndpoint: '无 endpoint'
  },
  descriptions: {
    activeServerLocal: '本地会保持当前桌面行为；已保存服务会把支持的客户端调用转发到远程 runtime。',
    activeServerWeb: '已保存服务会把这个浏览器连接到已配对的 Orca runtime。',
    pairingHelp: '在服务端运行 orca serve --pairing-address <host>，然后粘贴输出的配对 URL。',
    noSavedServers: '还没有保存服务。',
    shareServer: '创建一个可撤销的访问授权，让浏览器或另一个 Orca 客户端可以连接。',
    switchServer: 'Orca 会先关闭当前服务中的远程终端和浏览器标签页，再加载下一个服务的项目。',
    removeActiveLocal:
      '移除当前服务前，Orca 会先切回本地桌面，并关闭该服务的远程终端和浏览器标签页。',
    removeActiveWeb: '移除当前服务会断开这个浏览器，并关闭该服务的远程终端和浏览器标签页。',
    removeInactive: '这只会从 Orca 中移除已保存服务，不会改变当前服务。'
  },
  actions: {
    refresh: '刷新服务',
    addServer: '添加服务',
    cancel: '取消',
    switch: '切换',
    remove: '移除',
    newLink: '新建链接',
    hideForm: '收起表单'
  },
  feedback: {
    loadFailed: '加载 runtime 环境失败。',
    required: '服务名称和配对码不能为空。',
    duplicate: (name) => `已存在名为“${name}”的服务。`,
    saveFailed: '保存 runtime 环境失败。',
    connected: (name) => `已连接到 ${name}。`,
    saved: (name) => `已保存 ${name}。准备好后可在“当前服务”中切换。`,
    removed: (name) => `已移除 ${name}。`,
    removeFailed: '移除 runtime 环境失败。',
    switchLocalFailed: '无法切换到本地桌面。请修复问题后重试。',
    disconnectFailed: '无法断开这个服务。请修复问题后重试。',
    switchFailed: '无法切换服务。请修复问题后重试。',
    switched: (name) => `已切换到 ${name}。`
  },
  placeholders: {
    serverName: '开发机',
    pairingCode: 'orca://pair#...'
  }
}

export const voiceZhCN: VoiceMessages = {
  enable: {
    title: '启用语音听写',
    description: '将语音输入到当前聚焦的面板。',
    dynamicDescription: (shortcut) => `按 ${shortcut} 将语音输入到当前聚焦的面板。`,
    keywords: ['语音', '听写', '输入', '麦克风', 'stt']
  },
  mode: {
    title: '听写模式',
    description: '切换或按住说话的听写行为。',
    dynamicDescription: (shortcut) =>
      `切换：按一次 ${shortcut} 开始，再按一次停止。按住：按住 ${shortcut} 时持续听写。`,
    toggle: '切换',
    hold: '按住',
    keywords: ['语音', '听写', '模式', '切换', '按住']
  },
  model: {
    title: '语音模型',
    description: '选择听写使用的本地语音转文字模型。',
    selectedDescription: (label, description) => `${label} — ${description}`,
    selectAndDownload: '选择并下载模型后即可启用听写。',
    selectModel: '选择模型',
    streaming: '流式',
    offline: '离线',
    recommended: '推荐',
    extracting: '正在解压...',
    keywords: ['语音', '听写', '模型', 'stt', '下载']
  },
  feedback: {
    permissionGranted: '麦克风权限已授权',
    openedSettings: '已打开 macOS 隐私与安全性设置。授权后请再次启用听写。',
    permissionRequired: '启用语音听写前需要授予麦克风权限。',
    requestFailed: '无法请求麦克风权限，语音听写未启用。',
    downloadFailed: '模型下载失败。',
    deleteFailed: '模型删除失败。'
  }
}
