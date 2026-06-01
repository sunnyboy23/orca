export type FeishuRecipient =
  | { receiveIdType: 'chat_id'; receiveId: string }
  | { receiveIdType: 'open_id'; receiveId: string }

const OPEN_ID_PREFIX = 'open_id:'

export function createOpenIdConversationId(openId: string): string {
  return `${OPEN_ID_PREFIX}${openId.trim()}`
}

export function resolveFeishuRecipient(conversationId: string | undefined): FeishuRecipient | null {
  const trimmed = conversationId?.trim()
  if (!trimmed || trimmed === 'unknown') {
    return null
  }
  if (trimmed.startsWith(OPEN_ID_PREFIX)) {
    const openId = trimmed.slice(OPEN_ID_PREFIX.length).trim()
    return openId ? { receiveIdType: 'open_id', receiveId: openId } : null
  }
  return { receiveIdType: 'chat_id', receiveId: trimmed }
}

export function describeFeishuConversation(conversationId: string): string {
  const recipient = resolveFeishuRecipient(conversationId)
  if (!recipient) {
    return '未知飞书会话'
  }
  if (recipient.receiveIdType === 'open_id') {
    return `飞书用户 ${recipient.receiveId}`
  }
  return `飞书会话 ${recipient.receiveId}`
}
