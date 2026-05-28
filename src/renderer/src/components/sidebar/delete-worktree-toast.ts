export type DeleteWorktreeToastCopy = {
  title: string
  description?: string
  isDestructive: boolean
}

export function getDeleteWorktreeToastCopy(
  worktreeName: string,
  canForceDelete: boolean,
  error: string,
  copy: {
    deleteFailed: string
    deleteChangedFilesHint: string
  }
): DeleteWorktreeToastCopy {
  if (canForceDelete) {
    return {
      title: `${copy.deleteFailed}: ${worktreeName}`,
      description: copy.deleteChangedFilesHint,
      // Why: git commonly refuses the first delete when the worktree still has
      // modified or untracked files. Showing raw stderr in a destructive toast
      // made a normal cleanup step look like an Orca bug, so this common case
      // gets a concise explanation plus the force-delete path instead.
      isDestructive: false
    }
  }

  return {
    title: `${copy.deleteFailed}: ${worktreeName}`,
    description: error,
    isDestructive: true
  }
}
