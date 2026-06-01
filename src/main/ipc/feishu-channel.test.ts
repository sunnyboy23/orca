import { beforeEach, describe, expect, it, vi } from 'vitest'

const { handleMock } = vi.hoisted(() => ({
  handleMock: vi.fn()
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock
  }
}))

import { registerFeishuChannelHandlers } from './feishu-channel'

function getHandler<TArgs, TResult>(
  channel: string
): (_event: { sender: Electron.WebContents }, args: TArgs) => TResult | Promise<TResult> {
  const match = handleMock.mock.calls.find((call) => call[0] === channel)
  expect(match).toBeTruthy()
  return match![1] as (_event: { sender: Electron.WebContents }, args: TArgs) => TResult | Promise<TResult>
}

describe('registerFeishuChannelHandlers', () => {
  beforeEach(() => {
    handleMock.mockReset()
  })

  it('subscribes without throwing when the runtime emits an event synchronously', async () => {
    const send = vi.fn()
    const unsubscribeFeishuChannel = vi.fn()
    const destroyedCallbacks: Array<() => void> = []
    const subscribeFeishuChannel = vi.fn((listener: (event: { type: string }) => void) => {
      listener({ type: 'status' })
      return 'sub-1'
    })

    registerFeishuChannelHandlers({
      listFeishuChannelConversations: vi.fn(),
      listFeishuChannelMessages: vi.fn(),
      getFeishuChannelStatus: vi.fn(),
      sendFeishuChannelMessage: vi.fn(),
      createFeishuRunFromChannelMessage: vi.fn(),
      markFeishuChannelRead: vi.fn(),
      subscribeFeishuChannel,
      unsubscribeFeishuChannel
    } as never)

    const subscribe = getHandler<undefined, { subscriptionId: string }>('feishu-channel:subscribe')
    const result = await subscribe(
      {
        sender: {
          isDestroyed: () => false,
          send,
          once: (_event: string, callback: () => void) => {
            destroyedCallbacks.push(callback)
          }
        } as unknown as Electron.WebContents
      },
      undefined
    )

    expect(result).toEqual({ subscriptionId: 'sub-1' })
    expect(send).toHaveBeenCalledWith('feishu-channel:event', {
      subscriptionId: 'sub-1',
      event: { type: 'status' }
    })

    destroyedCallbacks[0]?.()
    expect(unsubscribeFeishuChannel).toHaveBeenCalledWith('sub-1')
  })
})
