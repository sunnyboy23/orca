import type { FeishuBotConnectionStatus } from './types'

export type FeishuChannelMessageDirection = 'incoming' | 'outgoing' | 'system'

export type FeishuChannelMessageKind = 'text' | 'status' | 'card' | 'error'

export type FeishuChannelMessageStatus =
  | 'received'
  | 'queued'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'ignored'

export type FeishuChannelMessage = {
  id: string
  direction: FeishuChannelMessageDirection
  kind: FeishuChannelMessageKind
  chatId: string
  messageId?: string
  senderOpenId?: string
  senderName?: string
  text: string
  status: FeishuChannelMessageStatus
  runId?: string
  taskId?: string
  gateId?: string
  error?: string
  createdAt: number
  updatedAt: number
}

export type FeishuChannelConversation = {
  chatId: string
  title: string
  lastMessageText: string
  lastMessageAt: number
  unreadCount: number
  activeRunId?: string
  lastError?: string
}

export type FeishuChannelStatus = {
  bot: FeishuBotConnectionStatus
  lastIncomingAt?: number
  lastOutgoingAt?: number
  lastSendError?: string
  storedMessageCount: number
}

export type FeishuChannelEvent =
  | { type: 'snapshot'; conversations: FeishuChannelConversation[]; status: FeishuChannelStatus }
  | { type: 'message'; message: FeishuChannelMessage; conversation: FeishuChannelConversation }
  | { type: 'conversation'; conversation: FeishuChannelConversation }
  | { type: 'status'; status: FeishuChannelStatus }

export type FeishuChannelSendMessageParams = {
  chatId: string
  text: string
}

export type FeishuChannelCreateRunFromMessageParams = {
  messageId: string
}

export type FeishuChannelStopRunParams = {
  runId: string
}

export type FeishuChannelResolveGateParams = {
  chatId: string
  gateId: string
  resolution: string
}

export type FeishuChannelMarkReadParams = {
  chatId: string
}
