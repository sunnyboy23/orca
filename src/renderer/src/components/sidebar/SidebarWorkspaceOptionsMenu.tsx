import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { WorktreeCardProperty } from '../../../../shared/types'
import { DEFAULT_SHOW_SLEEPING_WORKSPACES } from '../../../../shared/constants'
import SidebarRepositoryFilterSection from './SidebarRepositoryFilterSection'
import SidebarWorkspaceFilterSection from './SidebarWorkspaceFilterSection'
import { useI18n } from '@/i18n'

type SidebarWorkspaceOptionsMenuProps = {
  preserveWorkspaceBoardOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

const PROPERTY_OPTION_IDS: WorktreeCardProperty[] = [
  'issue',
  'linear-issue',
  'pr',
  'comment',
  'ports',
  // Why: toggles the inline "Agent activity" list rendered below each
  // workspace card body (see WorktreeCard -> WorktreeCardAgents). Off hides
  // the list; there is no alternate surface.
  'inline-agents'
]

const SORT_OPTIONS = [
  { id: 'name', descriptionKey: null },
  { id: 'smart', descriptionKey: 'smartDescription' },
  { id: 'recent', descriptionKey: null },
  { id: 'repo', descriptionKey: null },
  { id: 'manual', descriptionKey: 'manualDescription' }
] as const

const SidebarWorkspaceOptionsMenu = React.memo(function SidebarWorkspaceOptionsMenu({
  preserveWorkspaceBoardOpen = false,
  onMenuOpenChange
}: SidebarWorkspaceOptionsMenuProps) {
  const showSleepingWorkspaces = useAppStore((s) => s.showSleepingWorkspaces)
  const hideDefaultBranchWorkspace = useAppStore((s) => s.hideDefaultBranchWorkspace)
  const filterRepoIds = useAppStore((s) => s.filterRepoIds)
  const repos = useAppStore((s) => s.repos)
  const worktreeCardProperties = useAppStore((s) => s.worktreeCardProperties)
  const toggleWorktreeCardProperty = useAppStore((s) => s.toggleWorktreeCardProperty)
  const sortBy = useAppStore((s) => s.sortBy)
  const setSortBy = useAppStore((s) => s.setSortBy)
  const groupBy = useAppStore((s) => s.groupBy)
  const setGroupBy = useAppStore((s) => s.setGroupBy)
  const { messages } = useI18n()
  const copy = messages.workspace.menu

  const [open, setOpen] = useState(false)
  const groupByOptions = useMemo(
    () => [
      { id: 'none', label: copy.groupOptions.none },
      { id: 'workspace-status', label: copy.groupOptions.status },
      { id: 'pr-status', label: copy.groupOptions.pr },
      { id: 'repo', label: copy.groupOptions.project }
    ],
    [copy]
  )
  const propertyLabels = useMemo<Record<WorktreeCardProperty, string>>(
    () => ({
      issue: copy.properties.issue,
      'linear-issue': copy.properties.linearIssue,
      pr: copy.properties.pr,
      ci: copy.properties.ci,
      status: copy.properties.status,
      unread: copy.properties.unread,
      comment: copy.properties.comment,
      ports: copy.properties.ports,
      'inline-agents': copy.properties.inlineAgents
    }),
    [copy]
  )

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      onMenuOpenChange?.(next)
    },
    [onMenuOpenChange]
  )

  useEffect(() => {
    return () => {
      onMenuOpenChange?.(false)
    }
  }, [onMenuOpenChange])

  // Why: derive from current repos so stale ids (e.g. lingering after a repo
  // is removed) don't inflate counts or falsely signal an applied filter.
  const selectedCount = useMemo(() => {
    let count = 0
    for (const repo of repos) {
      if (filterRepoIds.includes(repo.id)) {
        count += 1
      }
    }
    return count
  }, [repos, filterRepoIds])
  const hasRepoFilter = selectedCount > 0
  const hasSleepingFilter = showSleepingWorkspaces !== DEFAULT_SHOW_SLEEPING_WORKSPACES
  const hasAnyFilter = hasSleepingFilter || hideDefaultBranchWorkspace || hasRepoFilter
  const activeFilterCount =
    (hasSleepingFilter ? 1 : 0) + (hideDefaultBranchWorkspace ? 1 : 0) + selectedCount
  const activeFilterLabel = copy.activeFilters(activeFilterCount)
  const sortOption = SORT_OPTIONS.find((opt) => opt.id === sortBy)
  const sortLabel = sortOption ? copy.sortOptions[sortOption.id] : copy.sortFallback
  const visiblePropertyCount = PROPERTY_OPTION_IDS.filter((id) =>
    worktreeCardProperties.includes(id)
  ).length

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              className="relative text-muted-foreground"
              aria-label={
                hasAnyFilter
                  ? copy.workspaceOptionsWithFilters(activeFilterLabel)
                  : copy.workspaceOptions
              }
              data-workspace-board-preserve-open={preserveWorkspaceBoardOpen ? '' : undefined}
            >
              <SlidersHorizontal className="size-3.5" strokeWidth={2.25} />
              {hasAnyFilter && (
                // Why: this combined options button now owns filtering, so it
                // needs the same at-a-glance signal that the old filter button had.
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-medium leading-none text-primary-foreground"
                >
                  {activeFilterCount > 9 ? '9+' : activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          {hasAnyFilter ? copy.workspaceOptionsWithFilters(activeFilterLabel) : copy.workspaceOptions}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-72 pb-2"
        data-workspace-board-preserve-open={preserveWorkspaceBoardOpen ? '' : undefined}
      >
        <DropdownMenuLabel>{copy.groupBy}</DropdownMenuLabel>
        <div className="px-2 pt-0.5 pb-1">
          <ToggleGroup
            type="single"
            value={groupBy}
            onValueChange={(v) => {
              if (v) {
                setGroupBy(v as typeof groupBy)
              }
            }}
            variant="outline"
            size="sm"
            className="h-6 w-full justify-stretch"
          >
            {groupByOptions.map((opt) => (
              <ToggleGroupItem
                key={opt.id}
                value={opt.id}
                className="h-6 grow basis-0 px-1 text-[10px] data-[state=on]:bg-foreground/10 data-[state=on]:font-semibold data-[state=on]:text-foreground"
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex flex-1 items-center justify-between">
              <span>{copy.sortBy}</span>
              <span className="text-[11px] font-medium text-muted-foreground">{sortLabel}</span>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            className="w-44"
            data-workspace-board-preserve-open={preserveWorkspaceBoardOpen ? '' : undefined}
          >
            <DropdownMenuRadioGroup
              value={sortBy}
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              {SORT_OPTIONS.map((opt) => {
                const radioItem = (
                  <DropdownMenuRadioItem
                    key={opt.id}
                    value={opt.id}
                    // Keep the menu open so people can compare sort modes and
                    // toggle card properties without reopening the same panel.
                    onSelect={(e) => e.preventDefault()}
                  >
                      {copy.sortOptions[opt.id]}
                  </DropdownMenuRadioItem>
                )
                if (!opt.descriptionKey) {
                  return radioItem
                }
                return (
                  <Tooltip key={opt.id}>
                    <TooltipTrigger asChild>{radioItem}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={6}>
                      {copy.sortOptions[opt.descriptionKey]}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <SidebarWorkspaceFilterSection />

        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex flex-1 items-center justify-between">
              <span>{copy.showProperties}</span>
              {visiblePropertyCount > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground">
                  {visiblePropertyCount}
                </span>
              )}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            className="w-48"
            data-workspace-board-preserve-open={preserveWorkspaceBoardOpen ? '' : undefined}
          >
            {PROPERTY_OPTION_IDS.map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={worktreeCardProperties.includes(id)}
                onCheckedChange={() => toggleWorktreeCardProperty(id)}
                onSelect={(e) => e.preventDefault()}
              >
                {propertyLabels[id]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <SidebarRepositoryFilterSection />
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

export default SidebarWorkspaceOptionsMenu
