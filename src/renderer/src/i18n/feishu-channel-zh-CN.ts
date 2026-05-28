import type { FeishuChannelMessages } from './feishu-channel-types'

export const feishuChannelZhCN: FeishuChannelMessages = {
  title: '飞书通道',
  description: '查看机器人收到的消息，直接回复飞书，并把消息转为 Orca 任务。',
  connection: {
    credential: '凭证',
    eventChannel: '事件通道',
    connected: '已连接',
    disconnected: '未连接',
    lastIncoming: (time) => `最近收到：${time}`,
    lastOutgoing: (time) => `最近发送：${time}`,
    lastError: (message) => `最近错误：${message}`,
    storedMessages: (count) => `本机已保存 ${count} 条消息`
  },
  actions: {
    refresh: '刷新',
    send: '发送',
    sending: '发送中...',
    openChannel: '打开飞书通道',
    createRun: '转为任务',
    creatingRun: '创建中...',
    retry: '重试'
  },
  empty: {
    conversations: '还没有收到飞书消息。',
    messages: '这个会话里还没有消息。',
    selectConversation: '选择一个飞书会话查看消息。'
  },
  labels: {
    conversations: '会话',
    replyPlaceholder: '回复飞书...',
    incoming: '飞书',
    outgoing: 'Orca',
    system: '状态',
    run: (runId) => `任务 ${runId}`,
    unread: (count) => `${count} 条未读`
  },
  errors: {
    loadFailed: '加载飞书通道失败。',
    sendFailed: '飞书消息发送失败。',
    createRunFailed: '无法从这条消息创建任务。'
  }
}
