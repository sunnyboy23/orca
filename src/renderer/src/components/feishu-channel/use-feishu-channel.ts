import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  FeishuChannelConversation,
  FeishuChannelEvent,
  FeishuChannelMessage,
  FeishuChannelStatus
} from '../../../../shared/feishu-collaboration-types'
import {
  canReplyToFeishuConversation,
  firstReplyableConversation
} from './feishu-conversation-target'

export type FeishuChannelState = {
  conversations: FeishuChannelConversation[]
  messages: FeishuChannelMessage[]
  status: FeishuChannelStatus | null
  selectedChatId: string | null
  loading: boolean
  error: string | null
  sending: boolean
  creatingRunMessageId: string | null
  selectConversation(chatId: string): void
  refresh(): Promise<void>
  send(text: string): Promise<void>
  createRunFromMessage(messageId: string): Promise<void>
}

export function useFeishuChannel(): FeishuChannelState {
  const [conversations, setConversations] = useState<FeishuChannelConversation[]>([])
  const [messagesByChatId, setMessagesByChatId] = useState<Record<string, FeishuChannelMessage[]>>(
    {}
  )
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [status, setStatus] = useState<FeishuChannelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [creatingRunMessageId, setCreatingRunMessageId] = useState<string | null>(null)

  const selectedMessages = useMemo(
    () => (selectedChatId ? (messagesByChatId[selectedChatId] ?? []) : []),
    [messagesByChatId, selectedChatId]
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextConversations, nextStatus] = await Promise.all([
        window.api.feishuChannel.listConversations(),
        window.api.feishuChannel.getStatus()
      ])
      setConversations(nextConversations)
      setStatus(nextStatus)
      const nextChatId =
        selectedChatId && canReplyToFeishuConversation(selectedChatId)
          ? selectedChatId
          : firstReplyableConversation(nextConversations)?.chatId ?? nextConversations[0]?.chatId ?? null
      setSelectedChatId(nextChatId)
      if (nextChatId) {
        const nextMessages = await window.api.feishuChannel.listMessages({ chatId: nextChatId })
        setMessagesByChatId((prev) => ({ ...prev, [nextChatId]: nextMessages }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Feishu channel.')
    } finally {
      setLoading(false)
    }
  }, [selectedChatId])

  const selectConversation = useCallback((chatId: string) => {
    setSelectedChatId(chatId)
    void window.api.feishuChannel.markRead({ chatId })
    void window.api.feishuChannel.listMessages({ chatId }).then((nextMessages) => {
      setMessagesByChatId((prev) => ({ ...prev, [chatId]: nextMessages }))
    })
  }, [])

  const send = useCallback(
    async (text: string) => {
      if (!selectedChatId || !text.trim()) {
        return
      }
      setSending(true)
      setError(null)
      try {
        await window.api.feishuChannel.sendMessage({ chatId: selectedChatId, text: text.trim() })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send Feishu message.')
      } finally {
        setSending(false)
      }
    },
    [selectedChatId]
  )

  const createRunFromMessage = useCallback(async (messageId: string) => {
    setCreatingRunMessageId(messageId)
    setError(null)
    try {
      await window.api.feishuChannel.createRunFromMessage({ messageId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.')
    } finally {
      setCreatingRunMessageId(null)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    return window.api.feishuChannel.subscribe((event) => {
      applyChannelEvent(event, {
        setConversations,
        setMessagesByChatId,
        setStatus
      })
    })
  }, [])

  return {
    conversations,
    messages: selectedMessages,
    status,
    selectedChatId,
    loading,
    error,
    sending,
    creatingRunMessageId,
    selectConversation,
    refresh,
    send,
    createRunFromMessage
  }
}

function applyChannelEvent(
  event: FeishuChannelEvent,
  setters: {
    setConversations: React.Dispatch<React.SetStateAction<FeishuChannelConversation[]>>
    setMessagesByChatId: React.Dispatch<
      React.SetStateAction<Record<string, FeishuChannelMessage[]>>
    >
    setStatus: React.Dispatch<React.SetStateAction<FeishuChannelStatus | null>>
  }
): void {
  if (event.type === 'snapshot') {
    setters.setConversations(event.conversations)
    setters.setStatus(event.status)
    return
  }
  if (event.type === 'status') {
    setters.setStatus(event.status)
    return
  }
  if (event.type === 'conversation') {
    setters.setConversations((prev) => upsertConversation(prev, event.conversation))
    return
  }
  setters.setConversations((prev) => upsertConversation(prev, event.conversation))
  setters.setMessagesByChatId((prev) => ({
    ...prev,
    [event.message.chatId]: upsertMessage(prev[event.message.chatId] ?? [], event.message)
  }))
}

function upsertConversation(
  conversations: FeishuChannelConversation[],
  conversation: FeishuChannelConversation
): FeishuChannelConversation[] {
  const next = conversations.filter((entry) => entry.chatId !== conversation.chatId)
  next.push(conversation)
  return next.sort((a, b) => b.lastMessageAt - a.lastMessageAt)
}

function upsertMessage(
  messages: FeishuChannelMessage[],
  message: FeishuChannelMessage
): FeishuChannelMessage[] {
  const next = messages.filter((entry) => entry.id !== message.id)
  next.push(message)
  return next.sort((a, b) => a.createdAt - b.createdAt)
}
