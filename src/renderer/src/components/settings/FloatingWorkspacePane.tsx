import { useEffect, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import type { FloatingTerminalTriggerLocation, GlobalSettings } from '../../../../shared/types'
import { useI18n } from '@/i18n'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { SearchableSetting } from './SearchableSetting'
import { SettingsRow, SettingsSwitchRow } from './SettingsFormControls'
import { FLOATING_WORKSPACE_SEARCH_ENTRIES } from './floating-workspace-search'
import { matchesSettingsSearch } from './settings-search'
import { useAppStore } from '../../store'

type FloatingWorkspacePaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

export function getFloatingWorkspaceDirectoryInputValue({
  configuredFloatingWorkspacePath,
  resolvedFloatingWorkspacePath
}: {
  configuredFloatingWorkspacePath: string
  resolvedFloatingWorkspacePath: string
}): string {
  const configuredPath = configuredFloatingWorkspacePath.trim()
  if (!configuredPath || configuredPath === '~') {
    return '~'
  }
  return resolvedFloatingWorkspacePath
}

export function FloatingWorkspacePane({
  settings,
  updateSettings
}: FloatingWorkspacePaneProps): React.JSX.Element | null {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.floatingWorkspace
  const searchQuery = useAppStore((state) => state.settingsSearchQuery)
  const [resolvedFloatingWorkspacePath, setResolvedFloatingWorkspacePath] = useState('')

  useEffect(() => {
    let cancelled = false
    void window.api.app
      .getFloatingTerminalCwd({
        path: settings.floatingTerminalCwd
      })
      .then((path) => {
        if (!cancelled) {
          setResolvedFloatingWorkspacePath(path)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedFloatingWorkspacePath('')
        }
      })
    return () => {
      cancelled = true
    }
  }, [settings.floatingTerminalCwd])

  const pickFloatingWorkspaceDirectory = async (): Promise<void> => {
    const path = await window.api.app.pickFloatingWorkspaceDirectory()
    if (!path) {
      return
    }
    updateSettings({ floatingTerminalCwd: path })
  }

  const directoryInputValue = getFloatingWorkspaceDirectoryInputValue({
    configuredFloatingWorkspacePath: settings.floatingTerminalCwd,
    resolvedFloatingWorkspacePath
  })

  if (!matchesSettingsSearch(searchQuery, FLOATING_WORKSPACE_SEARCH_ENTRIES)) {
    return null
  }

  return (
    <section className="space-y-4">
      <SearchableSetting
        title={copy.search.title}
        description={copy.search.description}
        keywords={copy.search.keywords}
        className="divide-y divide-border/40"
      >
        <SettingsSwitchRow
          label={copy.enable.label}
          description={copy.enable.description}
          checked={settings.floatingTerminalEnabled}
          onChange={() =>
            updateSettings({
              floatingTerminalEnabled: !settings.floatingTerminalEnabled
            })
          }
        />

        <SettingsRow
          alignTop
          label={copy.directory.label}
          description={copy.directory.description}
          control={
            <div className="flex w-72 max-w-full gap-2">
              <Input
                value={directoryInputValue}
                readOnly
                placeholder="~"
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={copy.directory.chooseAria}
                onClick={() => void pickFloatingWorkspaceDirectory()}
              >
                <FolderOpen className="size-4" />
              </Button>
            </div>
          }
        />

        <SettingsRow
          label={copy.toggleLocation.label}
          description={copy.toggleLocation.description}
          control={
            <ToggleGroup
              type="single"
              value={settings.floatingTerminalTriggerLocation ?? 'floating-button'}
              onValueChange={(value) => {
                if (!value) {
                  return
                }
                updateSettings({
                  floatingTerminalTriggerLocation: value as FloatingTerminalTriggerLocation
                })
              }}
            >
              <ToggleGroupItem value="floating-button">
                {copy.toggleLocation.floatingButton}
              </ToggleGroupItem>
              <ToggleGroupItem value="status-bar">{copy.toggleLocation.statusBar}</ToggleGroupItem>
            </ToggleGroup>
          }
        />
      </SearchableSetting>
    </section>
  )
}
