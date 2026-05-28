/* eslint-disable max-lines */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  EyeOff,
  Loader2,
  Minus,
  RefreshCcw,
  Search,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import RepoMultiCombobox from '@/components/ui/repo-multi-combobox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppStore } from '@/store'
import { cn } from '@/lib/utils'
import { useI18n, type I18nMessages } from '@/i18n'
import { activateAndRevealWorktree } from '@/lib/worktree-activation'
import { isGitRepoKind } from '../../../../shared/repo-kind'
import {
  canQueueWorkspaceCleanupCandidate,
  type WorkspaceCleanupCandidate,
  type WorkspaceCleanupScanError,
  type WorkspaceCleanupTier
} from '../../../../shared/workspace-cleanup'

type CleanupView = WorkspaceCleanupTier | 'hidden'

type WorkspaceCleanupCopy = I18nMessages['workspace']['cleanup']

function getTierLabels(copy: WorkspaceCleanupCopy): Record<WorkspaceCleanupTier, string> {
  return {
    ready: copy.suggestedCleanup,
    review: copy.closerLook,
    protected: copy.notSuggestedForCleanup
  }
}

function formatRelativeTime(timestamp: number, copy: WorkspaceCleanupCopy): string {
  if (!timestamp) {
    return copy.never
  }
  const deltaMs = Date.now() - timestamp
  if (deltaMs < 60_000) {
    return copy.justNow
  }
  const minutes = Math.floor(deltaMs / 60_000)
  if (minutes < 60) {
    return copy.minutesAgo(minutes)
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 48) {
    return copy.hoursAgo(hours)
  }
  return copy.daysAgo(Math.floor(hours / 24))
}

function isDisconnectedRemoteScanError(message: string): boolean {
  return (
    message === 'SSH provider is unavailable.' ||
    message === 'Remote workspaces are not connected. Reconnect and refresh to check them.'
  )
}

function formatScanNoticeMessage(
  errors: WorkspaceCleanupScanError[],
  repoNameById: Map<string, string>,
  copy: WorkspaceCleanupCopy
): string | null {
  const visibleErrors = errors.filter(
    (error) => !isDisconnectedRemoteScanError(error.message ?? '')
  )
  if (visibleErrors.length === 0) {
    return null
  }
  if (visibleErrors.length === 1) {
    const error = visibleErrors[0]
    const repoName = formatScanErrorRepoName(error, repoNameById, copy)
    return copy.scanNotice.single(repoName, formatScanErrorReason(error.message, copy))
  }
  const repoNames = visibleErrors
    .slice(0, 3)
    .map((error) => formatScanErrorRepoName(error, repoNameById, copy))
    .join(', ')
  const moreCount = visibleErrors.length - 3
  return copy.scanNotice.multiple(visibleErrors.length, repoNames, moreCount)
}

function formatScanErrorRepoName(
  error: Partial<WorkspaceCleanupScanError>,
  repoNameById: Map<string, string>,
  copy: WorkspaceCleanupCopy
): string {
  const repoName = error.repoName?.trim()
  if (repoName) {
    return repoName
  }
  const fallback = error.repoId ? repoNameById.get(error.repoId)?.trim() : ''
  return fallback || copy.scanNotice.repoFallback
}

function formatScanErrorReason(message: string | undefined, copy: WorkspaceCleanupCopy): string {
  if (!message) {
    return copy.scanNotice.defaultReason
  }
  if (message === 'Could not scan workspace cleanup for this repository.') {
    return copy.scanNotice.defaultReason
  }
  return message.replace(/\.$/, '')
}

function isOldWorkspaceCandidate(candidate: WorkspaceCleanupCandidate): boolean {
  if (candidate.blockers.includes('main-worktree') || candidate.blockers.includes('folder-repo')) {
    return false
  }
  return candidate.reasons.includes('archived') || candidate.reasons.includes('idle-clean')
}

