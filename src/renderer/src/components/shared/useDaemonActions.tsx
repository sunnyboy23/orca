import React, { useCallback, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'

export type DaemonActionKind = 'restart' | 'killAll'

export type DaemonActionCallbacks = {
  // Why: ManageSessionsSection owns an optimistic setSessions([]) + rollback
  // pattern. Exposing lifecycle hooks lets each caller keep the state that
  // belongs to it (the settings pane's list; the status bar's badge) instead
  // of pulling unrelated concerns into this module.
  onKillAllStart?: () => void
  onKillAllError?: () => void
  onKillAllSettled?: () => void
  onRestartSettled?: () => void
  copy?: DaemonActionCopy
}

type PendingConfirm = DaemonActionKind | null

export type DaemonActionCopy = {
  toasts: {
    daemonRestarted: string
    restartFailedCheckLogs: string
    restartFailed: string
    killedPartial: (killed: number, total: number, remaining: number) => string
    killedCount: (count: number) => string
    noSessionsRunning: string
    refusedToExit: (count: number) => string
    killAllFailed: string
  }
  dialog: {
    restartTitle: string
    restartDescription: string
    restartConfirm: string
    restarting: string
    killAllTitle: string
    killAllDescription: string
    killAllConfirm: string
    killing: string
    cancel: string
  }
}

export type DaemonActionsApi = {
  pending: PendingConfirm
  setPending: (kind: PendingConfirm) => void
  busyKind: DaemonActionKind | null
  isBusy: boolean
  runRestart: () => Promise<void>
  runKillAll: () => Promise<void>
  runConfirmed: () => void
}

export function useDaemonActions(callbacks?: DaemonActionCallbacks): DaemonActionsApi {
  const copy = callbacks?.copy ?? defaultDaemonActionCopy
  const [pending, setPending] = useState<PendingConfirm>(null)
  const [busyKind, setBusyKind] = useState<DaemonActionKind | null>(null)

  const runRestart = useCallback(async () => {
    setBusyKind('restart')
    try {
      const { success } = await window.api.pty.management.restart()
      if (success) {
        toast.success(copy.toasts.daemonRestarted)
      } else {
        toast.error(copy.toasts.restartFailedCheckLogs)
      }
    } catch (err) {
      toast.error(copy.toasts.restartFailed, {
        description: err instanceof Error ? err.message : undefined
      })
    } finally {
      setBusyKind(null)
      setPending(null)
      callbacks?.onRestartSettled?.()
    }
  }, [callbacks, copy])

  const runKillAll = useCallback(async () => {
    setBusyKind('killAll')
    callbacks?.onKillAllStart?.()
    try {
      const { killedCount, remainingCount } = await window.api.pty.management.killAll()
      if (remainingCount > 0 && killedCount > 0) {
        toast.warning(
          copy.toasts.killedPartial(killedCount, killedCount + remainingCount, remainingCount)
        )
      } else if (killedCount > 0) {
        toast.success(copy.toasts.killedCount(killedCount))
      } else if (remainingCount === 0) {
        toast.info(copy.toasts.noSessionsRunning)
      } else {
        toast.error(copy.toasts.refusedToExit(remainingCount))
      }
    } catch (err) {
      callbacks?.onKillAllError?.()
      toast.error(copy.toasts.killAllFailed, {
        description: err instanceof Error ? err.message : undefined
      })
    } finally {
      setBusyKind(null)
      setPending(null)
      callbacks?.onKillAllSettled?.()
    }
  }, [callbacks, copy])

  const runConfirmed = useCallback(() => {
    if (pending === 'restart') {
      void runRestart()
    } else if (pending === 'killAll') {
      void runKillAll()
    }
  }, [pending, runRestart, runKillAll])

  return {
    pending,
    setPending,
    busyKind,
    isBusy: busyKind !== null,
    runRestart,
    runKillAll,
    runConfirmed
  }
}

type CopyShape = {
  title: string
  description: React.ReactNode
  confirmLabel: string
  busyLabel: string
}

const defaultDaemonActionCopy: DaemonActionCopy = {
  toasts: {
    daemonRestarted: 'Daemon restarted.',
    restartFailedCheckLogs: 'Restart failed — check logs.',
    restartFailed: 'Restart failed.',
    killedPartial: (killed, total, remaining) =>
      `Killed ${killed} of ${total} sessions. ${remaining} refused to exit.`,
    killedCount: (count) => `Killed ${count} session${count === 1 ? '' : 's'}.`,
    noSessionsRunning: 'No sessions running.',
    refusedToExit: (count) => `${count} session${count === 1 ? '' : 's'} refused to exit.`,
    killAllFailed: 'Couldn’t kill sessions.'
  },
  dialog: {
    restartTitle: 'Restart the terminal daemon?',
    restartDescription:
      'Kills every running terminal pane and restarts the daemon process. Panes show “Process exited” and can be reopened immediately. Legacy-protocol sessions from a previous app version are preserved. This can’t be undone.',
    restartConfirm: 'Restart daemon',
    restarting: 'Restarting…',
    killAllTitle: 'Kill all terminal sessions?',
    killAllDescription:
      'This force-quits every running terminal pane across all workspaces. Any unsaved work in those sessions is lost. The daemon itself keeps running, and new terminals can be opened immediately. This can’t be undone.',
    killAllConfirm: 'Kill all sessions',
    killing: 'Killing…',
    cancel: 'Cancel'
  }
}

function getCopy(kind: DaemonActionKind, copy: DaemonActionCopy): CopyShape {
  if (kind === 'restart') {
    return {
      title: copy.dialog.restartTitle,
      description: copy.dialog.restartDescription,
      confirmLabel: copy.dialog.restartConfirm,
      busyLabel: copy.dialog.restarting
    }
  }
  return {
    title: copy.dialog.killAllTitle,
    description: copy.dialog.killAllDescription,
    confirmLabel: copy.dialog.killAllConfirm,
    busyLabel: copy.dialog.killing
  }
}

export function DaemonActionDialog({
  api,
  // Why: when mounted under a Popover, we need the confirm to stay open while
  // the mutation runs. The caller wires `onOpenChange` here to gate dismissal.
  extraDescription,
  copy
}: {
  api: DaemonActionsApi
  extraDescription?: React.ReactNode
  copy?: DaemonActionCopy
}): React.JSX.Element {
  const { pending, setPending, busyKind, isBusy, runConfirmed } = api
  const resolvedCopy = copy ?? defaultDaemonActionCopy
  const dialogCopy = pending ? getCopy(pending, resolvedCopy) : null
  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (open) {
          return
        }
        if (isBusy) {
          return
        }
        setPending(null)
      }}
    >
      <DialogContent
        className="max-w-md"
        showCloseButton={!isBusy}
        onPointerDownOutside={(e) => {
          if (isBusy) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isBusy) {
            e.preventDefault()
          }
        }}
      >
        {dialogCopy ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-sm">{dialogCopy.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {dialogCopy.description}
                {extraDescription ? <div className="mt-2">{extraDescription}</div> : null}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPending(null)} disabled={isBusy}>
                {resolvedCopy.dialog.cancel}
              </Button>
              <Button variant="destructive" onClick={runConfirmed} disabled={isBusy}>
                {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {isBusy && busyKind === pending ? dialogCopy.busyLabel : dialogCopy.confirmLabel}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
