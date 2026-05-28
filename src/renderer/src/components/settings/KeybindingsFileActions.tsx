import React from 'react'
import { ChevronDown, Code2, ExternalLink, FileText, FolderOpen, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../../shared/constants'
import { useI18n } from '@/i18n'
import type { ShortcutsMessages } from '@/i18n/settings-shortcuts-types'
import { useAppStore } from '../../store'
import { TOGGLE_FLOATING_TERMINAL_EVENT } from '../../lib/floating-terminal'
import { isFloatingWorkspacePanelVisible } from '../../lib/floating-workspace-terminal-actions'
import { detectLanguage } from '../../lib/language-detect'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'

function openFailureMessage(reason: string, copy: ShortcutsMessages['file']): string {
  switch (reason) {
    case 'not-absolute':
      return copy.openFailures.notAbsolute
    case 'not-found':
      return copy.openFailures.notFound
    case 'launch-failed':
      return copy.openFailures.launchFailed
    default:
      return copy.openFailures.fallback
  }
}

export function KeybindingsFileActions(): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.shortcuts.file
  const keybindingSnapshot = useAppStore((state) => state.keybindingSnapshot)
  const ensureKeybindingsFile = useAppStore((state) => state.ensureKeybindingsFile)
  const openKeybindingsFile = useAppStore((state) => state.openKeybindingsFile)
  const revealKeybindingsFile = useAppStore((state) => state.revealKeybindingsFile)
  const reloadKeybindings = useAppStore((state) => state.reloadKeybindings)
  const openFiles = useAppStore((state) => state.openFiles)
  const openFile = useAppStore((state) => state.openFile)
  const closeFile = useAppStore((state) => state.closeFile)
  const updateSettings = useAppStore((state) => state.updateSettings)
  const floatingTerminalEnabled = useAppStore(
    (state) => state.settings?.floatingTerminalEnabled === true
  )

  const prepareKeybindingsPath = async (): Promise<string | null> => {
    const snapshot = await ensureKeybindingsFile()
    return snapshot?.path ?? keybindingSnapshot?.path ?? null
  }

  const editKeybindingsInOrca = async (): Promise<void> => {
    try {
      const filePath = await prepareKeybindingsPath()
      if (!filePath) {
        toast.error(copy.notAvailable)
        return
      }
      const existingFile = openFiles.find(
        (file) => file.filePath === filePath && file.worktreeId === FLOATING_TERMINAL_WORKTREE_ID
      )
      if (existingFile && !existingFile.isDirty) {
        // Why: a prior denied read can leave a focused error tab. Reopen a
        // clean tab after authorization so the editor retries the file load.
        closeFile(existingFile.id)
      }
      openFile(
        {
          filePath,
          relativePath: 'keybindings.json',
          worktreeId: FLOATING_TERMINAL_WORKTREE_ID,
          language: detectLanguage('keybindings.json'),
          mode: 'edit',
          runtimeEnvironmentId: null
        },
        { preview: false, suppressActiveRuntimeFallback: true }
      )
      if (!floatingTerminalEnabled) {
        await updateSettings({ floatingTerminalEnabled: true })
      }
      requestAnimationFrame(() => {
        if (!isFloatingWorkspacePanelVisible()) {
          window.dispatchEvent(new CustomEvent(TOGGLE_FLOATING_TERMINAL_EVENT))
        }
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.failedOpenOrca)
    }
  }

  const openKeybindingsInExternalEditor = async (command: 'code' | 'cursor'): Promise<void> => {
    try {
      const filePath = await prepareKeybindingsPath()
      if (!filePath) {
        toast.error(copy.notAvailable)
        return
      }
      const result = await window.api.shell.openInExternalEditor(filePath, command)
      if (!result.ok) {
        toast.error(openFailureMessage(result.reason, copy))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.failedExternal)
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-card px-3 py-2 text-card-foreground shadow-xs">
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="shrink-0 text-xs font-medium">{copy.title}</p>
          </div>
          <p className="truncate font-mono text-[11px] leading-4 text-muted-foreground">
            {keybindingSnapshot?.path ?? copy.pathFallback}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
          <div className="inline-flex overflow-hidden rounded-md border border-border bg-background shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="rounded-none border-0 shadow-none"
              onClick={() => void editKeybindingsInOrca()}
            >
              <FileText className="size-3" />
              {copy.editInOrca}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-none border-l border-border"
                  aria-label={copy.menuAria}
                >
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={() => void openKeybindingsFile()}>
                  <ExternalLink className="size-3.5" />
                  {copy.openDefault}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void openKeybindingsInExternalEditor('code')}>
                  <Code2 className="size-3.5" />
                  {copy.openVSCode}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void openKeybindingsInExternalEditor('cursor')}>
                  <Code2 className="size-3.5" />
                  {copy.openCursor}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void revealKeybindingsFile()}>
                  <FolderOpen className="size-3.5" />
                  {copy.reveal}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void reloadKeybindings()}>
                  <RefreshCw className="size-3.5" />
                  {copy.reload}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {keybindingSnapshot?.diagnostics.length ? (
        <div className="space-y-1 border-t border-border/50 pt-2">
          {keybindingSnapshot.diagnostics.map((diagnostic, index) => (
            <p
              key={`${diagnostic.section ?? 'root'}-${diagnostic.actionId ?? index}`}
              className={
                diagnostic.severity === 'error'
                  ? 'text-xs text-destructive'
                  : 'text-xs text-muted-foreground'
              }
            >
              {diagnostic.message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}