function compareCleanupCandidates(
  a: WorkspaceCleanupCandidate,
  b: WorkspaceCleanupCandidate
): number {
  const priorityA = getCleanupCandidatePriority(a)
  const priorityB = getCleanupCandidatePriority(b)
  if (priorityA !== priorityB) {
    return priorityA - priorityB
  }
  return a.lastActivityAt - b.lastActivityAt
}

function getCleanupCandidatePriority(candidate: WorkspaceCleanupCandidate): number {
  if (candidate.tier === 'ready') {
    return 0
  }
  if (candidate.reasons.length > 0) {
    return 1
  }
  if (isOldWorkspaceCandidate(candidate)) {
    return 2
  }
  return 3
}

export default function WorkspaceCleanupDialog(): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.workspace.cleanup
  const tierLabels = useMemo(() => getTierLabels(copy), [copy])
  const activeModal = useAppStore((s) => s.activeModal)
  const closeModal = useAppStore((s) => s.closeModal)
  const scan = useAppStore((s) => s.workspaceCleanupScan)
  const loading = useAppStore((s) => s.workspaceCleanupLoading)
  const error = useAppStore((s) => s.workspaceCleanupError)
  const repos = useAppStore((s) => s.repos)
  const scanWorkspaceCleanup = useAppStore((s) => s.scanWorkspaceCleanup)
  const markCandidateViewed = useAppStore((s) => s.markWorkspaceCleanupCandidateViewed)
  const dismissCandidates = useAppStore((s) => s.dismissWorkspaceCleanupCandidates)
  const resetDismissals = useAppStore((s) => s.resetWorkspaceCleanupDismissals)
  const removeCandidates = useAppStore((s) => s.removeWorkspaceCleanupCandidates)

  const open = activeModal === 'workspace-cleanup'
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [activeView, setActiveView] = useState<CleanupView>('ready')
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [rowFailures, setRowFailures] = useState<Record<string, string>>({})
  const [repoSelection, setRepoSelection] = useState<ReadonlySet<string>>(() => new Set())
  const eligibleRepos = useMemo(() => repos.filter((repo) => isGitRepoKind(repo)), [repos])
  const eligibleRepoIds = useMemo(() => eligibleRepos.map((repo) => repo.id), [eligibleRepos])

  useEffect(() => {
    if (open) {
      setRowFailures({})
      setActiveView('ready')
      void scanWorkspaceCleanup().catch((err: unknown) => {
        toast.error(copy.scanFailed, {
          description: err instanceof Error ? err.message : String(err)
        })
      })
    }
  }, [copy.scanFailed, open, scanWorkspaceCleanup])

  useEffect(() => {
    if (!open) {
      return
    }
    setRepoSelection(new Set(eligibleRepoIds))
  }, [eligibleRepoIds, open])

  const candidates = useMemo(() => scan?.candidates ?? [], [scan?.candidates])
  const effectiveRepoSelection = useMemo<ReadonlySet<string>>(() => {
    if (repoSelection.size > 0 || eligibleRepoIds.length === 0) {
      return repoSelection
    }
    return new Set(eligibleRepoIds)
  }, [eligibleRepoIds, repoSelection])
  const filteredCandidates = useMemo(() => {
    if (
      effectiveRepoSelection.size === 0 ||
      effectiveRepoSelection.size === eligibleRepoIds.length
    ) {
      return candidates
    }
    return candidates.filter((candidate) => effectiveRepoSelection.has(candidate.repoId))
  }, [candidates, effectiveRepoSelection, eligibleRepoIds.length])

  useEffect(() => {
    if (!open || !scan) {
      return
    }
    setSelectedIds(
      new Set(
        candidates
          .filter((candidate) => candidate.selectedByDefault)
          .map((candidate) => candidate.worktreeId)
      )
    )
    setConfirming(false)
  }, [open, scan, scan?.scannedAt, candidates])

  const visibleCandidates = useMemo(() => {
    const rows = filteredCandidates.filter((candidate) => !candidate.blockers.includes('dismissed'))
    return [...rows].sort(compareCleanupCandidates)
  }, [filteredCandidates])
  const hiddenCandidates = useMemo(
    () =>
      filteredCandidates
        .filter((candidate) => candidate.blockers.includes('dismissed'))
        .sort(compareCleanupCandidates),
    [filteredCandidates]
  )
  const groups = useMemo(
    () => ({
      ready: visibleCandidates.filter((candidate) => candidate.tier === 'ready'),
      review: visibleCandidates.filter((candidate) => candidate.tier === 'review'),
      protected: visibleCandidates.filter((candidate) => candidate.tier === 'protected')
    }),
    [visibleCandidates]
  )
  const selectedCandidates = useMemo(() => {
    const byId = new Map(filteredCandidates.map((candidate) => [candidate.worktreeId, candidate]))
    return [...selectedIds]
      .map((id) => byId.get(id))
      .filter(
        (candidate): candidate is WorkspaceCleanupCandidate =>
          candidate != null && canQueueWorkspaceCleanupCandidate(candidate)
      )
  }, [filteredCandidates, selectedIds])

  const hiddenByKeepCount = filteredCandidates.filter((candidate) =>
    candidate.blockers.includes('dismissed')
  ).length
  const repoNameById = useMemo(
    () => new Map(repos.map((repo) => [repo.id, repo.displayName || repo.path])),
    [repos]
  )
  const selectedScanErrors = useMemo(
    () => (scan?.errors ?? []).filter((error) => effectiveRepoSelection.has(error.repoId)),
    [effectiveRepoSelection, scan?.errors]
  )
  const scanNoticeMessage = useMemo(
    () => formatScanNoticeMessage(selectedScanErrors, repoNameById, copy),
    [copy, repoNameById, selectedScanErrors]
  )
  const readyCount = groups.ready.length
  const protectedCount = groups.protected.length
  const inactiveCount = filteredCandidates.length
  const hasAnyCandidates = candidates.length > 0
  const initialLoading = loading && !scan
  const activeRows = activeView === 'hidden' ? hiddenCandidates : groups[activeView]
  const activeQueueableRows = useMemo(
    () => activeRows.filter(canQueueWorkspaceCleanupCandidate),
    [activeRows]
  )
  const activeQueueableSelected = useMemo(
    () => activeQueueableRows.filter((candidate) => selectedIds.has(candidate.worktreeId)).length,
    [activeQueueableRows, selectedIds]
  )
  const allActiveQueueableSelected =
    activeQueueableRows.length > 0 && activeQueueableSelected === activeQueueableRows.length
  const someActiveQueueableSelected = activeQueueableSelected > 0
  const activeSelectionState = allActiveQueueableSelected
    ? 'checked'
    : someActiveQueueableSelected
      ? 'mixed'
      : 'unchecked'

  useEffect(() => {
    if (!open || loading || !scan) {
      return
    }
    if (activeRows.length > 0) {
      return
    }
    if (readyCount > 0) {
      setActiveView('ready')
    } else if (groups.review.length > 0) {
      setActiveView('review')
    } else if (groups.protected.length > 0) {
      setActiveView('protected')
    } else if (hiddenCandidates.length > 0) {
      setActiveView('hidden')
    }
  }, [
    activeRows.length,
    groups.protected.length,
    groups.review.length,
    hiddenCandidates.length,
    loading,
    open,
    readyCount,
    scan
  ])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !removing) {
        closeModal()
      }
    },
    [closeModal, removing]
  )

  const refresh = useCallback(() => {
    setRowFailures({})
    void scanWorkspaceCleanup().catch((err: unknown) => {
      toast.error(copy.scanFailed, {
        description: err instanceof Error ? err.message : String(err)
      })
    })
  }, [copy.scanFailed, scanWorkspaceCleanup])

  const toggleActiveSelection = useCallback(() => {
    if (activeQueueableRows.length === 0) {
      return
    }
    setSelectedIds((current) => {
      const next = new Set(current)
      if (allActiveQueueableSelected) {
        for (const candidate of activeQueueableRows) {
          next.delete(candidate.worktreeId)
        }
      } else {
        for (const candidate of activeQueueableRows) {
          next.add(candidate.worktreeId)
        }
      }
      return next
    })
  }, [activeQueueableRows, allActiveQueueableSelected])

  const ignoreCandidate = useCallback(
    (candidate: WorkspaceCleanupCandidate) => {
      void dismissCandidates([candidate])
        .then(() => {
          setSelectedIds((current) => {
            const next = new Set(current)
            next.delete(candidate.worktreeId)
            return next
          })
        })
        .catch((err: unknown) => {
          toast.error(copy.ignoreFailed, {
            description: err instanceof Error ? err.message : String(err)
          })
        })
    },
    [copy.ignoreFailed, dismissCandidates]
  )

  const confirmRemove = useCallback(async () => {
    if (selectedCandidates.length === 0) {
      return
    }
    setRemoving(true)
    setRowFailures({})
    try {
      const result = await removeCandidates(
        selectedCandidates.map((candidate) => candidate.worktreeId)
      )
      const nextFailures: Record<string, string> = {}
      for (const failure of result.failures) {
        nextFailures[failure.worktreeId] = failure.message
      }
      setRowFailures(nextFailures)
      setSelectedIds((current) => {
        const next = new Set(current)
        for (const id of result.removedIds) {
          next.delete(id)
        }
        return next
      })
      if (result.removedIds.length > 0) {
        toast.success(copy.removed(result.removedIds.length))
      }
      if (result.failures.length > 0) {
        toast.error(copy.removeFailed(result.failures.length))
      } else {
        setConfirming(false)
      }
    } finally {
      setRemoving(false)
    }
  }, [copy, removeCandidates, selectedCandidates])

  const selectedCount = selectedCandidates.length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(820px,90vh)] w-[calc(100vw-3rem)] max-w-[calc(100vw-3rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[calc(100vw-3rem)] xl:w-[920px] xl:max-w-[920px]"
      >
        {!confirming ? (
          <>
            <DialogHeader className="border-b border-border px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-base">{copy.title}</DialogTitle>
                  <DialogDescription className="mt-1 text-xs">
                    {copy.description}
                  </DialogDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={copy.refresh}
                        onClick={refresh}
                        disabled={loading}
                      >
                        <RefreshCcw className={cn('size-3.5', loading && 'animate-spin')} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={4}>
                      {copy.refresh}
                    </TooltipContent>
                  </Tooltip>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={copy.close}
                    onClick={() => closeModal()}
                    disabled={removing}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {initialLoading ? (
              <div className="flex items-start gap-2 border-b border-border bg-muted/25 px-5 py-3">
                <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-foreground">
                    {copy.checkingSafety}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {copy.checkingSafetyDescription}
                  </div>
                </div>
              </div>
            ) : hasAnyCandidates ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/25 px-4 py-2.5">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <div className="min-w-0 text-sm font-medium text-foreground">
                    {copy.selected(selectedCount)}
                  </div>
                  <StatusPill>{copy.inactive(inactiveCount)}</StatusPill>
                  {readyCount > 0 ? (
                    <StatusPill tone="ready">{copy.safeToRemove(readyCount)}</StatusPill>
                  ) : null}
                  {groups.review.length > 0 ? (
                    <StatusPill tone="review">{copy.needReview(groups.review.length)}</StatusPill>
                  ) : null}
                  {protectedCount > 0 ? (
                    <StatusPill>{copy.notSuggested(protectedCount)}</StatusPill>
                  ) : null}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {eligibleRepos.length > 1 ? (
                    <div className="w-[220px] max-w-full">
                      <RepoMultiCombobox
                        repos={eligibleRepos}
                        selected={effectiveRepoSelection}
                        onChange={(next) => setRepoSelection(new Set(next))}
                        onSelectAll={() => setRepoSelection(new Set(eligibleRepoIds))}
                        triggerClassName="h-8 w-full rounded-md border border-border/60 bg-background px-2 text-xs font-medium shadow-xs hover:bg-accent/60"
                      />
                    </div>
                  ) : null}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirming(true)}
                    disabled={selectedCount === 0}
                  >
                    <Trash2 className="size-3.5" />
                    {copy.deleteSelected}
                  </Button>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="border-b border-destructive/30 bg-destructive/10 px-5 py-2 text-xs text-destructive">
                {error}
              </div>
            ) : scanNoticeMessage ? (
              <div className="flex items-center gap-2 border-b border-border bg-muted/25 px-5 py-2 text-xs text-muted-foreground">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>{scanNoticeMessage}</span>
              </div>
            ) : null}

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[185px_minmax(0,1fr)]">
              <CleanupViewNav
                activeView={activeView}
                counts={{
                  ready: groups.ready.length,
                  review: groups.review.length,
                  protected: groups.protected.length,
                  hidden: hiddenByKeepCount
                }}
                onViewChange={setActiveView}
                copy={copy}
              />
              <div className="flex min-h-0 min-w-0 flex-col border-t border-border md:border-l md:border-t-0">
                <div className="flex min-h-10 items-center justify-between gap-3 border-b border-border px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {activeView !== 'hidden' && activeQueueableRows.length > 0 ? (
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={
                          activeSelectionState === 'mixed' ? 'mixed' : allActiveQueueableSelected
                        }
                        aria-label={
                          allActiveQueueableSelected
                            ? copy.unselectAllIn(tierLabels[activeView])
                            : copy.selectAllIn(tierLabels[activeView])
                        }
                        onClick={toggleActiveSelection}
                        className="flex size-4 shrink-0 items-center justify-center rounded border border-border bg-background text-primary hover:bg-accent"
                      >
                        {activeSelectionState === 'checked' ? (
                          <Check className="size-3" strokeWidth={3} />
                        ) : activeSelectionState === 'mixed' ? (
                          <Minus className="size-3" strokeWidth={3} />
                        ) : null}
                      </button>
                    ) : null}
                    <div className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                      {activeView === 'hidden'
                        ? copy.ignoredCleanupSuggestions
                        : tierLabels[activeView]}
                    </div>
                  </div>
                  {activeView === 'hidden' && hiddenByKeepCount > 0 ? (
                    <Button
                      variant="link"
                      size="xs"
                      className="h-auto shrink-0 px-0 text-xs"
                      onClick={() => void resetDismissals()}
                    >
                      {copy.restoreIgnoredSuggestions}
                    </Button>
                  ) : (
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {copy.sortedByOldestActivity}
                    </div>
                  )}
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <div>
                    {initialLoading ? <SkeletonRows /> : null}
                    {!loading && scan && candidates.length === 0 && !scanNoticeMessage ? (
                      <EmptyState title={copy.emptyNoInactive} />
                    ) : null}
                    {!loading && scan && candidates.length === 0 && scanNoticeMessage ? (
                      <EmptyState title={copy.emptyNoInactiveInCheckedRepos} />
                    ) : null}
                    {!loading &&
                    scan &&
                    candidates.length > 0 &&
                    filteredCandidates.length === 0 ? (
                      <EmptyState
                        title={copy.emptyNoRepoMatch}
                        actionLabel={copy.showAllRepos}
                        onAction={() => setRepoSelection(new Set(eligibleRepoIds))}
                      />
                    ) : null}
                    {!loading &&
                    scan &&
                    filteredCandidates.length > 0 &&
                    visibleCandidates.length === 0 ? (
                      <EmptyState
                        title={copy.emptyAllIgnored}
                        actionLabel={copy.reviewIgnoredWorkspaces}
                        onAction={() => setActiveView('hidden')}
                      />
                    ) : null}
                    {!loading && scan && activeRows.length === 0 && visibleCandidates.length > 0 ? (
                      <EmptyState title={copy.emptySet} />
                    ) : null}
                    {activeRows.map((candidate, index) => (
                      <CandidateRow
                        copy={copy}
                        key={candidate.worktreeId}
                        candidate={candidate}
                        last={index === activeRows.length - 1}
                        selected={selectedIds.has(candidate.worktreeId)}
                        failure={rowFailures[candidate.worktreeId]}
                        onToggleSelected={(id) =>
                          setSelectedIds((current) => toggleSetMember(current, id))
                        }
                        onView={closeAndView}
                        onIgnore={ignoreCandidate}
                        onRemove={(candidate) => {
                          setSelectedIds(new Set([candidate.worktreeId]))
                          setConfirming(true)
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        ) : (
            <ConfirmRemove
              copy={copy}
            candidates={selectedCandidates}
            removing={removing}
            onCancel={() => setConfirming(false)}
            onConfirm={() => void confirmRemove()}
          />
        )}
      </DialogContent>
    </Dialog>
  )

  function closeAndView(candidate: WorkspaceCleanupCandidate): void {
    markCandidateViewed(candidate)
    closeModal()
    activateAndRevealWorktree(candidate.worktreeId)
  }
}

function StatusPill({
  children,
  tone = 'neutral'
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'ready' | 'review' | 'destructive'
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium',
        tone === 'neutral' && 'border-border bg-background text-muted-foreground',
        tone === 'ready' && 'border-border text-[var(--git-decoration-added)]',
        tone === 'review' && 'border-border text-[var(--git-decoration-modified)]',
        tone === 'destructive' && 'border-destructive/30 text-destructive'
      )}
    >
      {children}
    </span>
  )
}

