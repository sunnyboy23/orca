import { describe, expect, it, vi } from 'vitest'
import { buildFeishuRunStatusCard } from './cards'
import { sendFeishuInteractiveCard, sendFeishuTextMessage, type FeishuMessageClient } from './im-client'

function mockClient(response: unknown): FeishuMessageClient {
  return {
    im: {
      message: {
        create: vi.fn(async () => response)
      }
    }
  } as unknown as FeishuMessageClient
}

describe('Feishu IM client', () => {
  it('sends sanitized text messages to the source chat', async () => {
    const client = mockClient({ code: 0, data: { message_id: 'om_reply' } })

    const result = await sendFeishuTextMessage({
      client,
      chatId: ' oc_chat ',
      text: 'Started /Users/alice/project/orca with token=abc',
      uuid: 'dedupe-1'
    })

    expect(result).toEqual({ ok: true, messageId: 'om_reply' })
    expect(client.im.message.create).toHaveBeenCalledWith({
      params: { receive_id_type: 'chat_id' },
      data: {
        receive_id: 'oc_chat',
        msg_type: 'text',
        content: JSON.stringify({ text: 'Started [local-path] with token=[redacted]' }),
        uuid: 'dedupe-1'
      }
    })
  })

  it('sends interactive cards as card content, not the wrapper msg_type', async () => {
    const client = mockClient({ code: 0, data: { message_id: 'om_card' } })
    const card = buildFeishuRunStatusCard({
      status: 'running',
      runId: 'run_1',
      summary: 'Review /Users/alice/project/orca'
    })

    const result = await sendFeishuInteractiveCard({ client, chatId: 'oc_chat', card })

    expect(result).toEqual({ ok: true, messageId: 'om_card' })
    const payload = vi.mocked(client.im.message.create).mock.calls[0]?.[0]
    expect(payload?.data.msg_type).toBe('interactive')
    expect(payload?.data.content).toContain('[local-path]')
    expect(payload?.data.content).not.toContain('/Users/alice')
  })

  it('sends private conversation replies by open_id', async () => {
    const client = mockClient({ code: 0, data: { message_id: 'om_private' } })

    const result = await sendFeishuTextMessage({
      client,
      chatId: 'open_id:ou_user',
      text: 'private reply'
    })

    expect(result).toEqual({ ok: true, messageId: 'om_private' })
    expect(client.im.message.create).toHaveBeenCalledWith({
      params: { receive_id_type: 'open_id' },
      data: {
        receive_id: 'ou_user',
        msg_type: 'text',
        content: JSON.stringify({ text: 'private reply' }),
        uuid: undefined
      }
    })
  })

  it('surfaces Feishu API response details from rejected SDK calls', async () => {
    const create = vi.fn(async () => {
      throw {
        response: {
          data: {
            code: 230001,
            msg: 'invalid receive_id'
          }
        }
      }
    })
    const client = {
      im: {
        message: { create }
      }
    } as unknown as FeishuMessageClient

    await expect(
      sendFeishuTextMessage({ client, chatId: 'unknown', text: 'hello' })
    ).resolves.toMatchObject({
      ok: false,
      reason: 'missing_chat'
    })
    await expect(
      sendFeishuTextMessage({ client, chatId: 'oc_chat', text: 'hello' })
    ).resolves.toMatchObject({
      ok: false,
      message: 'invalid receive_id (230001)'
    })
  })

  it('reports missing chats and Feishu API errors', async () => {
    await expect(
      sendFeishuTextMessage({ client: mockClient({ code: 0 }), chatId: '', text: 'hello' })
    ).resolves.toMatchObject({ ok: false, reason: 'missing_chat' })

    await expect(
      sendFeishuTextMessage({
        client: mockClient({ code: 999, msg: 'bot not in chat' }),
        chatId: 'oc_chat',
        text: 'hello'
      })
    ).resolves.toEqual({
      ok: false,
      reason: 'feishu_error',
      code: 999,
      message: 'bot not in chat'
    })
  })
})
