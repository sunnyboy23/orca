import React from 'react'
import { Ellipsis, ListCollapse, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { WorktreeOpenInMenuItems } from '@/components/sidebar/WorktreeOpenInMenu'

const COPY = {
  collapseAll: '全部收起',
  refreshExplorer: '刷新文件浏览器',
  moreExplorerActions: '更多文件浏览器操作',
  showGitIgnoredFiles: '显示 Git 忽略文件',
  openInPrefix: '用 '
} as const

type FileExplorerToolbarProps = {
  repoName: string
  worktreePath: string
  connectionId?: string | null
  refresh: {
    isRefreshing: boolean
    showRefreshSpinner: boolean
    handleRefresh: () => void
  }
  canCollapseAll: boolean
  onCollapseAll: () => void
  showGitIgnoredFilesToggle: boolean
  showGitIgnoredFiles: boolean
  onToggleGitIgnoredFiles: () => void
}

export function FileExplorerToolbar({
  repoName,
  worktreePath,
  connectionId,
  refresh,
  canCollapseAll,
  onCollapseAll,
  showGitIgnoredFilesToggle,
  showGitIgnoredFiles,
  onToggleGitIgnoredFiles
}: FileExplorerToolbarProps): React.JSX.Element {
  return (
    <div className="flex h-8 min-h-8 items-center gap-2 border-b border-border px-2">
      <span
        className="min-w-0 flex-1 truncate text-xs font-medium text-foreground"
        title={repoName}
      >
        {repoName}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
            aria-label={COPY.collapseAll}
            disabled={!canCollapseAll}
            onClick={onCollapseAll}
          >
            <ListCollapse className="size-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {COPY.collapseAll}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
            aria-label={COPY.refreshExplorer}
            disabled={refresh.isRefreshing}
            onClick={refresh.handleRefresh}
          >
            {refresh.showRefreshSpinner ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RefreshCw className="size-3" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          {COPY.refreshExplorer}
        </TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                aria-label={COPY.moreExplorerActions}
              >
                <Ellipsis className="size-3" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>
            {COPY.moreExplorerActions}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          {showGitIgnoredFilesToggle ? (
            <DropdownMenuCheckboxItem
              checked={showGitIgnoredFiles}
              onCheckedChange={onToggleGitIgnoredFiles}
            >
              {COPY.showGitIgnoredFiles}
            </DropdownMenuCheckboxItem>
          ) : null}
          {showGitIgnoredFilesToggle ? <DropdownMenuSeparator /> : null}
          <WorktreeOpenInMenuItems
            worktreePath={worktreePath}
            connectionId={connectionId}
            labelPrefix={COPY.openInPrefix}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
