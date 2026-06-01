import { useState } from 'react'
import type { OrcaHooks, Repo, RepoHookSettings } from '../../../../shared/types'
import { getRepoKindLabel, isFolderRepo } from '../../../../shared/repo-kind'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Trash2 } from 'lucide-react'
import { BaseRefPicker } from './BaseRefPicker'
import { RepositoryHooksSection } from './RepositoryHooksSection'
import { McpConfigSection } from './McpConfigSection'
import { WorktreeSymlinksSection } from './WorktreeSymlinksSection'
import { SparsePresetSettingsSection } from './SparsePresetSettingsSection'
import { RepositorySourceControlAiSection } from './RepositorySourceControlAiSection'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch, normalizeSettingsSearchQuery } from './settings-search'
import { useAppStore } from '../../store'
import { getRepositoryIconSectionId } from './repository-settings-targets'
import { RepositoryIconPicker } from './RepositoryIconPicker'
import { getRepositoryPaneSearchEntries } from './repository-search'
export { getRepositoryPaneSearchEntries }

type RepositoryPaneProps = {
  repo: Repo
  yamlHooks: OrcaHooks | null
  hasHooksFile: boolean
  hooksInspectionReady: boolean
  mayNeedUpdate: boolean
  updateRepo: (repoId: string, updates: Partial<Repo>) => void
  removeProject: (repoId: string) => void
}

export function matchesRepositoryIdentitySearch(query: string, repo: Repo): boolean {
  const normalizedQuery = normalizeSettingsSearchQuery(query)
  if (!normalizedQuery) {
    return false
  }
  return [repo.displayName, repo.path].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  )
}

