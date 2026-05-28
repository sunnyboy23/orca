import { describe, expect, it } from 'vitest'
import { getDeleteWorktreeToastCopy } from './delete-worktree-toast'
import { enMessages } from '@/i18n'

const copy = enMessages.workspace.menu

describe('getDeleteWorktreeToastCopy', () => {
  it('uses direct guidance when force delete is available', () => {
    expect(getDeleteWorktreeToastCopy('feature/foo', true, 'branch has changes', copy)).toEqual({
      title: `${copy.deleteFailed}: feature/foo`,
      description: copy.deleteChangedFilesHint,
      isDestructive: false
    })
  })

  it('uses orphaned-directory guidance when Git tracking is already gone', () => {
    expect(
      getDeleteWorktreeToastCopy(
        'feature/foo',
        true,
        'Worktree is no longer registered with Git but its directory remains.',
        copy
      )
    ).toEqual({
      title: 'Failed to delete workspace feature/foo',
      description: copy.deleteOrphanedDirectoryHint,
      isDestructive: false
    })
  })

  it('preserves the raw error when force delete is unavailable', () => {
    expect(getDeleteWorktreeToastCopy('feature/foo', false, 'permission denied', copy)).toEqual({
      title: `${copy.deleteFailed}: feature/foo`,
      description: 'permission denied',
      isDestructive: true
    })
  })
})
