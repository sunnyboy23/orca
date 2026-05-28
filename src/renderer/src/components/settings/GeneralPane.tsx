/* eslint-disable max-lines -- Why: GeneralPane is the single owner of all general settings UI;
   splitting individual settings into separate files would scatter related controls without a
   meaningful abstraction boundary. */
import { useEffect, useRef, useState } from 'react'
import type { GlobalSettings, OpenInApplication } from '../../../../shared/types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Download, FolderOpen, Loader2, RefreshCw, Star, Timer } from 'lucide-react'
import { useAppStore } from '../../store'
import { CliSection } from './CliSection'
import { toast } from 'sonner'
import {
  DEFAULT_EDITOR_AUTO_SAVE_DELAY_MS,
  MAX_EDITOR_AUTO_SAVE_DELAY_MS,
  MIN_EDITOR_AUTO_SAVE_DELAY_MS
} from '../../../../shared/constants'
import { OPEN_IN_APPLICATIONS_MAX } from '../../../../shared/open-in-applications'
import { clampNumber } from '@/lib/terminal-theme'
import {
  GENERAL_CLI_SEARCH_ENTRIES,
  getGeneralCacheTimerSearchEntries,
  getGeneralEditorSearchEntries,
  getGeneralPaneSearchEntries,
  getGeneralSupportSearchEntries,
  getGeneralUpdateSearchEntries,
  getGeneralWorkspaceSearchEntries
} from './general-search'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import {
  SettingsSegmentedControl,
  SettingsSubsectionHeader,
  SettingsSwitch,
  SettingsSwitchRow
} from './SettingsFormControls'
import { normalizeAppLanguage, useI18n } from '@/i18n'

