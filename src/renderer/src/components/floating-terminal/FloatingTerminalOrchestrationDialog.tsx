import { useCallback, useEffect, useState } from 'react'
import { Check, Clipboard, Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PASTE_TERMINAL_TEXT_EVENT } from '@/constants/terminal'
import {
  AGENT_SKILL_CLI_PREREQUISITE_NOTICE,
  ensureOrcaCliAvailableForAgentSkillTerminal,
  isOrcaCliAvailableOnPath
} from '@/lib/agent-skill-cli-prerequisite'
import { ORCHESTRATION_SKILL_INSTALL_COMMAND } from '@/lib/orchestration-install-command'
import {
  ORCHESTRATION_ENABLED_STORAGE_KEY,
  ORCHESTRATION_SETUP_DISMISSED_STORAGE_KEY,
  notifyOrchestrationSetupStateChanged
} from '@/lib/orchestration-setup-state'
import type { CliInstallStatus } from '../../../../shared/cli-install-types'

type FloatingTerminalOrchestrationDialogProps = {
  open: boolean
  activeTabId: string | null
  onOpenChange: (open: boolean) => void
  onSetupStateChange: () => void
}

export function FloatingTerminalOrchestrationDialog({
  open,
  activeTabId,
  onOpenChange,
  onSetupStateChange
}: FloatingTerminalOrchestrationDialogProps): React.JSX.Element {
  const [cliStatus, setCliStatus] = useState<CliInstallStatus | null>(null)
  const [cliLoading, setCliLoading] = useState(false)
  const [cliBusy, setCliBusy] = useState(false)
  const [skillBusy, setSkillBusy] = useState(false)

  const refreshCliStatus = useCallback(async (): Promise<void> => {
    setCliLoading(true)
    try {
      setCliStatus(await window.api.cli.getInstallStatus())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加载 CLI 状态失败。')
    } finally {
      setCliLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      void refreshCliStatus()
    }
  }, [open, refreshCliStatus])

  const cliInstalled = isOrcaCliAvailableOnPath(cliStatus)
  const cliSupported = cliStatus?.supported ?? false
  const cliLabel = cliInstalled
    ? '`orca` 已在 PATH 中'
    : cliLoading
      ? '正在检查 CLI 状态...'
      : (cliStatus?.detail ?? '注册 `orca`，让 Agent 能从终端调用 Orca。')

  const handleInstallCli = async (): Promise<void> => {
    setCliBusy(true)
    try {
      const next = await ensureOrcaCliAvailableForAgentSkillTerminal({
        onStatusChange: setCliStatus
      })
      if (next) {
        notifyOrchestrationSetupStateChanged()
        onSetupStateChange()
      }
      if (isOrcaCliAvailableOnPath(next)) {
        toast.success('已把 `orca` 注册到 PATH。')
      }
    } finally {
      setCliBusy(false)
    }
  }

  const handlePasteSkillCommand = async (): Promise<void> => {
    setSkillBusy(true)
    try {
      const nextCliStatus = await ensureOrcaCliAvailableForAgentSkillTerminal({
        onStatusChange: setCliStatus
      })
      localStorage.setItem(ORCHESTRATION_ENABLED_STORAGE_KEY, '1')
      localStorage.removeItem(ORCHESTRATION_SETUP_DISMISSED_STORAGE_KEY)
      notifyOrchestrationSetupStateChanged()
      await window.api.ui.writeClipboardText(ORCHESTRATION_SKILL_INSTALL_COMMAND)
      if (activeTabId) {
        window.dispatchEvent(
          new CustomEvent(PASTE_TERMINAL_TEXT_EVENT, {
            detail: {
              tabId: activeTabId,
              text: ORCHESTRATION_SKILL_INSTALL_COMMAND
            }
          })
        )
        toast.success('已粘贴技能安装命令，按 Enter 执行。')
      } else {
        toast.success('已复制技能安装命令。')
      }
      onSetupStateChange()
      if (isOrcaCliAvailableOnPath(nextCliStatus ?? cliStatus)) {
        onOpenChange(false)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '复制技能命令失败。')
    } finally {
      setSkillBusy(false)
    }
  }

  const handleCopySkillCommand = async (): Promise<void> => {
    try {
      await window.api.ui.writeClipboardText(ORCHESTRATION_SKILL_INSTALL_COMMAND)
      toast.success('已复制技能安装命令。')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '复制技能命令失败。')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>启用编排</DialogTitle>
          <DialogDescription>先添加 Orca CLI，然后在当前终端安装 Agent 技能。</DialogDescription>
        </DialogHeader>

        <div className="min-w-0 divide-y divide-border/60 overflow-hidden rounded-md border border-border/60 bg-muted/20">
          <div className="min-w-0 px-3 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">Orca CLI</p>
                <p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                  <span className="shrink-0">{cliLabel}</span>
                  {cliInstalled && cliStatus?.commandPath ? (
                    <code className="min-w-0 overflow-x-auto whitespace-nowrap rounded bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {cliStatus.commandPath}
                    </code>
                  ) : null}
                </p>
              </div>
              <div className="shrink-0">
                {cliInstalled ? (
                  <Button
                    variant="outline"
                    size="xs"
                    disabled
                    className="shrink-0 gap-1.5 disabled:opacity-100"
                    aria-label="Orca CLI 已添加到 PATH"
                  >
                    <Check className="size-3" />
                    已添加
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => void handleInstallCli()}
                    disabled={cliLoading || cliBusy || !cliSupported}
                    className="shrink-0 gap-1.5"
                  >
                    {cliBusy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    添加到 PATH
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">编排技能</p>
                  <p className="text-xs text-muted-foreground">
                    把这条命令粘贴到终端，让 Agent 能通过 Orca 协同工作。
                  </p>
                  {!cliInstalled ? (
                    <p className="text-xs text-muted-foreground">
                      {AGENT_SKILL_CLI_PREREQUISITE_NOTICE}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => void handlePasteSkillCommand()}
                  disabled={skillBusy}
                  className="shrink-0 gap-1.5"
                >
                  {skillBusy ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Clipboard className="size-3.5" />
                  )}
                  {activeTabId ? '粘贴' : '复制'}
                </Button>
              </div>
              <div className="flex min-w-0 items-center gap-2 rounded bg-background px-2 py-1.5">
                <code className="min-w-0 flex-1 text-[11px] leading-relaxed break-all whitespace-normal text-muted-foreground">
                  {ORCHESTRATION_SKILL_INSTALL_COMMAND}
                </code>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0"
                  onClick={() => void handleCopySkillCommand()}
                  aria-label="复制编排技能安装命令"
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