function CleanupViewNav({
  activeView,
  counts,
  onViewChange,
  copy
}: {
  activeView: CleanupView
  counts: Record<CleanupView, number>
  onViewChange: (view: CleanupView) => void
  copy: WorkspaceCleanupCopy
}): React.JSX.Element {
  const items: { view: CleanupView; label: string }[] = [
    { view: 'ready', label: copy.suggested },
    { view: 'review', label: copy.needsReview },
    { view: 'protected', label: copy.notSuggestedNav },
    { view: 'hidden', label: copy.ignored }
  ]

  return (
    <aside className="border-t border-border bg-background md:border-t-0">
      <div className="space-y-1 p-2">
        {items.map((item) => (
          <button
            key={item.view}
            type="button"
            className={cn(
              'flex h-8 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              activeView === item.view && 'bg-accent text-accent-foreground'
            )}
            onClick={() => onViewChange(item.view)}
          >
            <span className="truncate">{item.label}</span>
            <span className="tabular-nums text-muted-foreground">{counts[item.view]}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}

function CandidateRow({
  copy,
  candidate,
  last,
  selected,
  failure,
  onToggleSelected,
  onView,
  onIgnore,
  onRemove
}: {
  copy: WorkspaceCleanupCopy
  candidate: WorkspaceCleanupCandidate
  last: boolean
  selected: boolean
  failure?: string
  onToggleSelected: (worktreeId: string) => void
  onView: (candidate: WorkspaceCleanupCandidate) => void
  onIgnore: (candidate: WorkspaceCleanupCandidate) => void
  onRemove: (candidate: WorkspaceCleanupCandidate) => void
}): React.JSX.Element {
  const selectable = canQueueWorkspaceCleanupCandidate(candidate)
  const ignored = candidate.blockers.includes('dismissed')
  const blockers = candidate.blockers.map((blocker) => copy.blockers[blocker])
  const contextDetails = formatContextDetails(candidate, copy)
  const branchSafetyDetails = formatBranchSafetyDetails(candidate, copy)
  const status = getCandidateStatus(candidate, copy)

  return (
    <div
      className={cn(
        'group w-full border-b border-border/60 px-3 py-3 text-left text-foreground transition-colors hover:bg-accent/40',
        last && 'border-b-0'
      )}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5 gap-y-1 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        {selectable ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={copy.selectWorkspace(candidate.displayName)}
            onClick={() => onToggleSelected(candidate.worktreeId)}
            className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-border bg-background text-primary hover:bg-accent"
          >
            {selected ? <Check className="size-3" strokeWidth={3} /> : null}
          </button>
        ) : (
          <div className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="min-w-0 truncate text-sm font-medium">{candidate.displayName}</span>
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
            <span className="text-xs text-muted-foreground">
              {copy.lastActive(formatRelativeTime(candidate.lastActivityAt, copy))}
            </span>
            {blockers.length > 0 ? (
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                {blockers.slice(0, 2).join(', ')}
              </span>
            ) : null}
          </div>
          <div className="mt-1 min-w-0 truncate font-mono text-[11px] text-muted-foreground">
            {candidate.path}
          </div>
          <div className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="min-w-0 truncate">{copy.repo(candidate.repoName)}</span>
            <span className="min-w-0 truncate font-mono">{copy.branch(candidate.branch)}</span>
            <span>{formatGitStatus(candidate, copy)}</span>
            {branchSafetyDetails.slice(0, 1).map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
            {contextDetails ? <span className="min-w-0 truncate">{contextDetails}</span> : null}
          </div>
          {failure ? (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5" />
              {failure}
            </div>
          ) : null}
        </div>
        <div className="col-start-2 flex flex-wrap items-center gap-0.5 md:col-start-auto md:justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={copy.viewWorkspace(candidate.displayName)}
                onClick={() => onView(candidate)}
              >
                <Search className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>
              {copy.view}
            </TooltipContent>
          </Tooltip>
          {!ignored ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={copy.ignoreWorkspace(candidate.displayName)}
                  onClick={() => onIgnore(candidate)}
                >
                  <EyeOff className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                {copy.ignore}
              </TooltipContent>
            </Tooltip>
          ) : null}
          {selectable ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={copy.removeWorkspace(candidate.displayName)}
                  className="text-destructive hover:text-destructive"
                  onClick={() => onRemove(candidate)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                {copy.remove}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function getCandidateStatus(
  candidate: WorkspaceCleanupCandidate,
  copy: WorkspaceCleanupCopy
): {
  label: string
  tone: 'neutral' | 'ready' | 'review' | 'destructive'
} {
  if (candidate.blockers.includes('dismissed')) {
    return { label: copy.status.ignored, tone: 'neutral' }
  }
  if (candidate.tier === 'ready') {
    return {
      label: candidate.reasons.includes('archived') ? copy.status.archived : copy.status.clean,
      tone: 'ready'
    }
  }
  if (candidate.blockers.length > 0) {
    return { label: copy.blockers[candidate.blockers[0]], tone: 'neutral' }
  }
  if (candidate.git.upstreamAhead && candidate.git.upstreamAhead > 0) {
    return { label: copy.status.unpushedCommits, tone: 'review' }
  }
  if (candidate.git.clean === false) {
    return { label: copy.status.dirty, tone: 'review' }
  }
  if (candidate.tier === 'review') {
    return { label: copy.status.review, tone: 'review' }
  }
  return { label: copy.status.notSuggested, tone: 'neutral' }
}

function formatGitStatus(candidate: WorkspaceCleanupCandidate, copy: WorkspaceCleanupCopy): string {
  if (candidate.git.clean === true) {
    return copy.git.clean
  }
  if (candidate.git.clean === false) {
    return copy.git.dirty
  }
  return copy.git.unknown
}

function formatBranchSafetyDetails(
  candidate: WorkspaceCleanupCandidate,
  copy: WorkspaceCleanupCopy
): string[] {
  const details: string[] = []
  if (candidate.git.upstreamAhead !== null) {
    details.push(
      candidate.git.upstreamAhead === 0
        ? copy.git.noUnpushedCommits
        : copy.git.unpushedCommits(candidate.git.upstreamAhead)
    )
  }
  return details
}

function formatContextDetails(
  candidate: WorkspaceCleanupCandidate,
  copy: WorkspaceCleanupCopy
): string | null {
  const parts: string[] = []
  if (candidate.localContext.terminalTabCount > 0) {
    parts.push(copy.localContext.terminalTabs(candidate.localContext.terminalTabCount))
  }
  if (candidate.localContext.cleanEditorTabCount > 0) {
    parts.push(copy.localContext.editorTabs(candidate.localContext.cleanEditorTabCount))
  }
  if (candidate.localContext.browserTabCount > 0) {
    parts.push(copy.localContext.browserTabs(candidate.localContext.browserTabCount))
  }
  if (candidate.localContext.diffCommentCount > 0) {
    parts.push(copy.localContext.diffNotes(candidate.localContext.diffCommentCount))
  }
  if (candidate.localContext.retainedDoneAgentCount > 0) {
    parts.push(copy.localContext.completedAgents(candidate.localContext.retainedDoneAgentCount))
  }
  return parts.length > 0 ? parts.join(', ') : null
}

function ConfirmRemove({
  copy,
  candidates,
  removing,
  onCancel,
  onConfirm
}: {
  copy: WorkspaceCleanupCopy
  candidates: WorkspaceCleanupCandidate[]
  removing: boolean
  onCancel: () => void
  onConfirm: () => void
}): React.JSX.Element {
  const count = candidates.length
  return (
    <>
      <DialogHeader className="border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/25 bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-base">
              {copy.confirmTitle(count)}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-xs leading-5">
              {copy.confirmDescription}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            {copy.toDelete(count)}
          </div>
          <div className="text-xs text-muted-foreground">{copy.sortedByOldestActivity}</div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          {candidates.map((candidate, index) => (
            <ConfirmRemoveRow
              copy={copy}
              key={candidate.worktreeId}
              candidate={candidate}
              last={index === candidates.length - 1}
            />
          ))}
        </ScrollArea>
      </div>
      <DialogFooter className="border-t border-border px-5 py-3">
        <Button variant="outline" onClick={onCancel} disabled={removing}>
          {copy.cancel}
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={removing || count === 0}>
          {removing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          {copy.deleteCount(count)}
        </Button>
      </DialogFooter>
    </>
  )
}

function ConfirmRemoveRow({
  copy,
  candidate,
  last
}: {
  copy: WorkspaceCleanupCopy
  candidate: WorkspaceCleanupCandidate
  last: boolean
}): React.JSX.Element {
  const dirtyLabel = getDirtyGitLabel(candidate, copy)
  const branchDiffersFromName = candidate.branch !== candidate.displayName
  return (
    <div className={cn('border-b border-border/60 px-5 py-2.5', last && 'border-b-0')}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="min-w-0 truncate text-sm font-medium">{candidate.displayName}</span>
        <span className="text-xs text-muted-foreground">
          {copy.lastActive(formatRelativeTime(candidate.lastActivityAt, copy))}
        </span>
        {dirtyLabel ? <StatusPill tone="destructive">{dirtyLabel}</StatusPill> : null}
      </div>
      <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{candidate.repoName}</span>
        {branchDiffersFromName ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="min-w-0 truncate font-mono">{candidate.branch}</span>
          </>
        ) : null}
      </div>
      <div className="mt-0.5 min-w-0 truncate font-mono text-[11px] text-muted-foreground/80">
        {candidate.path}
      </div>
    </div>
  )
}

function getDirtyGitLabel(
  candidate: WorkspaceCleanupCandidate,
  copy: WorkspaceCleanupCopy
): string | null {
  if (candidate.git.upstreamAhead && candidate.git.upstreamAhead > 0) {
    return copy.git.unpushedCommits(candidate.git.upstreamAhead)
  }
  if (candidate.git.clean === false) {
    return copy.git.uncommittedChanges
  }
  if (candidate.git.clean == null) {
    return copy.git.statusUnknown
  }
  return null
}

function SkeletonRows(): React.JSX.Element {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-lg border border-border bg-muted/35"
        />
      ))}
    </div>
  )
}

function EmptyState({
  title,
  actionLabel,
  onAction
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
}): React.JSX.Element {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-muted/20 text-sm text-muted-foreground">
      <span>{title}</span>
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

function toggleSetMember(current: Set<string>, value: string): Set<string> {
  const next = new Set(current)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  return next
}
