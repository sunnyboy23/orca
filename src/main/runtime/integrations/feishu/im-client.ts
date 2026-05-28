import * as Lark from '@larksuiteoapi/node-sdk'
import type { FeishuInteractiveCard } from './cards'
import { sanitizeFeishuText, sanitizeFeishuValue } from './sanitizer'

export type FeishuMessageClient = Pick<
  Lark.Client,
  'im'
>

export type FeishuMessageSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: 'missing_chat' | 'feishu_error' | 'network_error'; message: string; code?: number }

export type FeishuMessageClientConfig = {
  appId: string
  appSecret: string
}

export function createFeishuMessageClient(config: FeishuMessageClientConfig): FeishuMessageClient {
  return new Lark.Client({
    appId: config.appId.trim(),
    appSecret: config.appSecret.trim(),
    appType: Lark.AppType.SelfBuild,
    domain: Lark.Domain.Feishu
  })
}

export async function sendFeishuTextMessage({
  client,
  chatId,
  text,
  uuid
}: {
  client: FeishuMessageClient
  chatId: string | undefined
  text: string
  uuid?: string
}): Promise<FeishuMessageSendResult> {
  return sendFeishuMessage({
    client,
    chatId,
    msgType: 'text',
    content: JSON.stringify({ text: sanitizeFeishuText(text) }),
    uuid
  })
}

export async function sendFeishuInteractiveCard({
  client,
  chatId,
  card,
  uuid
}: {
  client: FeishuMessageClient
  chatId: string | undefined
  card: FeishuInteractiveCard
  uuid?: string
}): Promise<FeishuMessageSendResult> {
  return sendFeishuMessage({
    client,
    chatId,
    msgType: 'interactive',
    content: JSON.stringify(sanitizeFeishuValue(card.card)),
    uuid
  })
}

async function sendFeishuMessage({
  client,
  chatId,
  msgType,
  content,
  uuid
}: {
  client: FeishuMessageClient
  chatId: string | undefined
  msgType: 'text' | 'interactive'
  content: string
  uuid?: string
}): Promise<FeishuMessageSendResult> {
  const trimmedChatId = chatId?.trim()
  if (!trimmedChatId) {
    return { ok: false, reason: 'missing_chat', message: 'Missing Feishu chat ID.' }
  }

  try {
    const response = await client.im.message.create({
      params: { receive_id_type: 'chat_id' },
      data: {
        receive_id: trimmedChatId,
        msg_type: msgType,
        content,
        uuid
      }
    })
    if (response.code && response.code !== 0) {
      return {
        ok: false,
        reason: 'feishu_error',
        code: response.code,
        message: response.msg ?? `Feishu returned error code ${response.code}.`
      }
    }
    return { ok: true, messageId: response.data?.message_id }
  } catch (err) {
    return {
      ok: false,
      reason: 'network_error',
      message: err instanceof Error ? err.message : 'Failed to send Feishu message.'
    }
  }
}
