import type { SettingsSearchEntry } from './settings-search'

export const DEVELOPER_PERMISSIONS_PANE_SEARCH_ENTRIES: SettingsSearchEntry[] = [
  {
    title: '开发者权限',
    description: '终端启动的开发工具所需的 macOS 隐私权限。',
    keywords: ['权限', '隐私', 'tcc', 'macos', '开发工具']
  },
  {
    title: '麦克风与摄像头',
    description: '允许语音、转写、摄像头和媒体采集工具使用这些权限。',
    keywords: ['microphone', 'camera', 'voice', 'audio', 'video', '麦克风', '摄像头', '语音']
  },
  {
    title: '屏幕录制与辅助功能',
    description: '允许截图、屏幕检查、按键控制和窗口自动化。',
    keywords: ['screen recording', 'accessibility', 'screenshot', 'automation', '屏幕录制', '辅助功能']
  },
  {
    title: '完全磁盘访问权限',
    description: '打开 macOS 隐私设置，授予终端更广泛的文件访问能力。',
    keywords: ['full disk access', 'documents', 'downloads', 'desktop', '完全磁盘访问权限']
  },
  {
    title: '本地网络、USB 与蓝牙',
    description: '允许终端会话中使用设备访问和局域网发现工具。',
    keywords: ['local network', 'usb', 'bluetooth', 'bonjour', 'mdns', '本地网络', '蓝牙', 'USB']
  }
]
