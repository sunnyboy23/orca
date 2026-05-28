import type { GitMessages } from './settings-panes-types'

export const gitEn: GitMessages = {
  branchPrefix: {
    title: 'Branch Prefix',
    description: 'Prefix added to branch names when creating worktrees.',
    keywords: ['branch naming', 'git username', 'custom'],
    options: {
      gitUsername: 'Git Username',
      custom: 'Custom',
      none: 'None'
    },
    noGitUsername: 'No git username configured',
    customPlaceholder: 'e.g. feature'
  },
  refreshLocalBaseRef: {
    title: 'Refresh Local Base Ref',
    description: 'Optionally fast-forward local main or master when creating worktrees.',
    rowDescription:
      'When enabled, Orca updates your local main or master before creating a worktree. This helps AI tools and diffs compare your branch against the latest base branch. Orca only does this when it is safe.',
    keywords: ['main', 'master', 'origin/main', 'git diff', 'base ref', 'worktree']
  },
  githubApiBudget: {
    title: 'GitHub API Budget',
    description: 'Current GitHub CLI REST, Search, and GraphQL rate limits.',
    keywords: ['github', 'gh', 'graphql', 'rate limit', 'api budget']
  },
  attribution: {
    title: 'Orca Attribution',
    description: 'Add Orca attribution to commits, PRs, and issues.',
    keywords: ['github', 'gh', 'pr', 'issue', 'co-author', 'coauthored', 'attribution', 'orca']
  }
}
