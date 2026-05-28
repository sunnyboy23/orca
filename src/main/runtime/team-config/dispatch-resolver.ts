import type { Repo, Worktree } from '../../../shared/types'
import { resolveRepoName, type RepoResolutionResult } from './path-resolver'
import type { LocalRepoBinding, TeamConfig } from './schema'

export type DispatchTargetResolution =
  | {
      ok: true
      repoName: string
      repoId: string
      repoPath: string
      worktreeSelector?: string
      worktreePath?: string
      connectionId?: string | null
    }
  | {
      ok: false
      repoName: string
      reason: string
      message: string
      candidates?: string[]
    }

export type DispatchTargetResolver = {
  resolve(repoName: string): Promise<DispatchTargetResolution>
}

export type StaticDispatchTargetResolverOptions = {
  teamConfig: TeamConfig
  localBindings: LocalRepoBinding[]
  repos: Pick<Repo, 'id' | 'path' | 'displayName' | 'connectionId'>[]
  worktrees?: Pick<Worktree, 'id' | 'path' | 'repoId'>[]
}

export function createStaticDispatchTargetResolver(
  options: StaticDispatchTargetResolverOptions
): DispatchTargetResolver {
  return {
    async resolve(repoName: string): Promise<DispatchTargetResolution> {
      return toDispatchTargetResolution(
        resolveRepoName({
          repoName,
          teamConfig: options.teamConfig,
          localBindings: options.localBindings,
          repos: options.repos,
          worktrees: options.worktrees
        })
      )
    }
  }
}

function toDispatchTargetResolution(result: RepoResolutionResult): DispatchTargetResolution {
  if (!result.ok) {
    return {
      ok: false,
      repoName: result.repoName,
      reason: result.reason,
      message: result.message,
      candidates: result.candidates
    }
  }

  return {
    ok: true,
    repoName: result.repoName,
    repoId: result.repoId,
    repoPath: result.repoPath,
    worktreeSelector: result.worktreeId ?? result.repoId,
    worktreePath: result.worktreePath,
    connectionId: result.connectionId
  }
}
