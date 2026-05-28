import type React from 'react'
import type { GlobalSettings } from '../../../../shared/types'
import { Separator } from '../ui/separator'
import { UIZoomControl } from './UIZoomControl'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import { useAppStore } from '../../store'
import { useShortcutKeyCombos } from '@/hooks/useShortcutLabel'
import { ShortcutKeyCombo } from '../ShortcutKeyCombo'
import {
  FontAutocomplete,
  SettingsRow,
  SettingsSegmentedControl,
  SettingsSubsectionHeader,
  SettingsSwitchRow
} from './SettingsFormControls'
import { DEFAULT_APP_FONT_FAMILY } from '../../../../shared/constants'
import { useAvailableStatusBarToggles } from '../status-bar/use-available-status-bar-toggles'
import {
  getAppearancePaneSearchEntries,
  getLayoutEntries,
  getSidebarEntries,
  getStatusBarEntries,
  getStatusBarToggles,
  getThemeEntries,
  getTitlebarEntries,
  getTypographyEntries,
  getZoomEntries
} from './appearance-search'
import { useI18n } from '@/i18n'

type AppearancePaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
  applyTheme: (theme: 'system' | 'dark' | 'light') => void
  fontSuggestions: string[]
}

function ShortcutHintList({
  combos,
  unassignedLabel
}: {
  combos: string[][]
  unassignedLabel: string
}): React.JSX.Element {
  if (combos.length === 0) {
    return <span className="text-xs text-muted-foreground">{unassignedLabel}</span>
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1 align-middle">
      {combos.map((keys) => (
        <ShortcutKeyCombo
          key={keys.join('-')}
          keys={keys}
          className="inline-flex gap-0.5"
          separatorClassName="text-[10px] text-muted-foreground"
        />
      ))}
    </span>
  )
}

