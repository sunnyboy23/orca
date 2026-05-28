import { describe, expect, it, vi } from 'vitest'
import { FeishuChannelService } from './channel-service'
import type { FeishuMessageClient } from './im-client'

describe('FeishuChannelService', () => {
  it('stores incoming messages and emits channel events', () => {
    const events: string[] = []
    const service = new FeishuChannelService({
      getBotStatus: () => ({ state: 'connected', configured: true }),
      getMessageClient: () => null
    })
    service.subscribe((event) => events.push(event.type))

    service.receiveIncoming({
      eventType: 'im.message.receive_v1',
      chatId: 'chat-1',
      messageId: 'msg-1',
      text: 'hello'
    })

    expect(service.listConversations()).toHaveLength(1)
    expect(service.listMessages('chat-1')[0]).toMatchObject({ text: 'hello', status: 'received' })
    expect(events).toContain('message')
    expect(events).toContain('status')
  })

  it('records failed outgoing messages when the bot is disconnected', async () => {
    const service = new FeishuChannelService({
      getBotStatus: () => ({ state: 'stopped', configured: true }),
      getMessageClient: () => null
    })

    const message = await service.sendMessage({ chatId: 'chat-1', text: 'reply' })

    expect(message).toMatchObject({
      direction: 'outgoing',
      status: 'failed',
      error: '飞书机器人尚未连接，无法发送消息。'
    })
    expect(service.getStatus().lastSendError).toBe('飞书机器人尚未连接，无法发送消息。')
  })

  it('updates outgoing messages after a successful send', async () => {
    const create = vi.fn().mockResolvedValue({
      code: 0,
      data: { message_id: 'om_sent' }
    })
    const service = new FeishuChannelService({
      getBotStatus: () => ({ state: 'connected', configured: true }),
      getMessageClient: () =>
        ({
          im: { message: { create } }
        }) as unknown as FeishuMessageClient
    })

    const message = await service.sendMessage({ chatId: 'chat-1', text: 'reply' })

    expect(message).toMatchObject({
      status: 'sent',
      messageId: 'om_sent'
    })
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ receive_id: 'chat-1' })
      })
    )
  })
})
