import type { Repo } from '../../../../shared/types'
import { isFolderRepo } from '../../../../shared/repo-kind'
import type { SettingsSearchEntry } from './settings-search'

export function getRepositoryPaneSearchEntries(repo: Repo): SettingsSearchEntry[] {
  const isFolder = isFolderRepo(repo)
  return [
    {
      title: '显示名称',
      description: '设置项目在侧边栏和标签页中的显示名称。',
      keywords: [repo.displayName, repo.path, 'project name', 'repository name', '显示名称']
    },
    {
      title: '项目图标',
      description: '设置项目在侧边栏和标签页中的图标和颜色。',
      keywords: [
        repo.displayName,
        'project icon',
        'repository icon',
        'color',
        'badge',
        'emoji',
        'favicon',
        '图标'
      ]
    },
    ...(isFolder
      ? []
      : [
          {
            title: '默认 Worktree 基线',
            description: '创建 worktree 时默认使用的基线分支或 ref。',
            keywords: [repo.displayName, 'base ref', 'branch', '基线', '分支']
          },
          {
            title: '稀疏检出预设',
            description: '用于创建 sparse worktree 的已保存目录集合。',
            keywords: [
              repo.displayName,
              'sparse',
              'checkout',
              'preset',
              'presets',
              'directory',
              'directories',
              'monorepo',
              '稀疏检出'
            ]
          }
        ]),
    {
      title: '移除项目',
      description: '把这个项目从 Orca 中移除。',
      keywords: [repo.displayName, 'delete', 'project', 'repository', '移除', '删除']
    },
    ...(isFolder
      ? []
      : [
          {
            title: 'Source Control AI',
            description: '项目级的 Source Control AI 生成覆盖项。',
            keywords: [
              repo.displayName,
              'source control',
              'ai',
              'commit message',
              'pull request',
              'pr',
              'branch name',
              'rename',
              'model',
              'prompt',
              'instructions'
            ]
          },
          {
            title: 'Worktree 符号链接',
            description: '把主检出中的指定路径软链接到新建 worktree。',
            keywords: [
              repo.displayName,
              'symlink',
              'symlinks',
              'worktree',
              'link',
              'shared',
              'env',
              'node_modules'
            ]
          },
          {
            title: 'MCP 配置',
            description: '查看项目级 MCP 服务配置文件。',
            keywords: [
              repo.displayName,
              'mcp',
              'model context protocol',
              '.mcp.json',
              '.cursor/mcp.json',
              '.claude.json',
              '.claude/mcp.json'
            ]
          },
          {
            title: '初始化脚本',
            description: '新建 worktree 后运行的本地或共享脚本。',
            keywords: [
              repo.displayName,
              'hooks',
              'setup',
              'setup script',
              'setup command',
              'local settings scripts',
              'orca.yaml hooks',
              'yaml'
            ]
          },
          {
            title: '归档脚本',
            description: '归档 worktree 前运行的本地或共享脚本。',
            keywords: [
              repo.displayName,
              'hooks',
              'archive',
              'archive script',
              'archive command',
              'local settings scripts',
              'orca.yaml hooks',
              'yaml'
            ]
          },
          {
            title: '高级设置',
            description: '命令来源和 orca.yaml 细节。',
            keywords: [
              repo.displayName,
              'advanced',
              'command source',
              'local',
              'orca.yaml',
              'shared',
              'both',
              'source',
              'authoritative'
            ]
          },
          {
            title: '何时运行初始化',
            description: '当存在初始化脚本时，选择默认执行策略。',
            keywords: [
              repo.displayName,
              'setup run policy',
              'ask',
              'run by default',
              'skip by default'
            ]
          },
          {
            title: '自定义 GitHub Issue 命令',
            description:
              '通过 orca.yaml 配置、并可由本地覆盖的文件型 linked-issue 命令。',
            keywords: [
              repo.displayName,
              'github issue command',
              'issue command',
              'workflow',
              'github',
              'orca.yaml',
              '.orca/issue-command'
            ]
          }
        ])
  ]
}
