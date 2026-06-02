import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FeishuBotService } from './bot-service'
import type { CoordinatorRuntime } from '../../orchestration/coordinator'
import type { FeishuReceivedMessage } from './message'
import type { FeishuBotEventHandlers } from './bot-event-client'

const { createFeishuBotOrchestratorMock, receiveMessageMock, eventHandlers } = vi.hoisted(() => ({
  createFeishuBotOrchestratorMock: vi.fn(),
  receiveMessageMock: vi.fn(),
  eventHandlers: [] as FeishuBotEventHandlers[]
}))

vi.mock('./bot-orchestrator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./bot-orchestrator')>()
  return {
    ...actual,
    createFeishuBotOrchestrator: createFeishuBotOrchestratorMock
  }
})

vi.mock('./bot-event-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./bot-event-client')>()
  return {
    ...actual,
    FeishuBotEventClient: class {
      private readonly handlers: FeishuBotEventHandlers

      constructor(options: { handlers: FeishuBotEventHandlers }) {
        this.handlers = options.handlers
        eventHandlers.push(options.handlers)
      }

      getStatus() {
        return { state: 'connected' }
      }

      async start() {
        this.handlers.onStatusChange?.({ state: 'connected' })
        return { state: 'connected' }
      }

      stop() {
        return { state: 'stopped' }
      }
    }
  }
})

describe('FeishuBotService', () => {
  beforeEach(() => {
    eventHandlers.length = 0
    receiveMessageMock.mockReset()
    createFeishuBotOrchestratorMock.mockReset()
    createFeishuBotOrchestratorMock.mockReturnValue({
      receiveMessage: receiveMessageMock,
      createRunFromText: vi.fn()
    })
  })

  it('marks incoming messages when the main agent creates a run', async () => {
    receiveMessageMock.mockResolvedValue({ runId: 'run_1', handled: true })
    const service = new FeishuBotService({
      db: {} as never,
      runtime: createRuntime(),
      createMessageClient: createMessageClient
    })

    await service.start(createSettings())
    await eventHandlers[0]?.onMessage(createMessage('任务 修复飞书消息实时刷新'))

    expect(receiveMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({ text: '任务 修复飞书消息实时刷新' })
    )
    expect(service.listChannelMessages('oc_1')[0]).toMatchObject({
      status: 'processing',
      runId: 'run_1'
    })
  })

  it('marks incoming messages as ignored when the main agent does not create a run', async () => {
    receiveMessageMock.mockResolvedValue({ handled: false })
    const service = new FeishuBotService({
      db: {} as never,
      runtime: createRuntime(),
      createMessageClient: createMessageClient
    })

    await service.start(createSettings())
    await eventHandlers[0]?.onMessage(createMessage('你好', 'om_hello'))

    expect(receiveMessageMock).toHaveBeenCalled()
    expect(service.listChannelMessages('oc_1')[0]).toMatchObject({
      text: '你好',
      status: 'ignored'
    })
  })
})

function createRuntime(): CoordinatorRuntime {
  return {
    sendTerminal: vi.fn(),
    listTerminals: vi.fn(),
    createTerminal: vi.fn(),
    waitForTerminal: vi.fn(),
    probeWorktreeDrift: vi.fn()
  } as unknown as CoordinatorRuntime
}

function createSettings() {
  return {
    appId: 'cli_app',
    appSecret: 'secret'
  } as never
}

function createMessage(text: string, messageId = 'om_1'): FeishuReceivedMessage {
  return {
    eventType: 'im.message.receive_v1',
    chatId: 'oc_1',
    senderOpenId: 'ou_1',
    messageId,
    text
  }
}

function createMessageClient() {
  return {
    im: {
      message: {
        create: vi.fn().mockResolvedValue({ code: 0, data: { message_id: 'om_reply' } })
      }
    }
  } as never
}
