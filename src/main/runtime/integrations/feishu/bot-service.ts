import type { FeishuBotConnectionStatus, FeishuIntegrationSettings } from '../../../../shared/types'
import type { OrchestrationDb } from '../../orchestration/db'
import type { CoordinatorRuntime } from '../../orchestration/coordinator'
import type {
  FeishuChannelConversation,
  FeishuChannelCreateRunFromMessageParams,
  FeishuChannelEvent,
  FeishuChannelMarkReadParams,
  FeishuChannelMessage,
  FeishuChannelSendMessageParams,
  FeishuChannelStatus
} from '../../../../shared/feishu-collaboration-types'
import { FeishuBotEventClient, type FeishuWsClientFactory } from './bot-event-client'
import { createFeishuBotOrchestrator, type FeishuBotOrchestrator } from './bot-orchestrator'
import { createFeishuMessageClient, type FeishuMessageClient } from './im-client'
import { FeishuChannelService } from './channel-service'

export type FeishuBotServiceStatus = FeishuBotConnectionStatus

export class FeishuBotService {
  private readonly db: OrchestrationDb
  private readonly runtime: CoordinatorRuntime
  private readonly createMessageClient: (settings: FeishuIntegrationSettings) => FeishuMessageClient
  private readonly createWsClient?: FeishuWsClientFactory
  private eventClient: FeishuBotEventClient | null = null
  private messageClient: FeishuMessageClient | null = null
  private orchestrator: FeishuBotOrchestrator | null = null
  private channelService: FeishuChannelService
  private status: FeishuBotServiceStatus = { state: 'idle', configured: false }

  constructor({
    db,
    runtime,
    createMessageClient = (settings) =>
      createFeishuMessageClient({ appId: settings.appId, appSecret: settings.appSecret }),
    createWsClient
  }: {
    db: OrchestrationDb
    runtime: CoordinatorRuntime
    createMessageClient?: (settings: FeishuIntegrationSettings) => FeishuMessageClient
    createWsClient?: FeishuWsClientFactory
  }) {
    this.db = db
    this.runtime = runtime
    this.createMessageClient = createMessageClient
    this.createWsClient = createWsClient
    this.channelService = new FeishuChannelService({
      getBotStatus: () => this.getStatus(),
      getMessageClient: () => this.messageClient,
      createRunFromMessage: (message) => this.createRunFromChannelMessage(message)
    })
  }

  getStatus(): FeishuBotServiceStatus {
    return this.eventClient ? { ...this.status, ...this.eventClient.getStatus() } : this.status
  }

  async start(settings: FeishuIntegrationSettings | undefined): Promise<FeishuBotServiceStatus> {
    if (!settings?.appId.trim() || !settings.appSecret.trim()) {
      this.status = {
        state: 'failed',
        configured: false,
        lastError: '请先填写飞书 App ID 和 App Secret。'
      }
      return this.getStatus()
    }

    this.stop()
    const messageClient = this.createMessageClient(settings)
    this.messageClient = messageClient
    this.orchestrator = createFeishuBotOrchestrator({
      db: this.db,
      runtime: this.runtime,
      messageClient
    })
    this.eventClient = new FeishuBotEventClient({
      config: { appId: settings.appId, appSecret: settings.appSecret },
      createWsClient: this.createWsClient,
      handlers: {
        onMessage: async (message) => {
          this.channelService.receiveIncoming(message)
          await this.orchestrator?.receiveMessage(message)
        },
        onStatusChange: (status) => {
          this.status = { ...status, configured: true }
          this.channelService.addSystemStatus({
            chatId: undefined,
            text: `飞书事件通道状态：${status.state}`,
            status: status.state === 'failed' ? 'failed' : 'sent'
          })
        }
      }
    })
    const status = await this.eventClient.start()
    this.status = { ...status, configured: true }
    return this.getStatus()
  }

  stop(): FeishuBotServiceStatus {
    if (this.eventClient) {
      const status = this.eventClient.stop()
      this.eventClient = null
      this.messageClient = null
      this.orchestrator = null
      this.status = { ...status, configured: this.status.configured }
    } else {
      this.status = { ...this.status, state: 'stopped' }
    }
    return this.getStatus()
  }

  listChannelConversations(): FeishuChannelConversation[] {
    return this.channelService.listConversations()
  }

  listChannelMessages(chatId: string): FeishuChannelMessage[] {
    return this.channelService.listMessages(chatId)
  }

  getChannelStatus(): FeishuChannelStatus {
    return this.channelService.getStatus()
  }

  sendChannelMessage(params: FeishuChannelSendMessageParams): Promise<FeishuChannelMessage> {
    return this.channelService.sendMessage(params)
  }

  createRunFromChannelMessage(
    params: FeishuChannelCreateRunFromMessageParams | FeishuChannelMessage
  ): Promise<{ runId: string }> {
    if ('id' in params && 'text' in params) {
      return this.createRunFromChannelMessageRecord(params)
    }
    return this.channelService.createRunFromMessage(params)
  }

  markChannelRead(params: FeishuChannelMarkReadParams): { ok: true } {
    return this.channelService.markRead(params)
  }

  subscribeChannel(listener: (event: FeishuChannelEvent) => void): () => void {
    return this.channelService.subscribe(listener)
  }

  private async createRunFromChannelMessageRecord(
    message: FeishuChannelMessage
  ): Promise<{ runId: string }> {
    const orchestrator = this.orchestrator
    if (!orchestrator) {
      throw new Error('飞书机器人尚未连接，无法创建任务。')
    }
    const result = await orchestrator.createRunFromText({
      chatId: message.chatId,
      text: message.text
    })
    if ('error' in result) {
      throw new Error(result.error)
    }
    this.channelService.addSystemStatus({
      chatId: message.chatId,
      text: `已从飞书消息创建任务：${result.runId}`,
      runId: result.runId
    })
    return result
  }
}
