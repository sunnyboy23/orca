import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Accessibility,
  Bluetooth,
  Camera,
  ExternalLink,
  HardDrive,
  Mic,
  MonitorUp,
  Network,
  RefreshCw,
  ShieldCheck,
  Usb,
  Workflow
} from 'lucide-react'
import { toast } from 'sonner'
import type {
  DeveloperPermissionId,
  DeveloperPermissionState,
  DeveloperPermissionStatus
} from '../../../../shared/developer-permissions-types'
import { Button } from '../ui/button'
export { DEVELOPER_PERMISSIONS_PANE_SEARCH_ENTRIES } from './developer-permissions-search'

type PermissionDefinition = {
  id: DeveloperPermissionId
  label: string
  description: string
  actionLabel: string
  icon: ReactNode
}

const PERMISSIONS: PermissionDefinition[] = [
  {
    id: 'microphone',
    label: '麦克风',
    description: '用于语音输入、转写、录音，以及 sox、ffmpeg、Whisper 等命令行工具。',
    actionLabel: '请求授权',
    icon: <Mic className="size-4" />
  },
  {
    id: 'camera',
    label: '摄像头',
    description: '用于摄像头采集和依赖相机的本地测试应用。',
    actionLabel: '请求授权',
    icon: <Camera className="size-4" />
  },
  {
    id: 'screen',
    label: '屏幕录制',
    description: '用于截图、视觉自动化和界面检查工具。',
    actionLabel: '打开系统设置',
    icon: <MonitorUp className="size-4" />
  },
  {
    id: 'accessibility',
    label: '辅助功能',
    description: '用于按键注入、窗口控制和 UI 自动化工具。',
    actionLabel: '请求授权',
    icon: <Accessibility className="size-4" />
  },
  {
    id: 'full-disk-access',
    label: '完全磁盘访问权限',
    description: '让终端会话持续访问受保护目录。',
    actionLabel: '打开系统设置',
    icon: <HardDrive className="size-4" />
  },
  {
    id: 'automation',
    label: '自动化',
    description: '用于控制其他本地应用的 Apple Events 脚本。',
    actionLabel: '触发系统提示',
    icon: <Workflow className="size-4" />
  },
  {
    id: 'local-network',
    label: '本地网络',
    description: '用于发现并访问你局域网里的开发服务。',
    actionLabel: '触发系统提示',
    icon: <Network className="size-4" />
  },
  {
    id: 'usb',
    label: 'USB 设备',
    description: '用于硬件调试和访问 USB 设备的工具。',
    actionLabel: '打开系统设置',
    icon: <Usb className="size-4" />
  },
  {
    id: 'bluetooth',
    label: '蓝牙',
    description: '用于蓝牙设备工具和本地硬件实验。',
    actionLabel: '打开系统设置',
    icon: <Bluetooth className="size-4" />
  }
]

function statusLabel(status: DeveloperPermissionStatus | undefined): string {
  switch (status) {
    case 'granted':
      return '已授权'
    case 'denied':
      return '已拒绝'
    case 'not-determined':
      return '未请求'
    case 'restricted':
      return '受限制'
    case 'unsupported':
      return '仅 macOS'
    case 'ready':
      return '已具备'
    case 'unknown':
    default:
      return '请手动检查'
  }
}

function statusClass(status: DeveloperPermissionStatus | undefined): string {
  if (status === 'granted' || status === 'ready') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  }
  if (status === 'denied' || status === 'restricted') {
    return 'border-destructive/30 bg-destructive/10 text-destructive'
  }
  return 'border-border bg-muted text-muted-foreground'
}

export function DeveloperPermissionsPane(): React.JSX.Element {
  const [states, setStates] = useState<DeveloperPermissionState[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<DeveloperPermissionId | null>(null)

  const stateById = useMemo(
    () => new Map(states.map((state) => [state.id, state.status] as const)),
    [states]
  )

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    try {
      setStates(await window.api.developerPermissions.getStatus())
    } catch {
      toast.error('无法加载开发者权限状态')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Why: after the user flips a permission in System Settings and switches
  // back to Orca, the chip should reflect the new status without a manual
  // Refresh click. Tied to window focus rather than a polling interval so
  // we don't keep hammering `systemPreferences` while the pane is idle.
  useEffect(() => {
    const onFocus = (): void => {
      void refresh()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  const request = async (id: DeveloperPermissionId): Promise<void> => {
    setPendingId(id)
    try {
      const result = await window.api.developerPermissions.request({ id })
      await refresh()
      if (result.status === 'granted') {
        toast.success('权限已授权')
      } else if (result.openedSystemSettings) {
        toast.message('已打开 macOS 隐私与安全性')
      } else {
        toast.message('已发送权限请求')
      }
    } catch {
      toast.error('无法请求权限')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/25 px-4 py-3">
          <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4" />
            终端里运行的开发工具会继承 Orca 的 macOS 权限边界。
          </div>
          <p className="text-xs text-muted-foreground">
            当 CLI、本地应用或自动化工具需要 macOS 隐私权限时，在这里处理。Orca 不会在启动时一次性申请全部权限。
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void refresh()}>
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      <div className="divide-y divide-border/60 rounded-lg border border-border/60">
        {PERMISSIONS.map((permission) => {
          const status = stateById.get(permission.id)
          const pending = pendingId === permission.id

          return (
            <div key={permission.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">{permission.icon}</div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{permission.label}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(
                        status
                      )}`}
                    >
                      {statusLabel(status)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pending || status === 'unsupported'}
                onClick={() => void request(permission.id)}
                className="shrink-0 gap-1.5"
              >
                <ExternalLink className="size-3.5" />
                {pending ? '处理中...' : permission.actionLabel}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