export function AppearancePane({
  settings,
  updateSettings,
  applyTheme,
  fontSuggestions
}: AppearancePaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settings.appearance
  const themeEntries = getThemeEntries(messages.settings)
  const zoomEntries = getZoomEntries(messages.settings)
  const typographyEntries = getTypographyEntries(messages.settings)
  const layoutEntries = getLayoutEntries(messages.settings)
  const titlebarEntries = getTitlebarEntries(messages.settings)
  const statusBarEntries = getStatusBarEntries(messages.settings)
  const sidebarEntries = getSidebarEntries(messages.settings)
  const searchQuery = useAppStore((state) => state.settingsSearchQuery)
  const zoomInKeyCombos = useShortcutKeyCombos('zoom.in')
  const zoomOutKeyCombos = useShortcutKeyCombos('zoom.out')
  const statusBarItems = useAppStore((state) => state.statusBarItems)
  const toggleStatusBarItem = useAppStore((state) => state.toggleStatusBarItem)
  const visibleStatusBarToggles = useAvailableStatusBarToggles(
    getStatusBarToggles(messages.settings)
  )

  const visibleSections = [
    matchesSettingsSearch(searchQuery, themeEntries) ||
    matchesSettingsSearch(searchQuery, zoomEntries) ||
    matchesSettingsSearch(searchQuery, typographyEntries) ? (
      <section key="interface" className="divide-y divide-border/40">
        {matchesSettingsSearch(searchQuery, themeEntries) ? (
          <SearchableSetting
            title={copy.fields.theme.title}
            description={copy.fields.theme.description}
            keywords={copy.fields.theme.keywords}
          >
            <SettingsRow
              label={copy.fields.theme.title}
              description={copy.fields.theme.description}
              control={
                <SettingsSegmentedControl
                  ariaLabel={copy.fields.theme.title}
                  value={settings.theme}
                  onChange={(option) => {
                    updateSettings({ theme: option })
                    applyTheme(option)
                  }}
                  options={[
                    { value: 'system', label: copy.themeOptions.system },
                    { value: 'dark', label: copy.themeOptions.dark },
                    { value: 'light', label: copy.themeOptions.light }
                  ]}
                />
              }
            />
          </SearchableSetting>
        ) : null}

        {matchesSettingsSearch(searchQuery, zoomEntries) ? (
          <SearchableSetting
            title={copy.fields.uiZoom.title}
            description={copy.fields.uiZoom.description}
            keywords={copy.fields.uiZoom.keywords}
          >
            <SettingsRow
              label={copy.fields.uiZoom.title}
              description={
                <>
                  {copy.fields.uiZoomDescription}{' '}
                  <ShortcutHintList combos={zoomInKeyCombos} unassignedLabel={copy.unassigned} /> /{' '}
                  <ShortcutHintList combos={zoomOutKeyCombos} unassignedLabel={copy.unassigned} />
                </>
              }
              control={<UIZoomControl />}
            />
          </SearchableSetting>
        ) : null}

        {matchesSettingsSearch(searchQuery, typographyEntries) ? (
          <SearchableSetting
            title={copy.fields.ideFont.title}
            description={copy.fields.ideFont.description}
            keywords={copy.fields.ideFont.keywords}
          >
            <SettingsRow
              alignTop
              label={copy.fields.ideFont.title}
              description={copy.fields.ideFont.description}
              control={
                <FontAutocomplete
                  value={settings.appFontFamily}
                  suggestions={fontSuggestions}
                  placeholder={DEFAULT_APP_FONT_FAMILY}
                  onChange={(value) =>
                    updateSettings({ appFontFamily: value.trim() || DEFAULT_APP_FONT_FAMILY })
                  }
                />
              }
            />
          </SearchableSetting>
        ) : null}
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, layoutEntries) ? (
      <section key="layout" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.layout.title}
          description={copy.sections.layout.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.fields.openRightSidebar.title}
            description={copy.fields.openRightSidebar.description}
            keywords={copy.fields.openRightSidebar.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.openRightSidebar.title}
              description={copy.fields.openRightSidebar.description}
              checked={settings.rightSidebarOpenByDefault}
              onChange={() =>
                updateSettings({ rightSidebarOpenByDefault: !settings.rightSidebarOpenByDefault })
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.fields.showGitIgnoredFiles.title}
            description={copy.fields.showGitIgnoredFiles.description}
            keywords={copy.fields.showGitIgnoredFiles.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.showGitIgnoredFiles.title}
              description={copy.fields.showGitIgnoredFilesToggle}
              checked={settings.showGitIgnoredFiles ?? true}
              onChange={() =>
                updateSettings({ showGitIgnoredFiles: !(settings.showGitIgnoredFiles ?? true) })
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, titlebarEntries) ? (
      <section key="titlebar" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.titlebar.title}
          description={copy.sections.titlebar.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.fields.titlebarAppName.title}
            description={copy.fields.titlebarAppName.description}
            keywords={copy.fields.titlebarAppName.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.titlebarAppName.title}
              description={copy.fields.titlebarAppName.description}
              checked={settings.showTitlebarAppName}
              onChange={() =>
                updateSettings({ showTitlebarAppName: !settings.showTitlebarAppName })
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, statusBarEntries) ? (
      <section key="status-bar" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.statusBar.title}
          description={copy.sections.statusBar.description}
        />

        <div className="divide-y divide-border/40">
          {visibleStatusBarToggles.map((toggle) => {
            const enabled = statusBarItems.includes(toggle.id)
            return (
              <SearchableSetting
                key={toggle.id}
                title={toggle.title}
                description={toggle.description}
                keywords={toggle.keywords}
              >
                <SettingsSwitchRow
                  label={toggle.title}
                  description={toggle.toggleDescription}
                  checked={enabled}
                  onChange={() => toggleStatusBarItem(toggle.id)}
                  ariaLabel={toggle.title}
                />
              </SearchableSetting>
            )
          })}
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, sidebarEntries) ? (
      <section key="sidebar" className="space-y-3">
        <SettingsSubsectionHeader title={copy.sections.sidebar} />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.fields.showTasksButton.title}
            description={copy.fields.showTasksButton.description}
            keywords={copy.fields.showTasksButton.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.showTasksButton.title}
              description={copy.fields.showTasksButton.description}
              checked={settings.showTasksButton}
              onChange={() => updateSettings({ showTasksButton: !settings.showTasksButton })}
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.fields.showMobileButton.title}
            description={copy.fields.showMobileButton.description}
            keywords={copy.fields.showMobileButton.keywords}
          >
            <SettingsSwitchRow
              label={copy.fields.showMobileButton.title}
              description={copy.fields.showMobileButtonToggle}
              checked={settings.showMobileButton !== false}
              onChange={() =>
                updateSettings({ showMobileButton: !(settings.showMobileButton !== false) })
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {visibleSections.map((section, index) => (
        <div key={index} className="space-y-6">
          {index > 0 ? <Separator /> : null}
          {section}
        </div>
      ))}
    </div>
  )
}

export { getAppearancePaneSearchEntries }