function createOpenInApplication(): OpenInApplication {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `open-in-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    label: '',
    command: ''
  }
}

function createPresetOpenInApplication(label: string, command: string): OpenInApplication {
  return {
    ...createOpenInApplication(),
    label,
    command
  }
}

export function shouldCommitOpenInApplicationsDraft(applications: OpenInApplication[]): boolean {
  return applications.every((application) => {
    return application.label.trim() !== '' && application.command.trim() !== ''
  })
}

export function getDesktopPlatformFromUserAgent(userAgent: string): 'darwin' | 'win32' | 'other' {
  if (userAgent.includes('Mac')) {
    return 'darwin'
  }
  if (userAgent.includes('Windows')) {
    return 'win32'
  }
  return 'other'
}

export { getGeneralPaneSearchEntries }

type GeneralPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

export function GeneralPane({ settings, updateSettings }: GeneralPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settings.general
  const workspaceSearchEntries = getGeneralWorkspaceSearchEntries(messages.settings, {
    title: messages.language.title,
    description: messages.language.description,
    keywords: ['language', 'locale', '中文', 'chinese', 'english', '语言']
  })
  const editorSearchEntries = getGeneralEditorSearchEntries(messages.settings)
  const cacheTimerSearchEntries = getGeneralCacheTimerSearchEntries(messages.settings)
  const updateSearchEntries = getGeneralUpdateSearchEntries(messages.settings)
  const supportSearchEntries = getGeneralSupportSearchEntries(messages.settings)
  const searchQuery = useAppStore((s) => s.settingsSearchQuery)
  const updateStatus = useAppStore((s) => s.updateStatus)
  // Why: the 'error' variant of UpdateStatus does not carry a `version` field.
  // The main process emits `{ state: 'error' }` for both check failures (no
  // version known yet) and download/install failures (version was known from
  // the preceding 'available'/'downloading'/'downloaded' state). Cache the
  // last-known version so the error copy below can distinguish the two cases
  // without adding IPC. Mirrors `versionRef` in UpdateCard.tsx.
  const updateVersionRef = useRef<string | null>(null)
  if (
    (updateStatus.state === 'available' ||
      updateStatus.state === 'downloading' ||
      updateStatus.state === 'downloaded') &&
    updateStatus.version
  ) {
    updateVersionRef.current = updateStatus.version
  } else if (
    updateStatus.state === 'checking' ||
    updateStatus.state === 'idle' ||
    updateStatus.state === 'not-available'
  ) {
    // Why: a new check cycle has started or completed cleanly. Clear the
    // cached version so a subsequent check failure cannot be mis-classified
    // as a download failure based on a stale version from a prior cycle.
    updateVersionRef.current = null
  }
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const [autoSaveDelayDraft, setAutoSaveDelayDraft] = useState(
    String(settings.editorAutoSaveDelayMs)
  )
  const [openInApplicationsDraft, setOpenInApplicationsDraft] = useState<OpenInApplication[]>(
    settings.openInApplications ?? []
  )
  // Why: the star state is derived from gh, not from settings, so it does not
  // live in the global settings store. 'hidden' covers the gh-unavailable and
  // already-starred-on-a-previous-session cases so the section drops out for
  // users who can't or don't need to act.
  //
  // We start in 'loading' and render a placeholder at the exact same
  // dimensions as the resolved section. When gh resolves to 'hidden', the
  // placeholder collapses with a grid-rows transition so content above it
  // doesn't shift; anything below (nothing today, but future-proof) eases up.
  const [starState, setStarState] = useState<
    'loading' | 'not-starred' | 'starred' | 'starring' | 'hidden' | 'error'
  >('loading')

  useEffect(() => {
    window.api.updater.getVersion().then(setAppVersion)
  }, [])

  useEffect(() => {
    let cancelled = false
    void window.api.gh.checkOrcaStarred().then((result) => {
      if (cancelled) {
        return
      }
      if (result === null) {
        setStarState('hidden')
      } else {
        setStarState(result ? 'starred' : 'not-starred')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleStarClick = async (): Promise<void> => {
    if (starState !== 'not-starred' && starState !== 'error') {
      return
    }
    setStarState('starring')
    const ok = await window.api.gh.starOrca()
    if (!ok) {
      setStarState('error')
      return
    }
    setStarState('starred')
    // Why: clicking star anywhere should also permanently mute the
    // threshold-based nag so the user isn't re-prompted via the popup.
    await window.api.starNag.complete()
  }

  useEffect(() => {
    setAutoSaveDelayDraft(String(settings.editorAutoSaveDelayMs))
  }, [settings.editorAutoSaveDelayMs])

  useEffect(() => {
    setOpenInApplicationsDraft(settings.openInApplications ?? [])
  }, [settings.openInApplications])

  const commitOpenInApplications = (applications: OpenInApplication[]): void => {
    if (!shouldCommitOpenInApplicationsDraft(applications)) {
      return
    }
    updateSettings({ openInApplications: applications })
  }

  const applyOpenInApplicationsDraft = (applications: OpenInApplication[]): void => {
    setOpenInApplicationsDraft(applications)
    commitOpenInApplications(applications)
  }

  const handleBrowseWorkspace = async () => {
    const path = await window.api.repos.pickFolder()
    if (path) {
      updateSettings({ workspaceDir: path })
    }
  }

  const commitAutoSaveDelay = (): void => {
    const trimmed = autoSaveDelayDraft.trim()
    if (trimmed === '') {
      setAutoSaveDelayDraft(String(settings.editorAutoSaveDelayMs))
      return
    }

    const value = Number(trimmed)
    if (!Number.isFinite(value)) {
      setAutoSaveDelayDraft(String(settings.editorAutoSaveDelayMs))
      return
    }

    const next = clampNumber(
      Math.round(value),
      MIN_EDITOR_AUTO_SAVE_DELAY_MS,
      MAX_EDITOR_AUTO_SAVE_DELAY_MS
    )
    updateSettings({ editorAutoSaveDelayMs: next })
    setAutoSaveDelayDraft(String(next))
  }

  const handleRestartToUpdate = (): void => {
    // Why: quitAndInstall resolves immediately (the actual quit happens in a
    // deferred timer in the main process), so rejection here is only possible
    // if the IPC channel itself breaks. Log defensively; the user will notice
    // the app didn't restart and can retry.
    void window.api.updater.quitAndInstall().catch(console.error)
  }

  const visibleSections = [
    matchesSettingsSearch(searchQuery, workspaceSearchEntries) ? (
      <section key="workspace" className="space-y-4">
        <SettingsSubsectionHeader
          title={copy.workspace.title}
          description={copy.workspace.description}
        />

        <SearchableSetting
          title={messages.language.title}
          description={messages.language.description}
          keywords={['language', 'locale', '中文', 'chinese', 'english']}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <Label>{messages.language.title}</Label>
            <p className="text-xs text-muted-foreground">{messages.language.description}</p>
          </div>
          <SettingsSegmentedControl
            ariaLabel={messages.language.title}
            value={normalizeAppLanguage(settings.appLanguage)}
            onChange={(option) => updateSettings({ appLanguage: option })}
            options={[
              { value: 'system', label: messages.language.system },
              { value: 'en', label: messages.language.english },
              { value: 'zh-CN', label: messages.language.chinese }
            ]}
          />
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.workspaceDirectory.title}
          description={copy.fields.workspaceDirectory.description}
          keywords={copy.fields.workspaceDirectory.keywords}
          className="space-y-2"
        >
          <Label>{copy.fields.workspaceDirectory.title}</Label>
          <div className="flex gap-2">
            <Input
              value={settings.workspaceDir}
              onChange={(e) => updateSettings({ workspaceDir: e.target.value })}
              className="flex-1 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBrowseWorkspace}
              className="shrink-0 gap-1.5"
            >
              <FolderOpen className="size-3.5" />
              {copy.actions.browse}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {copy.fields.workspaceDirectory.description}
          </p>
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.nestWorkspaces.title}
          description={copy.fields.nestWorkspaces.description}
          keywords={copy.fields.nestWorkspaces.keywords}
        >
          <SettingsSwitchRow
            label={copy.fields.nestWorkspaces.title}
            description={copy.fields.nestWorkspaces.description}
            checked={settings.nestWorkspaces}
            onChange={() => updateSettings({ nestWorkspaces: !settings.nestWorkspaces })}
          />
        </SearchableSetting>

        {/* Why: the "Don't ask again" toast in the delete-worktree dialog
            deep-links here, so the wrapper id must stay stable. Renaming it
            breaks that toast action even though this pane still renders fine. */}
        <div id="general-skip-delete-worktree-confirm" className="scroll-mt-6">
          <SearchableSetting
            title={copy.fields.askBeforeDeletingWorkspaces.title}
            description={copy.fields.askBeforeDeletingWorkspaces.description}
            keywords={copy.fields.askBeforeDeletingWorkspaces.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.askBeforeDeletingWorkspaces.title}
              description={copy.fields.askBeforeDeletingWorkspacesToggle}
              checked={!settings.skipDeleteWorktreeConfirm}
              onChange={() =>
                updateSettings({
                  skipDeleteWorktreeConfirm: !settings.skipDeleteWorktreeConfirm
                })
              }
            />
          </SearchableSetting>
        </div>

        <div id="general-skip-delete-automation-confirm" className="scroll-mt-6">
          <SearchableSetting
            title={copy.fields.askBeforeDeletingAutomations.title}
            description={copy.fields.askBeforeDeletingAutomations.description}
            keywords={copy.fields.askBeforeDeletingAutomations.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.askBeforeDeletingAutomations.title}
              description={copy.fields.askBeforeDeletingAutomationsToggle}
              checked={!settings.skipDeleteAutomationConfirm}
              onChange={() =>
                updateSettings({
                  skipDeleteAutomationConfirm: !settings.skipDeleteAutomationConfirm
                })
              }
            />
          </SearchableSetting>
        </div>

        <SearchableSetting
          title={copy.fields.openInMenu.title}
          description={copy.fields.openInMenu.description}
          keywords={copy.fields.openInMenu.keywords}
          className="space-y-3"
        >
          <div className="space-y-1">
            <Label>{copy.fields.openInMenu.title}</Label>
            <p className="text-xs text-muted-foreground">{copy.fields.openInMenuDescription}</p>
            <p className="text-xs text-muted-foreground">{copy.fields.openInMenuCommandNote}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applyOpenInApplicationsDraft([
                  ...openInApplicationsDraft,
                  createPresetOpenInApplication('Cursor', 'cursor')
                ])
              }
            >
              {copy.fields.addCursor}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applyOpenInApplicationsDraft([
                  ...openInApplicationsDraft,
                  createPresetOpenInApplication('Zed', 'zed')
                ])
              }
            >
              {copy.fields.addZed}
            </Button>
          </div>
          <div className="space-y-2">
            {openInApplicationsDraft.map((app, index) => (
              <div key={app.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={app.label}
                  placeholder={copy.fields.labelPlaceholder}
                  onChange={(event) => {
                    const next = [...openInApplicationsDraft]
                    next[index] = { ...app, label: event.target.value }
                    setOpenInApplicationsDraft(next)
                  }}
                  onBlur={() => commitOpenInApplications(openInApplicationsDraft)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      commitOpenInApplications(openInApplicationsDraft)
                    }
                  }}
                />
                <Input
                  value={app.command}
                  placeholder={copy.fields.executableCommandPlaceholder}
                  onChange={(event) => {
                    const next = [...openInApplicationsDraft]
                    next[index] = { ...app, command: event.target.value }
                    setOpenInApplicationsDraft(next)
                  }}
                  onBlur={() => commitOpenInApplications(openInApplicationsDraft)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      commitOpenInApplications(openInApplicationsDraft)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = openInApplicationsDraft.filter((entry) => entry.id !== app.id)
                    setOpenInApplicationsDraft(next)
                    commitOpenInApplications(next)
                  }}
                >
                  {copy.actions.remove}
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setOpenInApplicationsDraft([...openInApplicationsDraft, createOpenInApplication()])
            }
            disabled={openInApplicationsDraft.length >= OPEN_IN_APPLICATIONS_MAX}
          >
            {copy.fields.addCustomLauncher}
          </Button>
        </SearchableSetting>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, editorSearchEntries) ? (
      <section key="editor" className="space-y-4">
        <SettingsSubsectionHeader
          title={copy.editor.title}
          description={copy.editor.description}
        />

        <SearchableSetting
          title={copy.fields.autoSaveFiles.title}
          description={copy.fields.autoSaveFiles.description}
          keywords={copy.fields.autoSaveFiles.keywords}
        >
          <SettingsSwitchRow
            label={copy.fields.autoSaveFiles.title}
            description={copy.fields.autoSaveFiles.description}
            checked={settings.editorAutoSave}
            onChange={() => updateSettings({ editorAutoSave: !settings.editorAutoSave })}
          />
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.autoSaveDelay.title}
          description={copy.fields.autoSaveDelay.description}
          keywords={copy.fields.autoSaveDelay.keywords}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <Label>{copy.fields.autoSaveDelay.title}</Label>
            <p className="text-xs text-muted-foreground">
              {copy.fields.autoSaveDelayDescription(DEFAULT_EDITOR_AUTO_SAVE_DELAY_MS)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Input
              type="number"
              min={MIN_EDITOR_AUTO_SAVE_DELAY_MS}
              max={MAX_EDITOR_AUTO_SAVE_DELAY_MS}
              step={250}
              value={autoSaveDelayDraft}
              onChange={(e) => setAutoSaveDelayDraft(e.target.value)}
              onBlur={commitAutoSaveDelay}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitAutoSaveDelay()
                }
              }}
              className="number-input-clean w-28 text-right tabular-nums"
            />
            <span className="text-xs text-muted-foreground">ms</span>
          </div>
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.defaultDiffView.title}
          description={copy.fields.defaultDiffView.description}
          keywords={copy.fields.defaultDiffView.keywords}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <Label>{copy.fields.defaultDiffView.title}</Label>
            <p className="text-xs text-muted-foreground">
              {copy.fields.defaultDiffView.description}
            </p>
          </div>
          <SettingsSegmentedControl
            ariaLabel={copy.fields.defaultDiffView.title}
            value={settings.diffDefaultView}
            onChange={(option) => updateSettings({ diffDefaultView: option })}
            options={[
              { value: 'inline', label: copy.options.inline },
              { value: 'side-by-side', label: copy.options.sideBySide }
            ]}
          />
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.defaultDiffFileTree.title}
          description={copy.fields.defaultDiffFileTree.description}
          keywords={copy.fields.defaultDiffFileTree.keywords}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <Label>{copy.fields.defaultDiffFileTree.title}</Label>
            <p className="text-xs text-muted-foreground">
              {copy.fields.defaultDiffFileTree.description}
            </p>
          </div>
          <SettingsSegmentedControl
            ariaLabel={copy.fields.defaultDiffFileTree.title}
            value={settings.combinedDiffFileTreeVisibleByDefault ? 'shown' : 'hidden'}
            onChange={(option) =>
              updateSettings({ combinedDiffFileTreeVisibleByDefault: option === 'shown' })
            }
            options={[
              { value: 'shown', label: copy.options.shown },
              { value: 'hidden', label: copy.options.hidden }
            ]}
          />
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.minimap.title}
          description={copy.fields.minimap.description}
          keywords={copy.fields.minimap.keywords}
        >
          <SettingsSwitchRow
            label={copy.fields.minimap.title}
            description={copy.fields.minimap.description}
            checked={settings.editorMinimapEnabled}
            onChange={() =>
              updateSettings({ editorMinimapEnabled: !settings.editorMinimapEnabled })
            }
          />
        </SearchableSetting>

        <SearchableSetting
          title={copy.fields.markdownReviewNotes.title}
          description={copy.fields.markdownReviewNotes.description}
          keywords={copy.fields.markdownReviewNotes.keywords}
        >
          <SettingsSwitchRow
            label={copy.fields.markdownReviewNotes.title}
            description={copy.fields.markdownReviewNotes.description}
            checked={settings.markdownReviewToolsEnabled}
            onChange={() =>
              updateSettings({ markdownReviewToolsEnabled: !settings.markdownReviewToolsEnabled })
            }
          />
        </SearchableSetting>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, GENERAL_CLI_SEARCH_ENTRIES) ? (
      <CliSection
        key="cli"
        currentPlatform={getDesktopPlatformFromUserAgent(navigator.userAgent)}
      />
    ) : null,
    matchesSettingsSearch(searchQuery, cacheTimerSearchEntries) ? (
      <section key="cache-timer" className="space-y-4">
        <SettingsSubsectionHeader
          title={copy.cacheTimer.header.title}
          description={copy.cacheTimer.header.description}
        />

        <SearchableSetting
          title={copy.cacheTimer.cacheTimer.title}
          description={copy.cacheTimer.cacheTimer.description}
          keywords={cacheTimerSearchEntries.flatMap((entry) => [
            entry.title,
            entry.description ?? '',
            ...(entry.keywords ?? [])
          ])}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-muted-foreground" />
              <Label>{copy.cacheTimer.cacheTimer.title}</Label>
            </div>
            <p className="text-xs text-muted-foreground">{copy.cacheTimer.timerDescription}</p>
          </div>
          <SettingsSwitch
            ariaLabel={copy.cacheTimer.cacheTimer.title}
            checked={settings.promptCacheTimerEnabled}
            onChange={() => {
              const enabling = !settings.promptCacheTimerEnabled
              updateSettings({ promptCacheTimerEnabled: enabling })
              if (enabling) {
                useAppStore.getState().seedCacheTimersForIdleTabs()
              }
            }}
          />
        </SearchableSetting>

        {settings.promptCacheTimerEnabled && (
          <SearchableSetting
            title={copy.cacheTimer.duration.title}
            description={copy.cacheTimer.duration.description}
            keywords={copy.cacheTimer.duration.keywords}
            className="flex items-center justify-between gap-4 py-2 pl-7"
          >
            <div className="min-w-0 flex-1 space-y-0.5">
              <Label>{copy.cacheTimer.duration.title}</Label>
              <p className="text-xs text-muted-foreground">
                {copy.cacheTimer.durationDescription}
              </p>
            </div>
            <Select
              value={String(settings.promptCacheTtlMs)}
              onValueChange={(v) => updateSettings({ promptCacheTtlMs: Number(v) })}
            >
              <SelectTrigger size="sm" className="h-7 text-xs w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300000">{copy.cacheTimer.fiveMinutes}</SelectItem>
                <SelectItem value="3600000">{copy.cacheTimer.oneHour}</SelectItem>
              </SelectContent>
            </Select>
          </SearchableSetting>
        )}
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, updateSearchEntries) ? (
      <section key="updates" className="space-y-4">
        <SettingsSubsectionHeader
          title={copy.updates.title}
          description={copy.updates.currentVersion(appVersion)}
        />

        <SearchableSetting
          title={copy.updates.check.title}
          description={copy.updates.check.description}
          keywords={copy.updates.check.keywords}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              // Why: Shift-click opts this check into the release-candidate
              // channel. Keep the affordance hidden — it's a power-user
              // shortcut, not a discoverable toggle.
              onClick={(event) =>
                window.api.updater.check({
                  includePrerelease: event.shiftKey
                })
              }
              disabled={updateStatus.state === 'checking' || updateStatus.state === 'downloading'}
              className="gap-2"
            >
              {updateStatus.state === 'checking' ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              {copy.updates.checkButton}
            </Button>

            {updateStatus.state === 'available' ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  void window.api.updater.download().catch((error) => {
                    toast.error(copy.updates.downloadStartError, {
                      description: String((error as Error)?.message ?? error)
                    })
                  })
                }}
                className="gap-2"
              >
                <Download className="size-3.5" />
                {copy.updates.installUpdate(updateStatus.version)}
              </Button>
            ) : updateStatus.state === 'downloaded' ? (
              <Button variant="default" size="sm" onClick={handleRestartToUpdate} className="gap-2">
                <Download className="size-3.5" />
                {copy.updates.restartToUpdate(updateStatus.version)}
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            {updateStatus.state === 'idle' && copy.updates.idle}
            {updateStatus.state === 'checking' && copy.updates.checking}
            {updateStatus.state === 'available' && (
              <>
                {copy.updates.available(updateStatus.version)}{' '}
                <a
                  href={
                    updateStatus.releaseUrl ??
                    `https://github.com/stablyai/orca/releases/tag/v${updateStatus.version}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {copy.updates.releaseNotes}
                </a>
              </>
            )}
            {updateStatus.state === 'not-available' && copy.updates.latest}
            {updateStatus.state === 'downloading' &&
              copy.updates.downloading(updateStatus.version, updateStatus.percent)}
            {updateStatus.state === 'downloaded' && (
              <>
                {copy.updates.downloaded(updateStatus.version)}{' '}
                <a
                  href={
                    updateStatus.releaseUrl ??
                    `https://github.com/stablyai/orca/releases/tag/v${updateStatus.version}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {copy.updates.releaseNotes}
                </a>
              </>
            )}
            {updateStatus.state === 'error' &&
              // Why: `{ state: 'error' }` is emitted for both check-time
              // failures (no version cached) and download/install failures
              // (version cached from a prior 'available'/'downloading'/
              // 'downloaded' state). Label accordingly so a download failure
              // isn't mislabeled as a "check" failure. Mirrors UpdateCard.tsx.
              (updateVersionRef.current
                ? copy.updates.updateError(updateStatus.message)
                : copy.updates.checkError(updateStatus.message))}
          </p>
        </SearchableSetting>
      </section>
    ) : null
    // Note: the Support section is rendered outside this array so it can own
    // its own loading placeholder and its own collapsing Separator. Without
    // that separation, a dangling divider would remain above the collapsed
    // section.
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {visibleSections.map((section, index) => (
        <div key={index} className="space-y-6">
          {index > 0 ? <Separator /> : null}
          {section}
        </div>
      ))}
      {matchesSettingsSearch(searchQuery, supportSearchEntries) ? (
        <SupportSection
          copy={copy}
          state={starState}
          hasPrecedingSections={visibleSections.length > 0}
          onStarClick={handleStarClick}
        />
      ) : null}
    </div>
  )
}

type SupportSectionProps = {
  copy: ReturnType<typeof useI18n>['messages']['settings']['general']
  state: 'loading' | 'not-starred' | 'starring' | 'starred' | 'hidden' | 'error'
  hasPrecedingSections: boolean
  onStarClick: () => void | Promise<void>
}

function SupportSection({
  copy,
  state,
  hasPrecedingSections,
  onStarClick
}: SupportSectionProps): React.JSX.Element {
  // Why: 'hidden' means gh is unavailable or the user had already starred on a
  // previous session — in both cases we collapse the entire section (including
  // its leading Separator) so the settings pane doesn't carry an empty strip.
  // For every other state we render the full row so the initial layout is
  // stable: the skeleton-to-live swap happens in place and a post-click
  // "Starred" confirmation does not shift anything above or below it.
  const collapsed = state === 'hidden'

  return (
    <section
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      }`}
      aria-hidden={collapsed}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="space-y-8">
          {hasPrecedingSections ? <Separator /> : null}
          <div className="space-y-4">
            <SettingsSubsectionHeader title={copy.support.title} />
            {state === 'loading' ? <SupportRowSkeleton /> : null}
            {state !== 'loading' && state !== 'hidden' ? (
              <SupportRow copy={copy} state={state} onStarClick={onStarClick} />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function SupportRowSkeleton(): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-2" aria-hidden="true">
      <div className="h-4 w-36 rounded bg-muted/50 animate-pulse" />
      <div className="h-8 w-24 rounded-md bg-muted/50 animate-pulse" />
    </div>
  )
}

function SupportRow({
  copy,
  state,
  onStarClick
}: {
  copy: ReturnType<typeof useI18n>['messages']['settings']['general']
  state: 'not-starred' | 'starring' | 'starred' | 'error'
  onStarClick: () => void | Promise<void>
}): React.JSX.Element {
  // Why: the left-hand label is the setting's identity and must not change
  // when the user clicks — the row should still read "Star Orca on GitHub"
  // afterwards. The right-hand control is what changes: before starring it
  // is a button; after a successful star we swap in a small inline "Thanks"
  // confirmation so the row keeps the same shape without showing a stale,
  // disabled button.
  return (
    <SearchableSetting
      title={copy.support.star.title}
      description={copy.support.star.description}
      keywords={copy.support.star.keywords}
      className="flex items-center justify-between gap-4 py-2"
    >
      <Label>{copy.support.star.title}</Label>
      {state === 'starred' ? (
        <SupportRowThanks copy={copy} />
      ) : (
        <Button
          variant="default"
          size="sm"
          onClick={() => void onStarClick()}
          disabled={state === 'starring'}
          className="shrink-0 gap-1.5"
        >
          {state === 'starring' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Star className="size-3.5" />
          )}
          {state === 'starring'
            ? copy.support.starring
            : state === 'error'
              ? copy.support.tryAgain
              : copy.support.starButton}
        </Button>
      )}
    </SearchableSetting>
  )
}

function SupportRowThanks({
  copy
}: {
  copy: ReturnType<typeof useI18n>['messages']['settings']['general']
}): React.JSX.Element {
  // Why: match the size="sm" button's h-8 / gap-1.5 / px-3 dimensions so the
  // row height stays identical when the button is swapped out. Without the
  // fixed height, the text baseline collapses ~6px and the entire row
  // shrinks, shifting everything below.
  return (
    <div
      className="shrink-0 inline-flex h-8 items-center gap-1.5 px-3 text-sm font-medium
        text-amber-400/90 animate-in fade-in slide-in-from-right-1 duration-300"
      role="status"
      aria-live="polite"
    >
      <Star className="size-3.5 fill-amber-400/80 text-amber-400/80" aria-hidden="true" />
      {copy.support.thanks}
    </div>
  )
}
