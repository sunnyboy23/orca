import type { GitMessages } from './settings-panes-types'

export const gitZhCN: GitMessages = {
  branchPrefix: {
    title: '分支名前缀',
    description: '创建 worktree 时添加到分支名开头的前缀。',
    keywords: ['branch naming', 'git username', 'custom', '分支', '前缀', '用户名'],
    options: {
      gitUsername: 'Git 用户名',
      custom: '自定义',
      none: '无'
    },
    noGitUsername: '还没有配置 Git 用户名',
    customPlaceholder: '例如 feature'
  },
  refreshLocalBaseRef: {
    title: '刷新本地基准分支',
    description: '创建 worktree 时可选择快进本地 main 或 master。',
    rowDescription:
      '开启后，Orca 会在创建 worktree 前更新本地 main 或 master，让 AI 工具和 diff 能基于最新基准分支比较。Orca 只会在安全时执行。',
    keywords: ['main', 'master', 'origin/main', 'git diff', 'base ref', 'worktree', '基准', '分支']
  },
  githubApiBudget: {
    title: 'GitHub API 额度',
    description: '当前 GitHub CLI 的 REST、Search 和 GraphQL 速率限制。',
    keywords: ['github', 'gh', 'graphql', 'rate limit', 'api budget', '额度', '限制']
  },
  attribution: {
    title: 'Orca 署名',
    description: '在 commit、PR 和 issue 中加入 Orca 署名。',
    keywords: ['github', 'gh', 'pr', 'issue', 'co-author', 'coauthored', 'attribution', 'orca', '署名']
  }
}
