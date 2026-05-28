import { sanitizeFeishuText } from './sanitizer'
import { parseJsonObject } from './event-body'

export type FeishuReceivedMessage = {
  text: string
  messageId?: string
  chatId?: string
  senderOpenId?: string
  eventType: string
}

export function verifyFeishuToken(
  body: Record<string, unknown>,
  verificationToken: string | undefined
): { ok: true } | { ok: false } {
  if (!verificationToken) {
    return { ok: true }
  }
  const token = readString(body, 'token') ?? readString(readRecord(body, 'header'), 'token')
  return token === verificationToken ? { ok: true } : { ok: false }
}

export function extractReceivedMessage(body: Record<string, unknown>): FeishuReceivedMessage | null {
  const eventType = extractEventType(body)
  if (eventType !== 'im.message.receive_v1') {
    return null
  }
  const event = readRecord(body, 'event')
  const message = readRecord(event, 'message')
  const text = extractMessageText(message)
  if (!text.trim()) {
    return null
  }
  const sender = readRecord(event, 'sender')
  const senderId = readRecord(sender, 'sender_id')
  return {
    text: sanitizeFeishuText(text),
    messageId: readString(message, 'message_id'),
    chatId: readString(message, 'chat_id'),
    senderOpenId: readString(senderId, 'open_id'),
    eventType
  }
}

export function extractEventType(body: Record<string, unknown>): string {
  return (
    readString(readRecord(body, 'header'), 'event_type') ??
    readString(body, 'event_type') ??
    readString(body, 'type') ??
    'unknown'
  )
}

function extractMessageText(message: Record<string, unknown>): string {
  const content = readString(message, 'content')
  if (!content) {
    return readString(message, 'text') ?? ''
  }
  const parsed = parseJsonObject(content)
  return parsed ? (readString(parsed, 'text') ?? content) : content
}

function readRecord(record: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = record[key]
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}
