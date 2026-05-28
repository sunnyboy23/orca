import type { SshSettingsMessages } from './settings-ssh-types'

export const sshZhCN: SshSettingsMessages = {
  search: {
    connections: {
      title: 'SSH 连接',
      description: '管理远程 SSH 目标。',
      keywords: ['ssh', 'remote', 'server', 'connection', 'host', '远程', '连接', '主机']
    },
    addTarget: {
      title: '添加 SSH 目标',
      description: '添加新的远程 SSH 目标。',
      keywords: ['ssh', 'add', 'new', 'target', 'host', 'server', '添加', '目标', '主机']
    },
    importConfig: {
      title: '从 SSH Config 导入',
      description: '从 ~/.ssh/config 导入主机。',
      keywords: ['ssh', 'import', 'config', 'hosts', '导入', '配置', '主机']
    },
    testConnection: {
      title: '测试连接',
      description: '测试 SSH 目标是否可连接。',
      keywords: ['ssh', 'test', 'connection', 'ping', '测试', '连接']
    }
  },
  toasts: {
    loadFailed: '无法加载 SSH 目标',
    hostAndUsernameRequired: 'Host 和用户名为必填项',
    invalidPort: '端口必须在 1 到 65535 之间',
    invalidRelayGracePeriod: (maxSeconds) =>
      `Relay 保活时间必须在 60 到 ${maxSeconds} 秒之间，或者选择一直保活直到重置`,
    targetUpdated: '目标已更新',
    targetAdded: '目标已添加',
    saveFailed: '无法保存目标',
    targetRemoved: '目标已移除',
    removeFailed: '无法移除目标',
    connectionFailed: '连接失败',
    disconnectFailed: '断开连接失败',
    remoteTerminalsEnded: '远程终端已结束',
    endRemoteTerminalsFailed: '无法结束远程终端',
    relayReset: '远程 relay 已重置',
    relayResetFailed: '无法重置远程 relay',
    connectionSuccessful: '连接成功',
    connectionTestFailed: '连接测试失败',
    testFailed: '测试失败',
    noNewHosts: '没有在 ~/.ssh/config 中发现新的主机',
    importedHosts: (count) => `已导入 ${count} 个主机`,
    importFailed: '导入失败'
  },
  header: {
    targets: '目标',
    description: '添加远程主机后，即可在 Orca 中连接使用。',
    import: '导入',
    addTarget: '添加目标',
    empty: '还没有配置 SSH 目标。'
  },
  status: {
    disconnected: '未连接',
    connecting: '连接中...',
    'auth-failed': '认证失败',
    'deploying-relay': '正在部署 relay...',
    connected: '已连接',
    reconnecting: '正在重连...',
    'reconnection-failed': '重连失败',
    error: '错误'
  },
  card: {
    endingRemoteTerminals: '正在结束远程终端',
    endRemoteTerminals: '结束远程终端',
    resettingRemoteRelay: '正在重置远程 relay',
    resetRemoteRelay: '重置远程 relay',
    editTarget: '编辑目标',
    removingTarget: '正在移除目标',
    removeTarget: '移除目标',
    disconnect: '断开连接',
    connecting: '连接中',
    test: '测试',
    connect: '连接'
  },
  form: {
    editTitle: '编辑 SSH 目标',
    newTitle: '新建 SSH 目标',
    label: '名称',
    host: 'Host *',
    username: '用户名 *',
    port: '端口',
    identityFile: 'Identity File',
    proxyCommand: 'Proxy Command',
    jumpHost: 'Jump Host',
    relayGracePeriod: 'Relay 保活时间（秒）',
    keepAliveUntilReset: '一直保活直到重置',
    keepAliveDescription: '远程终端会保持可用，直到你结束终端或重置 relay。',
    relayHelp: (maxSeconds) =>
      `断开连接后，relay 继续保留远程终端的时长。默认：10800（3 小时）。最大：${maxSeconds}（7 天）。`,
    saveChanges: '保存更改',
    addTarget: '添加目标',
    cancel: '取消',
    placeholders: {
      label: '我的服务器',
      host: '192.168.1.100 或 server.example.com',
      username: 'deploy',
      port: '22',
      identityFile: '~/.ssh/id_ed25519（留空则使用 SSH agent）',
      proxyCommand: '例如 cloudflared access ssh --hostname %h',
      jumpHost: 'bastion.example.com',
      untilReset: '直到重置'
    },
    help: {
      identityFile: '可选。默认使用 SSH agent。',
      proxyCommand: '可选。用于隧道连接，例如 Cloudflare Access 或 ProxyCommand。',
      jumpHost: '可选。等价于 ProxyJump / ssh -J。'
    }
  },
  dialogs: {
    cancel: '取消',
    remove: {
      title: '移除 SSH 目标',
      description: '这会移除该目标，并结束所有活跃的远程终端。',
      action: '移除',
      busy: '正在移除'
    },
    resetRelay: {
      title: '重置远程 relay？',
      description:
        '这会强制停止该 SSH 目标的远程 relay。此目标上的活跃远程终端和端口转发都会结束。',
      action: '重置 relay',
      busy: '正在重置'
    },
    terminate: {
      title: '结束远程终端？',
      description: '这会停止该 SSH 目标上的活跃终端会话。重新连接后也无法恢复这些会话。',
      action: '结束终端',
      busy: '正在结束'
    }
  }
}
