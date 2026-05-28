import { describe, expect, it } from 'vitest'
import { FeishuChannelStore } from './channel-store'

describe('FeishuChannelStore', () => {
  it('deduplicates incoming Feishu messages by remote message id', () => {
    const store = new FeishuChannelStore()

    const first = store.upsertIncoming({
      eventType: 'im.message.receive_v1',
      chatId: 'chat-1',
      messageId: 'msg-1',
      senderOpenId: 'user-1',
      text: 'hello'
    })
    const second = store.upsertIncoming({
      eventType: 'im.message.receive_v1',
      chatId: 'chat-1',
      messageId: 'msg-1',
      senderOpenId: 'user-1',
      text: 'hello again'
    })

    expect(second.id).toBe(first.id)
    expect(store.listMessages('chat-1')).toHaveLength(1)
  })

  it('builds conversations and clears unread counts', () => {
    const store = new FeishuChannelStore()

    store.upsertIncoming({
      eventType: 'im.message.receive_v1',
      chatId: 'chat-1',
      messageId: 'msg-1',
      text: 'first'
    })
    store.addMessage({
      direction: 'outgoing',
      kind: 'text',
      chatId: 'chat-1',
      text: 'reply',
      status: 'sent'
    })

    expect(store.listConversations()[0]).toMatchObject({
      chatId: 'chat-1',
      lastMessageText: 'reply',
      unreadCount: 1
    })
    expect(store.markRead('chat-1')).toMatchObject({ unreadCount: 0 })
  })

  it('prunes old messages by capacity', () => {
    const store = new FeishuChannelStore({ maxMessages: 2 })

    store.addMessage({
      direction: 'system',
      kind: 'status',
      chatId: 'chat',
      text: '1',
      status: 'sent'
    })
    store.addMessage({
      direction: 'system',
      kind: 'status',
      chatId: 'chat',
      text: '2',
      status: 'sent'
    })
    store.addMessage({
      direction: 'system',
      kind: 'status',
      chatId: 'chat',
      text: '3',
      status: 'sent'
    })

    expect(store.listMessages('chat').map((message) => message.text)).toEqual(['2', '3'])
  })
})
