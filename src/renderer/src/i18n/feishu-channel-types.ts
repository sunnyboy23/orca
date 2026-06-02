export type FeishuChannelMessages = {
  title: string
  description: string
  connection: {
    credential: string
    eventChannel: string
    connected: string
    disconnected: string
    lastIncoming: (time: string) => string
    lastOutgoing: (time: string) => string
    lastError: (message: string) => string
    storedMessages: (count: number) => string
  }
  actions: {
    refresh: string
    send: string
    sending: string
    openChannel: string
    createRun: string
    creatingRun: string
    retry: string
  }
  empty: {
    conversations: string
    messages: string
    selectConversation: string
  }
  labels: {
    conversations: string
    replyPlaceholder: string
    waitingForConversation: string
    incoming: string
    outgoing: string
    system: string
    ignored: string
    queued: string
    processing: string
    failed: string
    run: (runId: string) => string
    unread: (count: number) => string
  }
  errors: {
    loadFailed: string
    sendFailed: string
    createRunFailed: string
  }
}
