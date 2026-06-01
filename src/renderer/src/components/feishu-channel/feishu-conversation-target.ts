import type { FeishuChannelConversation } from '../../../../shared/feishu-collaboration-types'

export function canReplyToFeishuConversation(chatId: string | null | undefined): boolean {
  return Boolean(chatId && chatId !== 'unknown')
}

export function firstReplyableConversation(
  conversations: FeishuChannelConversation[]
): FeishuChannelConversation | null {
  return conversations.find((conversation) => canReplyToFeishuConversation(conversation.chatId)) ?? null
}
