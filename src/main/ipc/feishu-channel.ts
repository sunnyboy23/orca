import { ipcMain, type WebContents } from 'electron'
import type { OrcaRuntimeService } from '../runtime/orca-runtime'
import type {
  FeishuChannelEvent,
  FeishuChannelCreateRunFromMessageParams,
  FeishuChannelMarkReadParams,
  FeishuChannelSendMessageParams
} from '../../shared/feishu-collaboration-types'

const CHANNEL_EVENT = 'feishu-channel:event'

export function registerFeishuChannelHandlers(runtime: OrcaRuntimeService): void {
  ipcMain.handle('feishu-channel:list-conversations', () => {
    return runtime.listFeishuChannelConversations()
  })

  ipcMain.handle('feishu-channel:list-messages', (_event, args: { chatId: string }) => {
    return runtime.listFeishuChannelMessages(args.chatId)
  })

  ipcMain.handle('feishu-channel:get-status', () => {
    return runtime.getFeishuChannelStatus()
  })

  ipcMain.handle('feishu-channel:send-message', (_event, args: FeishuChannelSendMessageParams) => {
    return runtime.sendFeishuChannelMessage(args)
  })

  ipcMain.handle(
    'feishu-channel:create-run-from-message',
    (_event, args: FeishuChannelCreateRunFromMessageParams) => {
      return runtime.createFeishuRunFromChannelMessage(args)
    }
  )

  ipcMain.handle('feishu-channel:mark-read', (_event, args: FeishuChannelMarkReadParams) => {
    return runtime.markFeishuChannelRead(args)
  })

  ipcMain.handle('feishu-channel:subscribe', (event) => {
    return subscribeFeishuChannel(runtime, event.sender)
  })

  ipcMain.handle('feishu-channel:unsubscribe', (_event, args: { subscriptionId: string }) => {
    runtime.unsubscribeFeishuChannel(args.subscriptionId)
    return { ok: true }
  })
}

function subscribeFeishuChannel(
  runtime: OrcaRuntimeService,
  webContents: WebContents
): {
  subscriptionId: string
} {
  let subscriptionId = ''
  const pendingEvents: FeishuChannelEvent[] = []
  const emitEvent = (event: FeishuChannelEvent): void => {
    if (webContents.isDestroyed()) {
      return
    }
    if (!subscriptionId) {
      pendingEvents.push(event)
      return
    }
    webContents.send(CHANNEL_EVENT, { subscriptionId, event })
  }
  const nextSubscriptionId = runtime.subscribeFeishuChannel((event) => {
    emitEvent(event)
  })
  subscriptionId = nextSubscriptionId
  for (const event of pendingEvents) {
    emitEvent(event)
  }
  webContents.once('destroyed', () => {
    runtime.unsubscribeFeishuChannel(subscriptionId)
  })
  return { subscriptionId }
}
