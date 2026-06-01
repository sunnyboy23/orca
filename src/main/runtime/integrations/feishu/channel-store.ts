import { randomUUID } from 'crypto'
import type {
  FeishuChannelConversation,
  FeishuChannelMessage,
  FeishuChannelMessageKind,
  FeishuChannelMessageStatus
} from '../../../../shared/feishu-collaboration-types'
import type { FeishuReceivedMessage } from './message'
import { createOpenIdConversationId, describeFeishuConversation } from './recipient'

const DEFAULT_MAX_MESSAGES = 500

export type FeishuChannelMessageInput = {
  direction: FeishuChannelMessage['direction']
  kind: FeishuChannelMessageKind
  chatId: string
  text: string
  status: FeishuChannelMessageStatus
  messageId?: string
  senderOpenId?: string
  senderName?: string
  runId?: string
  taskId?: string
  gateId?: string
  error?: string
}

export type FeishuChannelStoreOptions = {
  maxMessages?: number
}

export class FeishuChannelStore {
  private readonly maxMessages: number
  private readonly messages: FeishuChannelMessage[] = []
  private readonly readAtByChatId = new Map<string, number>()

  constructor(options: FeishuChannelStoreOptions = {}) {
    this.maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES
  }

  upsertIncoming(message: FeishuReceivedMessage): FeishuChannelMessage {
    const existing = message.messageId ? this.findByRemoteMessageId(message.messageId) : null
    if (existing) {
      return existing
    }
    return this.addMessage({
      direction: 'incoming',
      kind: 'text',
      chatId: resolveIncomingConversationId(message),
      messageId: message.messageId,
      senderOpenId: message.senderOpenId,
      text: message.text,
      status: 'received'
    })
  }

  addMessage(input: FeishuChannelMessageInput): FeishuChannelMessage {
    const now = Date.now()
    const message: FeishuChannelMessage = {
      id: randomUUID(),
      direction: input.direction,
      kind: input.kind,
      chatId: input.chatId.trim() || 'unknown',
      text: input.text,
      status: input.status,
      createdAt: now,
      updatedAt: now,
      ...(input.messageId ? { messageId: input.messageId } : {}),
      ...(input.senderOpenId ? { senderOpenId: input.senderOpenId } : {}),
      ...(input.senderName ? { senderName: input.senderName } : {}),
      ...(input.runId ? { runId: input.runId } : {}),
      ...(input.taskId ? { taskId: input.taskId } : {}),
      ...(input.gateId ? { gateId: input.gateId } : {}),
      ...(input.error ? { error: input.error } : {})
    }
    this.messages.push(message)
    this.prune()
    return message
  }

  updateMessage(
    id: string,
    updates: Partial<
      Pick<
        FeishuChannelMessage,
        'status' | 'messageId' | 'runId' | 'taskId' | 'gateId' | 'error' | 'text'
      >
    >
  ): FeishuChannelMessage | null {
    const message = this.messages.find((entry) => entry.id === id)
    if (!message) {
      return null
    }
    Object.assign(message, updates, { updatedAt: Date.now() })
    return message
  }

  findById(id: string): FeishuChannelMessage | null {
    return this.messages.find((message) => message.id === id) ?? null
  }

  findByRemoteMessageId(messageId: string): FeishuChannelMessage | null {
    return this.messages.find((message) => message.messageId === messageId) ?? null
  }

  listMessages(chatId: string): FeishuChannelMessage[] {
    return this.messages
      .filter((message) => message.chatId === chatId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(cloneMessage)
  }

  listConversations(): FeishuChannelConversation[] {
    const byChatId = new Map<string, FeishuChannelMessage[]>()
    for (const message of this.messages) {
      const entries = byChatId.get(message.chatId) ?? []
      entries.push(message)
      byChatId.set(message.chatId, entries)
    }
    return [...byChatId.entries()]
      .map(([chatId, messages]) => this.buildConversation(chatId, messages))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
  }

  getConversation(chatId: string): FeishuChannelConversation | null {
    const messages = this.messages.filter((message) => message.chatId === chatId)
    return messages.length > 0 ? this.buildConversation(chatId, messages) : null
  }

  markRead(chatId: string): FeishuChannelConversation | null {
    this.readAtByChatId.set(chatId, Date.now())
    return this.getConversation(chatId)
  }

  count(): number {
    return this.messages.length
  }

  private buildConversation(
    chatId: string,
    messages: FeishuChannelMessage[]
  ): FeishuChannelConversation {
    const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt)
    const last = sorted.at(-1)!
    const readAt = this.readAtByChatId.get(chatId) ?? 0
    const unreadCount = sorted.filter(
      (message) => message.direction === 'incoming' && message.createdAt > readAt
    ).length
    const activeRunId = [...sorted].reverse().find((message) => message.runId)?.runId
    const lastError = [...sorted].reverse().find((message) => message.error)?.error
    return {
      chatId,
      title: describeFeishuConversation(chatId),
      lastMessageText: last.text,
      lastMessageAt: last.createdAt,
      unreadCount,
      ...(activeRunId ? { activeRunId } : {}),
      ...(lastError ? { lastError } : {})
    }
  }

  private prune(): void {
    if (this.messages.length <= this.maxMessages) {
      return
    }
    this.messages.splice(0, this.messages.length - this.maxMessages)
  }
}

function cloneMessage(message: FeishuChannelMessage): FeishuChannelMessage {
  return { ...message }
}

function resolveIncomingConversationId(message: FeishuReceivedMessage): string {
  if (message.chatId?.trim()) {
    return message.chatId
  }
  if (message.senderOpenId?.trim()) {
    return createOpenIdConversationId(message.senderOpenId)
  }
  return 'unknown'
}
