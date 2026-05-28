import { normalize } from 'node:path'
import type { Repo, Worktree } from '../../../shared/types'
import type { LocalRepoBinding, TeamConfig } from './schema'

type TeamConfigRepoView = Pick<Repo, 'id' | 'path' | 'displayName' | 'connectionId'>
type TeamConfigWorktreeView = Pick<Worktree, 'id' | 'path' | 'repoId'>

export type RepoResolutionInput = {
  repoName: string
  teamConfig: TeamConfig
  localBindings: LocalRepoBinding[]
  repos: TeamConfigRepoView[]
  worktrees?: TeamConfigWorktreeView[]
}

export type RepoResolutionResult =
  | {
      ok: true
      repoName: string
      repoId: string
      repoPath: string
      worktreeId?: string
      worktreePath?: string
      connectionId?: string | null
      source: 'binding' | 'orca-repo'
    }
  | {
      ok: false
      repoName: string
      reason: 'unknown_repo' | 'missing_binding' | 'path_conflict' | 'repo_not_registered'
      message: string
      candidates?: string[]
    }

export function resolveRepoName(input: RepoResolutionInput): RepoResolutionResult {
  const teamRepo = input.teamConfig.repos.find((repo) => repo.repoName === input.repoName)
  if (!teamRepo) {
    return {
      ok: false,
      repoName: input.repoName,
      reason: 'unknown_repo',
      message: `Unknown team repo: ${input.repoName}`
    }
  }

  const binding = input.localBindings.find((item) => item.repoName === input.repoName)
  if (binding) {
    return resolveBinding(input, binding)
  }

  const byDisplayName = input.repos.filter((repo) => repo.displayName === input.repoName)
  if (byDisplayName.length === 1) {
    return toResolvedRepo(input.repoName, byDisplayName[0], undefined, 'orca-repo')
  }

  return {
    ok: false,
    repoName: input.repoName,
    reason: 'missing_binding',
    message: `Missing local binding for repo_name: ${input.repoName}`,
    candidates: byDisplayName.map((repo) => repo.path)
  }
}

function resolveBinding(
  input: RepoResolutionInput,
  binding: LocalRepoBinding
): RepoResolutionResult {
  const boundPath = normalizePath(binding.localPath)
  const matchingRepos = input.repos.filter((repo) => normalizePath(repo.path) === boundPath)
  if (matchingRepos.length > 1) {
    return {
      ok: false,
      repoName: input.repoName,
      reason: 'path_conflict',
      message: `Multiple Orca repos match local binding for ${input.repoName}`,
      candidates: matchingRepos.map((repo) => repo.id)
    }
  }
  if (matchingRepos.length === 0) {
    return {
      ok: false,
      repoName: input.repoName,
      reason: 'repo_not_registered',
      message: `Local binding path is not registered in Orca: ${binding.localPath}`,
      candidates: [binding.localPath]
    }
  }

  const repo = matchingRepos[0]
  const worktree = resolveBoundWorktree(input.worktrees ?? [], repo.id, binding.worktreePath)
  return toResolvedRepo(input.repoName, repo, worktree, 'binding', binding.connectionId)
}

function resolveBoundWorktree(
  worktrees: TeamConfigWorktreeView[],
  repoId: string,
  worktreePath?: string
): TeamConfigWorktreeView | undefined {
  if (!worktreePath) {
    return undefined
  }
  const normalized = normalizePath(worktreePath)
  return worktrees.find(
    (worktree) => worktree.repoId === repoId && normalizePath(worktree.path) === normalized
  )
}

function toResolvedRepo(
  repoName: string,
  repo: TeamConfigRepoView,
  worktree: TeamConfigWorktreeView | undefined,
  source: 'binding' | 'orca-repo',
  connectionId?: string | null
): RepoResolutionResult {
  return {
    ok: true,
    repoName,
    repoId: repo.id,
    repoPath: repo.path,
    worktreeId: worktree?.id,
    worktreePath: worktree?.path,
    connectionId: connectionId ?? repo.connectionId ?? null,
    source
  }
}

function normalizePath(path: string): string {
  return normalize(path)
}
