import type { AppState } from '@/store/types'

export type FeishuChannelPanelState = Pick<
  AppState,
  'activeView' | 'rightSidebarOpen' | 'rightSidebarTab'
>

export function openFeishuChannelPanelState(): FeishuChannelPanelState {
  return {
    activeView: 'terminal',
    rightSidebarOpen: true,
    rightSidebarTab: 'feishu'
  }
}
