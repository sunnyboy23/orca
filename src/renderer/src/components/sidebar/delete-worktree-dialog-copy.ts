import { isFolderRepo } from '../../../../shared/repo-kind'
import type { Repo, Worktree } from '../../../../shared/types'
import type { I18nMessages } from '@/i18n'

type WorktreeRepoRef = Pick<Worktree, 'repoId'>

export function isFolderWorkspaceDelete(
  repoMap: ReadonlyMap<string, Repo>,
  worktree: WorktreeRepoRef | null | undefined
): boolean {
  if (!worktree) {
    return false
  }
  const repo = repoMap.get(worktree.repoId)
  return repo ? isFolderRepo(repo) : false
}

export function countFolderWorkspaceDeletes(
  repoMap: ReadonlyMap<string, Repo>,
  worktrees: readonly WorktreeRepoRef[]
): number {
  return worktrees.filter((item) => isFolderWorkspaceDelete(repoMap, item)).length
}

export function getDeleteWorktreeDialogCopy(args: {
  copy: I18nMessages['workspace']['delete']
  isBatchDelete: boolean
  worktree: Pick<Worktree, 'displayName'> | null
  worktreeCount: number
  folderWorkspaceDeleteCount: number
  isFolderWorkspaceDelete: boolean
}): {
  targetLabel: string | undefined
  targetClassName: string
  descriptionSuffix: string
  mainWorktreeBlocker: string
} {
  const allFolderWorkspaceDeletes =
    args.isBatchDelete &&
    args.worktreeCount > 0 &&
    args.folderWorkspaceDeleteCount === args.worktreeCount
  const mixedFolderWorkspaceDeletes =
    args.isBatchDelete &&
    args.folderWorkspaceDeleteCount > 0 &&
    args.folderWorkspaceDeleteCount < args.worktreeCount
  const copy = args.copy
  return {
    targetLabel: args.isBatchDelete
      ? copy.targets(args.worktreeCount)
      : args.worktree?.displayName,
    targetClassName: args.isBatchDelete
      ? 'font-medium text-foreground'
      : 'break-all font-medium text-foreground',
    descriptionSuffix: args.isBatchDelete
      ? allFolderWorkspaceDeletes
        ? copy.suffix.batchFolder
        : mixedFolderWorkspaceDeletes
          ? copy.suffix.batchMixed
          : copy.suffix.batchGit
      : args.isFolderWorkspaceDelete
        ? copy.suffix.folder
        : copy.suffix.git,
    mainWorktreeBlocker: args.isFolderWorkspaceDelete
      ? copy.mainWorktreeBlocker.folder
      : copy.mainWorktreeBlocker.git
  }
}
