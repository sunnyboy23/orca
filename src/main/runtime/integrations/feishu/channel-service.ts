import type {
  FeishuChannelConversation,
  FeishuChannelCreateRunFromMessageParams,
  FeishuChannelEvent,
  FeishuChannelMarkReadParams,
  FeishuChannelMessage,
  FeishuChannelSendMessageParams,
  FeishuChannelStatus
} from '../../../../shared/feishu-collaboration-types'
import type { FeishuBotConnectionStatus } from '../../../../shared/types'
import type { FeishuReceivedMessage } from './message'
import { sendFeishuTextMessage, type FeishuMessageClient } from './im-client'
import { FeishuChannelStore } from './channel-store'

export type FeishuChannelServiceOptions = {
  store?: FeishuChannelStore
  getBotStatus: () => FeishuBotConnectionStatus
  getMessageClient: () => FeishuMessageClient | null
  createRunFromMessage?: (
    message: FeishuChannelMessage
  ) => Promise<{ runId: string } | { error: string }>
}

export class FeishuChannelService {
  private readonly store: FeishuChannelStore
  private readonly getBotStatus: () => FeishuBotConnectionStatus
  private readonly getMessageClient: () => FeishuMessageClient | null
  private readonly createRunFromMessageHandler?: FeishuChannelServiceOptions['createRunFromMessage']
  private readonly listeners = new Set<(event: FeishuChannelEvent) => void>()
  private lastIncomingAt: number | undefined
  private lastOutgoingAt: number | undefined
  private lastSendError: string | undefined

  constructor(options: FeishuChannelServiceOptions) {
    this.store = options.store ?? new FeishuChannelStore()
    this.getBotStatus = options.getBotStatus
    this.getMessageClient = options.getMessageClient
    this.createRunFromMessageHandler = options.createRunFromMessage
  }

  listConversations(): FeishuChannelConversation[] {
    return this.store.listConversations()
  }

  listMessages(chatId: string): FeishuChannelMessage[] {
    return this.store.listMessages(chatId)
  }

  getStatus(): FeishuChannelStatus {
    return {
      bot: this.getBotStatus(),
      storedMessageCount: this.store.count(),
      ...(this.lastIncomingAt ? { lastIncomingAt: this.lastIncomingAt } : {}),
      ...(this.lastOutgoingAt ? { lastOutgoingAt: this.lastOutgoingAt } : {}),
      ...(this.lastSendError ? { lastSendError: this.lastSendError } : {})
    }
  }

  receiveIncoming(message: FeishuReceivedMessage): FeishuChannelMessage {
    const stored = this.store.upsertIncoming(message)
    this.lastIncomingAt = Date.now()
    this.emitMessage(stored)
    this.emitStatus()
    return stored
  }

  addSystemStatus({
    chatId,
    text,
    runId,
    gateId,
    status = 'sent'
  }: {
    chatId: string | undefined
    text: string
    runId?: string
    gateId?: string
    status?: FeishuChannelMessage['status']
  }): FeishuChannelMessage {
    const message = this.store.addMessage({
      direction: 'system',
      kind: 'status',
      chatId: chatId ?? 'unknown',
      text,
      status,
      runId,
      gateId
    })
    this.emitMessage(message)
    this.emitStatus()
    return message
  }

  async sendMessage(params: FeishuChannelSendMessageParams): Promise<FeishuChannelMessage> {
    const draft = this.store.addMessage({
      direction: 'outgoing',
      kind: 'text',
      chatId: params.chatId,
      text: params.text,
      status: 'queued'
    })
    this.emitMessage(draft)

    const client = this.getMessageClient()
    if (!client) {
      return this.markSendFailed(draft.id, '飞书机器人尚未连接，无法发送消息。')
    }

    const result = await sendFeishuTextMessage({
      client,
      chatId: params.chatId,
      text: params.text,
      uuid: draft.id
    })
    if (!result.ok) {
      return this.markSendFailed(draft.id, result.message)
    }

    const sent =
      this.store.updateMessage(draft.id, {
        status: 'sent',
        messageId: result.messageId
      }) ?? draft
    this.lastOutgoingAt = Date.now()
    this.lastSendError = undefined
    this.emitMessage(sent)
    this.emitStatus()
    return sent
  }

  async createRunFromMessage(
    params: FeishuChannelCreateRunFromMessageParams
  ): Promise<{ runId: string }> {
    const message = this.store.findById(params.messageId)
    if (!message) {
      throw new Error('Feishu channel message not found.')
    }
    if (!this.createRunFromMessageHandler) {
      throw new Error('Feishu run creation is unavailable.')
    }
    const result = await this.createRunFromMessageHandler(message)
    if ('error' in result) {
      this.store.updateMessage(message.id, { status: 'failed', error: result.error })
      this.emitMessage(this.store.findById(message.id) ?? message)
      throw new Error(result.error)
    }
    const updated =
      this.store.updateMessage(message.id, {
        status: 'processing',
        runId: result.runId
      }) ?? message
    this.emitMessage(updated)
    return result
  }

  markRead(params: FeishuChannelMarkReadParams): { ok: true } {
    const conversation = this.store.markRead(params.chatId)
    if (conversation) {
      this.emit({ type: 'conversation', conversation })
    }
    return { ok: true }
  }

  subscribe(listener: (event: FeishuChannelEvent) => void): () => void {
    this.listeners.add(listener)
    listener({
      type: 'snapshot',
      conversations: this.listConversations(),
      status: this.getStatus()
    })
    return () => {
      this.listeners.delete(listener)
    }
  }

  private markSendFailed(id: string, error: string): FeishuChannelMessage {
    const failed = this.store.updateMessage(id, {
      status: 'failed',
      error
    })
    if (!failed) {
      throw new Error(error)
    }
    this.lastSendError = error
    this.emitMessage(failed)
    this.emitStatus()
    return failed
  }

  private emitMessage(message: FeishuChannelMessage): void {
    this.emit({
      type: 'message',
      message,
      conversation: this.store.getConversation(message.chatId)!
    })
  }

  private emitStatus(): void {
    this.emit({ type: 'status', status: this.getStatus() })
  }

  private emit(event: FeishuChannelEvent): void {
    for (const listener of this.listeners) {
      listener(event)
    }
  }
}
