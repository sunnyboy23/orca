import { useState } from 'react'
import { BotMessageSquare, LoaderCircle, RefreshCw, Send, Sparkles } from 'lucide-react'
import { Button } from '../ui/button'
import { useI18n } from '@/i18n'
import { useFeishuChannel } from './use-feishu-channel'
import type {
  FeishuChannelConversation,
  FeishuChannelMessage
} from '../../../../shared/feishu-collaboration-types'

export default function FeishuChannelPage(): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.feishuChannel
  const channel = useFeishuChannel()
  const [draft, setDraft] = useState('')

  const handleSend = async (): Promise<void> => {
    await channel.send(draft)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <header className="border-b border-border/70 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold tracking-normal">{copy.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{copy.description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void channel.refresh()}>
            <RefreshCw className="mr-1.5 size-3.5" />
            {copy.actions.refresh}
          </Button>
        </div>
        <StatusStrip status={channel.status} />
      </header>

      {channel.error ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {channel.error}
        </div>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col">
        <aside className="min-h-0 border-b border-border/70">
          <div className="border-b border-border/60 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {copy.labels.conversations}
          </div>
          {channel.loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              {copy.actions.refresh}
            </div>
          ) : channel.conversations.length === 0 ? (
            <div className="px-4 py-4 text-xs text-muted-foreground">
              {copy.empty.conversations}
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto p-2">
              {channel.conversations.map((conversation) => (
                <ConversationButton
                  key={conversation.chatId}
                  conversation={conversation}
                  selected={conversation.chatId === channel.selectedChatId}
                  onSelect={() => channel.selectConversation(conversation.chatId)}
                />
              ))}
            </div>
          )}
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!channel.selectedChatId ? (
              <EmptyState text={copy.empty.selectConversation} />
            ) : channel.messages.length === 0 ? (
              <EmptyState text={copy.empty.messages} />
            ) : (
              <div className="space-y-3">
                {channel.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    creating={channel.creatingRunMessageId === message.id}
                    onCreateRun={() => void channel.createRunFromMessage(message.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border/70 p-3">
            <div className="flex gap-2">
              <textarea
                className="min-h-16 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={copy.labels.replyPlaceholder}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button
                className="self-end"
                disabled={!draft.trim() || !channel.selectedChatId || channel.sending}
                onClick={() => void handleSend()}
              >
                {channel.sending ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                {channel.sending ? copy.actions.sending : copy.actions.send}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatusStrip({
  status
}: {
  status: ReturnType<typeof useFeishuChannel>['status']
}): React.JSX.Element | null {
  const { messages } = useI18n()
  const copy = messages.feishuChannel
  if (!status) {
    return null
  }
  const connected = status.bot.state === 'connected'
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
      <span className="rounded-full border border-border/70 px-2.5 py-1">
        {copy.connection.eventChannel}:{' '}
        {connected ? copy.connection.connected : copy.connection.disconnected}
      </span>
      <span className="rounded-full border border-border/70 px-2.5 py-1">
        {copy.connection.storedMessages(status.storedMessageCount)}
      </span>
      {status.lastIncomingAt ? (
        <span className="rounded-full border border-border/70 px-2.5 py-1">
          {copy.connection.lastIncoming(new Date(status.lastIncomingAt).toLocaleString())}
        </span>
      ) : null}
      {status.lastSendError ? (
        <span className="rounded-full border border-destructive/40 px-2.5 py-1 text-destructive">
          {copy.connection.lastError(status.lastSendError)}
        </span>
      ) : null}
    </div>
  )
}

function ConversationButton({
  conversation,
  selected,
  onSelect
}: {
  conversation: FeishuChannelConversation
  selected: boolean
  onSelect: () => void
}): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.feishuChannel
  return (
    <button
      type="button"
      className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/70'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-sm font-medium">{conversation.title}</div>
        {conversation.unreadCount > 0 ? (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
            {copy.labels.unread(conversation.unreadCount)}
          </span>
        ) : null}
      </div>
      <div className="mt-1 truncate text-[11px] text-muted-foreground">
        {conversation.lastMessageText}
      </div>
    </button>
  )
}

function MessageBubble({
  message,
  creating,
  onCreateRun
}: {
  message: FeishuChannelMessage
  creating: boolean
  onCreateRun: () => void
}): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.feishuChannel
  const isOutgoing = message.direction === 'outgoing'
  const label =
    message.direction === 'incoming'
      ? copy.labels.incoming
      : message.direction === 'system'
        ? copy.labels.system
        : copy.labels.outgoing
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[88%] rounded-md border border-border/70 bg-muted/35 px-3 py-2">
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <BotMessageSquare className="size-3.5" />
          <span>{label}</span>
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {message.runId ? <span>{copy.labels.run(message.runId)}</span> : null}
        </div>
        <div className="whitespace-pre-wrap break-words text-sm">{message.text}</div>
        {message.error ? (
          <div className="mt-2 text-xs text-destructive">{message.error}</div>
        ) : null}
        {message.direction === 'incoming' && !message.runId ? (
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            disabled={creating}
            onClick={onCreateRun}
          >
            {creating ? (
              <LoaderCircle className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-3.5" />
            )}
            {creating ? copy.actions.creatingRun : copy.actions.createRun}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      {text}
    </div>
  )
}
