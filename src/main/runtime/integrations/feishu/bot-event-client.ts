import * as Lark from '@larksuiteoapi/node-sdk'
import { extractReceivedMessage, type FeishuReceivedMessage } from './message'

export type FeishuBotEventState = 'idle' | 'connecting' | 'connected' | 'failed' | 'stopped'

export type FeishuBotEventStatus = {
  state: FeishuBotEventState
  lastConnectedAt?: number
  lastEventAt?: number
  lastError?: string
}

export type FeishuBotEventClientConfig = {
  appId: string
  appSecret: string
}

export type FeishuBotEventHandlers = {
  onMessage(message: FeishuReceivedMessage): void | Promise<void>
  onStatusChange?: (status: FeishuBotEventStatus) => void
}

export type FeishuWsClient = {
  start(params: { eventDispatcher: Lark.EventDispatcher }): Promise<void>
  close(params?: { force?: boolean }): void
  getConnectionStatus?(): { state: string }
}

export type FeishuWsClientFactory = (config: FeishuBotEventClientConfig) => FeishuWsClient

export class FeishuBotEventClient {
  private readonly config: FeishuBotEventClientConfig
  private readonly handlers: FeishuBotEventHandlers
  private readonly createWsClient: FeishuWsClientFactory
  private wsClient: FeishuWsClient | null = null
  private status: FeishuBotEventStatus = { state: 'idle' }

  constructor({
    config,
    handlers,
    createWsClient = createDefaultWsClient
  }: {
    config: FeishuBotEventClientConfig
    handlers: FeishuBotEventHandlers
    createWsClient?: FeishuWsClientFactory
  }) {
    this.config = config
    this.handlers = handlers
    this.createWsClient = createWsClient
  }

  getStatus(): FeishuBotEventStatus {
    const wsState = this.wsClient?.getConnectionStatus?.().state
    return {
      ...this.status,
      state: mapWsState(wsState, this.status.state)
    }
  }

  async start(): Promise<FeishuBotEventStatus> {
    this.updateStatus({ state: 'connecting', lastError: undefined })
    const wsClient = this.createWsClient(this.config)
    this.wsClient = wsClient
    try {
      await wsClient.start({
        eventDispatcher: new Lark.EventDispatcher({}).register({
          'im.message.receive_v1': async (data) => {
            this.updateStatus({ state: 'connected', lastEventAt: Date.now() })
            const message = extractReceivedMessage({
              header: { event_type: 'im.message.receive_v1' },
              event: data
            })
            if (message) {
              await this.handlers.onMessage(message)
            }
          }
        })
      })
      this.updateStatus({ state: 'connected', lastConnectedAt: Date.now(), lastError: undefined })
    } catch (err) {
      this.updateStatus({
        state: 'failed',
        lastError: err instanceof Error ? err.message : 'Failed to connect Feishu event channel.'
      })
    }
    return this.getStatus()
  }

  stop(): FeishuBotEventStatus {
    this.wsClient?.close({ force: true })
    this.wsClient = null
    this.updateStatus({ state: 'stopped' })
    return this.getStatus()
  }

  private updateStatus(update: Partial<FeishuBotEventStatus>): void {
    this.status = { ...this.status, ...update }
    this.handlers.onStatusChange?.(this.getStatus())
  }
}

function createDefaultWsClient(config: FeishuBotEventClientConfig): FeishuWsClient {
  return new Lark.WSClient({
    appId: config.appId.trim(),
    appSecret: config.appSecret.trim(),
    domain: Lark.Domain.Feishu,
    loggerLevel: Lark.LoggerLevel.warn
  })
}

function mapWsState(state: string | undefined, fallback: FeishuBotEventState): FeishuBotEventState {
  if (
    state === 'idle' ||
    state === 'connecting' ||
    state === 'connected' ||
    state === 'failed'
  ) {
    return state
  }
  if (state === 'reconnecting') {
    return 'connecting'
  }
  return fallback
}
