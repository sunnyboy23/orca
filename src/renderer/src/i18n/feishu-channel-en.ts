import type { FeishuChannelMessages } from './feishu-channel-types'

export const feishuChannelEn: FeishuChannelMessages = {
  title: 'Feishu Channel',
  description: 'View bot messages, reply to Feishu, and turn messages into Orca tasks.',
  connection: {
    credential: 'Credential',
    eventChannel: 'Event channel',
    connected: 'Connected',
    disconnected: 'Not connected',
    lastIncoming: (time) => `Last received: ${time}`,
    lastOutgoing: (time) => `Last sent: ${time}`,
    lastError: (message) => `Last error: ${message}`,
    storedMessages: (count) => `${count} stored messages`
  },
  actions: {
    refresh: 'Refresh',
    send: 'Send',
    sending: 'Sending...',
    openChannel: 'Open Feishu Channel',
    createRun: 'Create task',
    creatingRun: 'Creating...',
    retry: 'Retry'
  },
  empty: {
    conversations: 'No Feishu messages yet.',
    messages: 'This conversation has no messages.',
    selectConversation: 'Select a Feishu conversation to view messages.'
  },
  labels: {
    conversations: 'Conversations',
    replyPlaceholder: 'Reply to Feishu...',
    incoming: 'Feishu',
    outgoing: 'Orca',
    system: 'Status',
    run: (runId) => `Run ${runId}`,
    unread: (count) => `${count} unread`
  },
  errors: {
    loadFailed: 'Failed to load Feishu channel.',
    sendFailed: 'Failed to send Feishu message.',
    createRunFailed: 'Failed to create task from this message.'
  }
}