export function RepositoryPane({
  repo,
  yamlHooks,
  hasHooksFile,
  hooksInspectionReady,
  mayNeedUpdate,
  updateRepo,
  removeProject
}: RepositoryPaneProps): React.JSX.Element {
  const isFolder = isFolderRepo(repo)
  const searchQuery = useAppStore((state) => state.settingsSearchQuery)
  const symlinksEnabled = useAppStore((state) => state.settings?.experimentalWorktreeSymlinks)
  const [confirmingRemove, setConfirmingRemove] = useState<string | null>(null)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  // Why: searching a project name is navigation to that project, not a
  // request to hide every child row that does not repeat the project name.
  const forceFullPaneForRepoMatch = matchesRepositoryIdentitySearch(searchQuery, repo)

  const handleRemoveProject = (repoId: string) => {
    if (confirmingRemove === repoId) {
      removeProject(repoId)
      setConfirmingRemove(null)
      return
    }

    setConfirmingRemove(repoId)
  }

  const updateSelectedRepoHookSettings = (nextSettings: RepoHookSettings) => {
    updateRepo(repo.id, {
      hookSettings: nextSettings
    })
  }

  const handleCopyTemplate = async () => {
    // Why: the missing-`orca.yaml` state is a migration aid, so copying the shared-template
    // snippet should be one click rather than forcing users to reconstruct the expected shape.
    await window.api.ui.writeClipboardText(`scripts:
  setup: |
    pnpm worktree:setup
  archive: |
    echo "Cleaning up before archive"`)
    setCopiedTemplate(true)
    window.setTimeout(() => setCopiedTemplate(false), 1500)
  }

  const allEntries = getRepositoryPaneSearchEntries(repo)
  const identityEntries = allEntries.filter((entry) =>
    ['显示名称', '项目图标', '默认 Worktree 基线', '移除项目'].includes(
      entry.title
    )
  )
  const sparsePresetEntries = allEntries.filter((entry) =>
    ['稀疏检出预设'].includes(entry.title)
  )
  const hooksEntries = allEntries.filter((entry) =>
    [
      '初始化脚本',
      '归档脚本',
      '高级设置',
      '何时运行初始化',
      '自定义 GitHub Issue 命令'
    ].includes(entry.title)
  )
  const mcpEntries = allEntries.filter((entry) => entry.title === 'MCP 配置')
  const symlinkEntries = allEntries.filter((entry) => entry.title === 'Worktree 符号链接')
  const sourceControlAiEntries = allEntries.filter((entry) => entry.title === 'Source Control AI')

  const hooksSection =
    !isFolder && (forceFullPaneForRepoMatch || matchesSettingsSearch(searchQuery, hooksEntries)) ? (
      <RepositoryHooksSection
        key="hooks"
        repo={repo}
        yamlHooks={yamlHooks}
        hasHooksFile={hasHooksFile}
        hooksInspectionReady={hooksInspectionReady}
        mayNeedUpdate={mayNeedUpdate}
        copiedTemplate={copiedTemplate}
        forceVisible={forceFullPaneForRepoMatch}
        onCopyTemplate={() => void handleCopyTemplate()}
        onUpdateHookSettings={updateSelectedRepoHookSettings}
      />
    ) : null

  // Why: Identity (name, icon, base ref) stays at the top so it's the first
  // thing a user sees. Setup commands follow immediately because they're the
  // most-edited surface and should beat MCP/symlinks/sparse-presets.
  const visibleSections = [
    forceFullPaneForRepoMatch || matchesSettingsSearch(searchQuery, identityEntries) ? (
      <section key="identity" className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">项目标识</h3>
            <p className="text-xs text-muted-foreground">
              控制这个项目在侧边栏和标签页里的显示方式。
            </p>
            <p className="text-xs text-muted-foreground">
              类型：<span className="text-foreground">{getRepoKindLabel(repo)}</span>
            </p>
            {isFolder ? (
              <p className="text-xs text-muted-foreground">
                当前以文件夹方式打开，这个工作区不可使用 Git 相关能力。
              </p>
            ) : null}
          </div>
          <SearchableSetting
            title="移除项目"
            description="把这个项目从 Orca 中移除。"
            keywords={[repo.displayName, 'delete', 'project', 'repository', '移除', '删除']}
            forceVisible={forceFullPaneForRepoMatch}
          >
            <Button
              variant={confirmingRemove === repo.id ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleRemoveProject(repo.id)}
              onBlur={() => setConfirmingRemove(null)}
              className="gap-2"
            >
              <Trash2 className="size-3.5" />
              {confirmingRemove === repo.id ? '确认移除' : '移除项目'}
            </Button>
          </SearchableSetting>
        </div>

        <SearchableSetting
          title="显示名称"
          description="设置项目在侧边栏和标签页中的显示名称。"
          keywords={[repo.displayName, repo.path, 'project name', 'repository name', '名称']}
          className="space-y-2"
          forceVisible={forceFullPaneForRepoMatch}
        >
          <Label className="text-sm font-semibold">显示名称</Label>
          <Input
            value={repo.displayName}
            onChange={(e) =>
              updateRepo(repo.id, {
                displayName: e.target.value
              })
            }
            className="h-9 text-sm"
          />
        </SearchableSetting>

        <SearchableSetting
          title="项目图标"
          description="设置项目在侧边栏和标签页中使用的图标和颜色。"
          keywords={[
            repo.displayName,
            repo.path,
            'project icon',
            'repository icon',
            'color',
            'badge',
            'emoji',
            'favicon',
            '图标'
          ]}
          className="space-y-2"
          id={getRepositoryIconSectionId(repo.id)}
          forceVisible={forceFullPaneForRepoMatch}
        >
          <RepositoryIconPicker repo={repo} updateRepo={updateRepo} />
        </SearchableSetting>

        {!isFolder ? (
          <SearchableSetting
            title="默认 Worktree 基线"
            description="创建 worktree 时默认使用的基线分支或 ref。"
            keywords={[repo.displayName, 'base ref', 'branch', '基线', '分支']}
            className="space-y-3"
            forceVisible={forceFullPaneForRepoMatch}
          >
            <Label className="text-sm font-semibold">默认 Worktree 基线</Label>
            <BaseRefPicker
              repoId={repo.id}
              currentBaseRef={repo.worktreeBaseRef}
              onSelect={(ref) => updateRepo(repo.id, { worktreeBaseRef: ref })}
              onUsePrimary={() => updateRepo(repo.id, { worktreeBaseRef: undefined })}
            />
          </SearchableSetting>
        ) : null}
      </section>
    ) : null,
    hooksSection,
    !isFolder &&
    (forceFullPaneForRepoMatch || matchesSettingsSearch(searchQuery, sourceControlAiEntries)) ? (
      <RepositorySourceControlAiSection
        key="source-control-ai"
        repo={repo}
        updateRepo={updateRepo}
      />
    ) : null,
    !isFolder &&
    !repo.connectionId &&
    symlinksEnabled &&
    (forceFullPaneForRepoMatch || matchesSettingsSearch(searchQuery, symlinkEntries)) ? (
      <WorktreeSymlinksSection key="symlinks" repo={repo} updateRepo={updateRepo} />
    ) : null,
    !isFolder &&
    (forceFullPaneForRepoMatch || matchesSettingsSearch(searchQuery, sparsePresetEntries)) ? (
      <SparsePresetSettingsSection key="sparse-presets" repoId={repo.id} />
    ) : null,
    !isFolder && (forceFullPaneForRepoMatch || matchesSettingsSearch(searchQuery, mcpEntries)) ? (
      <McpConfigSection key="mcp-configs" repo={repo} />
    ) : null
  ].filter(Boolean)

  return (
    <div className="space-y-8">
      {visibleSections.map((section, index) => (
        <div key={index} className="space-y-8">
          {index > 0 ? <Separator /> : null}
          {section}
        </div>
      ))}
    </div>
  )
}
