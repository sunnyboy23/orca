/* eslint-disable max-lines -- Why: TerminalPane is the single owner of all terminal settings UI;
   splitting individual settings into separate files would scatter related controls without a
   meaningful abstraction boundary. Mirrors the same decision made for GeneralPane.tsx. */
import { useState } from 'react'
import type React from 'react'
import type { GlobalSettings, SetupScriptLaunchMode } from '../../../../shared/types'
import {
  DEFAULT_TERMINAL_FONT_WEIGHT,
  TERMINAL_FONT_WEIGHT_MAX,
  TERMINAL_FONT_WEIGHT_MIN,
  TERMINAL_FONT_WEIGHT_STEP,
  normalizeTerminalFontWeight
} from '../../../../shared/terminal-fonts'
import {
  fontFamilyHasKnownLigatures,
  resolveTerminalLigaturesEnabled
} from '../../../../shared/terminal-ligatures'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Minus, Plus } from 'lucide-react'
import {
  clampNumber,
  resolveEffectiveTerminalAppearance,
  resolvePaneStyleOptions
} from '@/lib/terminal-theme'
import {
  FontAutocomplete,
  NumberField,
  SettingsRow,
  SettingsSegmentedControl,
  SettingsSubsectionHeader,
  SettingsSwitchRow
} from './SettingsFormControls'
import { SCROLLBACK_PRESETS_MB } from './SettingsConstants'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import { useAppStore } from '../../store'
import { isMacUserAgent, isWindowsUserAgent } from '@/components/terminal-pane/pane-helpers'
import {
  getManageSessionsSearchEntries,
  getTerminalAdvancedSearchEntries,
  getTerminalCursorSearchEntries,
  getTerminalDarkThemeSearchEntries,
  getTerminalLightThemeSearchEntries,
  getTerminalMacOptionSearchEntries,
  getTerminalPaneStyleSearchEntries,
  getTerminalRenderingSearchEntries,
  getTerminalSetupScriptSearchEntries,
  getTerminalTypographySearchEntries,
  getTerminalWindowSearchEntries
} from './terminal-search'
import {
  getTerminalRightClickToPasteSearchEntry,
  getTerminalWindowsPowerShellImplementationSearchEntry,
  getTerminalWindowsShellSearchEntry
} from './terminal-windows-search'
import { useDetectedOptionAsAlt } from '@/lib/keyboard-layout/use-effective-mac-option-as-alt'
import { DarkTerminalThemeSection, LightTerminalThemeSection } from './TerminalThemeSections'
import { TerminalWindowSection } from './TerminalWindowSection'
import { GhosttyImportModal } from './GhosttyImportModal'
import type { UseGhosttyImportReturn } from './useGhosttyImport'
import { ManageSessionsSection } from './ManageSessionsSection'
import { useI18n } from '@/i18n'

type TerminalPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
  systemPrefersDark: boolean
  terminalFontSuggestions: string[]
  scrollbackMode: 'preset' | 'custom'
  setScrollbackMode: (mode: 'preset' | 'custom') => void
  /** Ghostty import modal state + handlers. Lifted to the Settings shell so
   *  the section header can render the trigger button as a headerAction
   *  instead of taking its own row inside the settings list. */
  ghostty: UseGhosttyImportReturn
  /** Whether WSL is installed on this Windows machine. */
  wslAvailable?: boolean
  /** Whether PowerShell 7+ (pwsh.exe) is installed on this Windows machine. */
  pwshAvailable?: boolean
}

export function TerminalPane({
  settings,
  updateSettings,
  systemPrefersDark,
  terminalFontSuggestions,
  scrollbackMode,
  setScrollbackMode,
  ghostty,
  wslAvailable,
  pwshAvailable
}: TerminalPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.terminal
  const searchQuery = useAppStore((state) => state.settingsSearchQuery)
  const isWindows = isWindowsUserAgent()
  const isMac = isMacUserAgent()
  const [themeSearchDark, setThemeSearchDark] = useState('')
  const [themeSearchLight, setThemeSearchLight] = useState('')
  const typographySearchEntries = getTerminalTypographySearchEntries(copy)
  const renderingSearchEntries = getTerminalRenderingSearchEntries(copy)
  const cursorSearchEntries = getTerminalCursorSearchEntries(copy)
  const paneStyleSearchEntries = getTerminalPaneStyleSearchEntries(copy)
  const darkThemeSearchEntries = getTerminalDarkThemeSearchEntries(copy)
  const lightThemeSearchEntries = getTerminalLightThemeSearchEntries(copy)
  const windowSearchEntries = getTerminalWindowSearchEntries(copy)
  const setupScriptSearchEntries = getTerminalSetupScriptSearchEntries(copy)
  const manageSessionsSearchEntries = getManageSessionsSearchEntries(copy)
  const advancedSearchEntries = getTerminalAdvancedSearchEntries(copy)
  const macOptionSearchEntries = getTerminalMacOptionSearchEntries(copy)
  const windowsShellSearchEntry = getTerminalWindowsShellSearchEntry(copy)
  const windowsPowerShellImplementationSearchEntry =
    getTerminalWindowsPowerShellImplementationSearchEntry(copy)
  const rightClickToPasteSearchEntry = getTerminalRightClickToPasteSearchEntry(copy)

  const darkPreviewAppearance = resolveEffectiveTerminalAppearance(
    { ...settings, theme: 'dark' },
    systemPrefersDark
  )
  const lightPreviewAppearance = resolveEffectiveTerminalAppearance(
    { ...settings, theme: 'light' },
    systemPrefersDark
  )
  const paneStyleOptions = resolvePaneStyleOptions(settings)
  const detectedLayout = useDetectedOptionAsAlt()
  const detectedLayoutLabel =
    detectedLayout === 'us'
      ? copy.macOption.detected.us
      : detectedLayout === 'non-us'
        ? copy.macOption.detected.nonUs
        : copy.macOption.detected.unknown
  const scrollbackMb = Math.max(1, Math.round(settings.terminalScrollbackBytes / 1_000_000))
  const isPreset = SCROLLBACK_PRESETS_MB.includes(
    scrollbackMb as (typeof SCROLLBACK_PRESETS_MB)[number]
  )
  const scrollbackToggleValue =
    scrollbackMode === 'custom' ? 'custom' : isPreset ? `${scrollbackMb}` : 'custom'
  const windowsShell = settings.terminalWindowsShell ?? 'powershell.exe'
  const powerShellImplementation = settings.terminalWindowsPowerShellImplementation ?? 'auto'
  const showWindowsPowerShellImplementation = isWindows && windowsShell === 'powershell.exe'

  const visibleSections = [
    isWindows && matchesSettingsSearch(searchQuery, windowsShellSearchEntry) ? (
      <section key="windows-shell" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.windowsShell.title}
          description={copy.sections.windowsShell.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.windowsShell.defaultShell.title}
            description={copy.windowsShell.defaultShell.description}
            keywords={[
              'terminal',
              'windows',
              'shell',
              'powershell',
              'cmd',
              'command prompt',
              'default'
            ]}
          >
            <SettingsRow
              label={copy.windowsShell.defaultShell.title}
              description={copy.windowsShell.defaultShell.rowDescription}
              control={
                <SettingsSegmentedControl
                  ariaLabel={copy.windowsShell.defaultShell.title}
                  value={windowsShell}
                  onChange={(value) => updateSettings({ terminalWindowsShell: value })}
                  options={[
                    { value: 'powershell.exe', label: 'PowerShell' },
                    { value: 'cmd.exe', label: copy.options.commandPrompt },
                    ...(wslAvailable ? [{ value: 'wsl.exe', label: 'WSL' }] : [])
                  ]}
                />
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, typographySearchEntries) ? (
      <section key="typography" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.typography.title}
          description={copy.sections.typography.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.typography.fontSize.title}
            description={copy.typography.fontSize.description}
            keywords={['terminal', 'typography', 'text size']}
          >
            <SettingsRow
              label={copy.typography.fontSize.title}
              description={copy.typography.fontSize.description}
              control={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => {
                      const next = Math.max(10, settings.terminalFontSize - 1)
                      updateSettings({ terminalFontSize: next })
                    }}
                    disabled={settings.terminalFontSize <= 10}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <Input
                    type="number"
                    min={10}
                    max={24}
                    value={settings.terminalFontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10)
                      if (!Number.isNaN(value) && value >= 10 && value <= 24) {
                        updateSettings({ terminalFontSize: value })
                      }
                    }}
                    className="w-14 text-center tabular-nums"
                  />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => {
                      const next = Math.min(24, settings.terminalFontSize + 1)
                      updateSettings({ terminalFontSize: next })
                    }}
                    disabled={settings.terminalFontSize >= 24}
                  >
                    <Plus className="size-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.typography.fontFamily.title}
            description={copy.typography.fontFamily.description}
            keywords={['terminal', 'typography', 'font']}
          >
            <SettingsRow
              alignTop
              label={copy.typography.fontFamily.title}
              description={copy.typography.fontFamily.description}
              control={
                <FontAutocomplete
                  value={settings.terminalFontFamily}
                  suggestions={terminalFontSuggestions}
                  onChange={(value) => updateSettings({ terminalFontFamily: value })}
                  copy={copy.formControls}
                />
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.typography.fontWeight.title}
            description={copy.typography.fontWeight.description}
            keywords={['terminal', 'typography', 'weight']}
          >
            <NumberField
              label={copy.typography.fontWeight.title}
              description={copy.typography.fontWeight.description ?? ''}
              value={normalizeTerminalFontWeight(settings.terminalFontWeight)}
              defaultValue={DEFAULT_TERMINAL_FONT_WEIGHT}
              min={TERMINAL_FONT_WEIGHT_MIN}
              max={TERMINAL_FONT_WEIGHT_MAX}
              step={TERMINAL_FONT_WEIGHT_STEP}
              suffix="100–900"
              defaultValueLabel={copy.formControls.defaultValue}
              onChange={(value) =>
                updateSettings({
                  terminalFontWeight: normalizeTerminalFontWeight(value)
                })
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.typography.lineHeight.title}
            description={copy.typography.lineHeight.description}
            keywords={['terminal', 'typography', 'line height', 'spacing']}
          >
            <NumberField
              label={copy.typography.lineHeight.title}
              description={copy.typography.lineHeight.description ?? ''}
              value={settings.terminalLineHeight}
              defaultValue={1}
              min={1}
              max={3}
              step={0.1}
              suffix="1–3"
              defaultValueLabel={copy.formControls.defaultValue}
              onChange={(value) =>
                updateSettings({
                  terminalLineHeight: clampNumber(value, 1, 3)
                })
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.typography.fontLigatures.title}
            description={copy.typography.fontLigatures.description}
            keywords={[
              'terminal',
              'typography',
              'ligatures',
              'ligature',
              'fira code',
              'jetbrains mono',
              'cascadia code',
              'iosevka',
              'calt',
              'font features'
            ]}
          >
            <SettingsRow
              label={copy.typography.fontLigatures.title}
              description={
                settings.terminalLigatures === 'on'
                  ? copy.ligatures.alwaysOn
                  : settings.terminalLigatures === 'off'
                    ? copy.ligatures.alwaysOff
                    : fontFamilyHasKnownLigatures(settings.terminalFontFamily)
                      ? copy.ligatures.autoEnabled(settings.terminalFontFamily)
                      : copy.ligatures.autoDisabled(
                          settings.terminalFontFamily || copy.ligatures.currentFont
                        )
              }
              control={
                <SettingsSegmentedControl
                  ariaLabel={copy.typography.fontLigatures.title}
                  value={settings.terminalLigatures ?? 'auto'}
                  onChange={(option) => updateSettings({ terminalLigatures: option })}
                  options={[
                    { value: 'auto', label: copy.options.auto },
                    { value: 'on', label: copy.options.on },
                    { value: 'off', label: copy.options.off }
                  ]}
                />
              }
            />
            {/* Why: surface the resolved state explicitly so the "Auto" label
                isn't ambiguous when a user is staring at it. */}
            <p className="sr-only" aria-live="polite">
              {copy.ligatures.liveStatus(
                resolveTerminalLigaturesEnabled(
                  settings.terminalLigatures,
                  settings.terminalFontFamily
                )
              )}
            </p>
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, renderingSearchEntries) ? (
      <section key="rendering" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.rendering.title}
          description={copy.sections.rendering.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.rendering.gpuAcceleration.title}
            description={copy.rendering.gpuAcceleration.description}
            keywords={[
              'terminal',
              'gpu',
              'acceleration',
              'webgl',
              'renderer',
              'rendering',
              'graphics',
              'linux',
              'vscode'
            ]}
          >
            <SettingsRow
              label={copy.rendering.gpuAcceleration.title}
              description={
                settings.terminalGpuAcceleration === 'off'
                  ? copy.gpu.off
                  : settings.terminalGpuAcceleration === 'on'
                    ? copy.gpu.on
                    : copy.gpu.auto
              }
              control={
                <SettingsSegmentedControl
                  ariaLabel={copy.rendering.gpuAcceleration.title}
                  value={settings.terminalGpuAcceleration ?? 'auto'}
                  onChange={(option) => updateSettings({ terminalGpuAcceleration: option })}
                  options={[
                    { value: 'auto', label: copy.options.auto },
                    { value: 'on', label: copy.options.on },
                    { value: 'off', label: copy.options.off }
                  ]}
                />
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, cursorSearchEntries) ? (
      <section key="cursor" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.cursor.title}
          description={copy.sections.cursor.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.cursor.shape.title}
            description={copy.cursor.shape.description}
            keywords={['terminal', 'cursor', 'bar', 'block', 'underline']}
          >
            <SettingsRow
              label={copy.cursor.shape.title}
              description={copy.cursor.shape.description}
              control={
                <SettingsSegmentedControl
                  ariaLabel={copy.cursor.shape.title}
                  value={settings.terminalCursorStyle}
                  onChange={(option) => updateSettings({ terminalCursorStyle: option })}
                  options={[
                    { value: 'bar', label: copy.cursor.options.bar },
                    { value: 'block', label: copy.cursor.options.block },
                    { value: 'underline', label: copy.cursor.options.underline }
                  ]}
                />
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.cursor.blink.title}
            description={copy.cursor.blink.description}
            keywords={['terminal', 'cursor', 'blink']}
          >
            <SettingsSwitchRow
              label={copy.cursor.blink.title}
              description={copy.cursor.blink.description}
              checked={settings.terminalCursorBlink}
              onChange={() =>
                updateSettings({ terminalCursorBlink: !settings.terminalCursorBlink })
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.cursor.opacity.title}
            description={copy.cursor.opacity.description}
            keywords={['terminal', 'cursor', 'opacity', 'transparency']}
          >
            <NumberField
              label={copy.cursor.opacity.title}
              description={copy.cursor.opacity.description ?? ''}
              value={settings.terminalCursorOpacity ?? 1}
              defaultValue={1}
              min={0}
              max={1}
              step={0.05}
              suffix="0–1"
              defaultValueLabel={copy.formControls.defaultValue}
              onChange={(value) =>
                updateSettings({
                  terminalCursorOpacity: clampNumber(value, 0, 1)
                })
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, paneStyleSearchEntries) ||
    (isWindows && matchesSettingsSearch(searchQuery, rightClickToPasteSearchEntry)) ? (
      <section key="pane-styling" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.paneStyling.title}
          description={copy.sections.paneStyling.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.paneStyle.inactivePaneOpacity.title}
            description={copy.paneStyle.inactivePaneOpacity.description}
            keywords={['pane', 'opacity', 'dimming']}
          >
            <NumberField
              label={copy.paneStyle.inactivePaneOpacity.title}
              description={copy.paneStyle.inactivePaneOpacity.description ?? ''}
              value={paneStyleOptions.inactivePaneOpacity}
              defaultValue={0.8}
              min={0}
              max={1}
              step={0.05}
              suffix="0–1"
              defaultValueLabel={copy.formControls.defaultValue}
              onChange={(value) =>
                updateSettings({
                  terminalInactivePaneOpacity: clampNumber(value, 0, 1)
                })
              }
            />
          </SearchableSetting>
          <SearchableSetting
            title={copy.paneStyle.dividerThickness.title}
            description={copy.paneStyle.dividerThickness.description}
            keywords={['pane', 'divider', 'thickness']}
          >
            <NumberField
              label={copy.paneStyle.dividerThickness.title}
              description={copy.paneStyle.dividerThickness.description ?? ''}
              value={paneStyleOptions.dividerThicknessPx}
              defaultValue={1}
              min={1}
              max={32}
              step={1}
              suffix="px"
              defaultValueLabel={copy.formControls.defaultValue}
              onChange={(value) =>
                updateSettings({
                  terminalDividerThicknessPx: clampNumber(value, 1, 32)
                })
              }
            />
          </SearchableSetting>

          {/* Why: the Windows-only right-click toggle lives in this section, so the
              section must also match that search term or settings search would hide
              the control even though it is present. */}
          {isWindows &&
            matchesSettingsSearch(searchQuery, rightClickToPasteSearchEntry) && (
              <SearchableSetting
                title={copy.windowsShell.rightClickToPaste.title}
                description={copy.windowsShell.rightClickToPaste.description}
                keywords={['terminal', 'windows', 'right click', 'paste', 'context menu']}
              >
                <SettingsSwitchRow
                  label={copy.windowsShell.rightClickToPaste.title}
                  description={copy.windowsShell.rightClickToPaste.rowDescription}
                  checked={settings.terminalRightClickToPaste}
                  onChange={() =>
                    updateSettings({
                      terminalRightClickToPaste: !settings.terminalRightClickToPaste
                    })
                  }
                />
              </SearchableSetting>
            )}

          <SearchableSetting
            title={copy.paneStyle.focusFollowsMouse.title}
            description={copy.paneStyle.focusFollowsMouse.description}
            keywords={['focus', 'follows', 'mouse', 'hover', 'pane', 'ghostty', 'active']}
          >
            <SettingsSwitchRow
              label={copy.paneStyle.focusFollowsMouse.title}
              description={copy.paneStyle.focusFollowsMouse.description}
              checked={settings.terminalFocusFollowsMouse}
              onChange={() =>
                updateSettings({
                  terminalFocusFollowsMouse: !settings.terminalFocusFollowsMouse
                })
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.paneStyle.copyOnSelect.title}
            description={copy.paneStyle.copyOnSelect.description}
            keywords={[
              'clipboard',
              'copy',
              'select',
              'selection',
              'auto',
              'automatic',
              'x11',
              'linux',
              'gnome',
              'paste'
            ]}
          >
            <SettingsSwitchRow
              label={copy.paneStyle.copyOnSelect.title}
              description={copy.paneStyle.copyOnSelect.description}
              checked={settings.terminalClipboardOnSelect}
              onChange={() =>
                updateSettings({
                  terminalClipboardOnSelect: !settings.terminalClipboardOnSelect
                })
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.paneStyle.osc52.title}
            description={copy.paneStyle.osc52.description}
            keywords={[
              'osc 52',
              'osc52',
              'clipboard',
              'tmux',
              'neovim',
              'nvim',
              'fzf',
              'ssh',
              'remote',
              'copy',
              'paste'
            ]}
          >
            <SettingsSwitchRow
              label={copy.paneStyle.osc52.title}
              description={copy.paneStyle.osc52.rowDescription}
              checked={settings.terminalAllowOsc52Clipboard}
              onChange={() =>
                updateSettings({
                  terminalAllowOsc52Clipboard: !settings.terminalAllowOsc52Clipboard
                })
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, windowSearchEntries) ? (
      <TerminalWindowSection
        key="window"
        settings={settings}
        updateSettings={updateSettings}
        copy={copy}
      />
    ) : null,
    matchesSettingsSearch(searchQuery, darkThemeSearchEntries) ? (
      <DarkTerminalThemeSection
        key="dark-theme"
        settings={settings}
        systemPrefersDark={systemPrefersDark}
        themeSearchDark={themeSearchDark}
        setThemeSearchDark={setThemeSearchDark}
        updateSettings={updateSettings}
        previewProps={paneStyleOptions}
        darkPreviewAppearance={darkPreviewAppearance}
        copy={copy}
      />
    ) : null,
    matchesSettingsSearch(searchQuery, lightThemeSearchEntries) ? (
      <LightTerminalThemeSection
        key="light-theme"
        settings={settings}
        themeSearchLight={themeSearchLight}
        setThemeSearchLight={setThemeSearchLight}
        updateSettings={updateSettings}
        previewProps={paneStyleOptions}
        lightPreviewAppearance={lightPreviewAppearance}
        copy={copy}
      />
    ) : null,
    matchesSettingsSearch(searchQuery, setupScriptSearchEntries) ? (
      <section key="setup-script" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.setupScript.title}
          description={copy.sections.setupScript.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.setupScript.location.title}
            description={copy.setupScript.location.description}
            keywords={[
              'setup',
              'script',
              'workspace',
              'split',
              'horizontal',
              'vertical',
              'tab',
              'new',
              'location',
              'launch'
            ]}
          >
            <SettingsRow
              label={copy.setupScript.location.title}
              description={copy.setupScript.location.rowDescription}
              control={
                <ToggleGroup
                  type="single"
                  value={settings.setupScriptLaunchMode}
                  onValueChange={(value) => {
                    if (!value) {
                      return
                    }
                    updateSettings({
                      setupScriptLaunchMode: value as SetupScriptLaunchMode
                    })
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 flex-wrap"
                >
                  <ToggleGroupItem
                    value="new-tab"
                    className="h-8 px-3 text-xs"
                    aria-label={copy.setupScript.options.newTabAria}
                  >
                    {copy.setupScript.options.newTab}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="split-vertical"
                    className="h-8 px-3 text-xs"
                    aria-label={copy.setupScript.options.splitVerticallyAria}
                  >
                    {copy.setupScript.options.splitVertically}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="split-horizontal"
                    className="h-8 px-3 text-xs"
                    aria-label={copy.setupScript.options.splitHorizontallyAria}
                  >
                    {copy.setupScript.options.splitHorizontally}
                  </ToggleGroupItem>
                </ToggleGroup>
              }
            />
          </SearchableSetting>
        </div>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, manageSessionsSearchEntries) ? (
      <ManageSessionsSection key="manage-sessions" copy={copy} />
    ) : null,
    matchesSettingsSearch(searchQuery, advancedSearchEntries) ||
    (showWindowsPowerShellImplementation &&
      matchesSettingsSearch(searchQuery, windowsPowerShellImplementationSearchEntry)) ||
    (isMac && matchesSettingsSearch(searchQuery, macOptionSearchEntries)) ? (
      <section key="advanced" className="space-y-3">
        <SettingsSubsectionHeader
          title={copy.sections.advanced.title}
          description={copy.sections.advanced.description}
        />

        <div className="divide-y divide-border/40">
          <SearchableSetting
            title={copy.advanced.scrollback.title}
            description={copy.advanced.scrollback.description}
            keywords={['terminal', 'scrollback', 'buffer', 'memory']}
          >
            <SettingsRow
              alignTop={scrollbackMode === 'custom'}
              label={copy.advanced.scrollback.title}
              description={copy.advanced.scrollback.rowDescription}
              control={
                <div className="flex flex-col items-end gap-2">
                  <ToggleGroup
                    type="single"
                    value={scrollbackToggleValue}
                    onValueChange={(value) => {
                      if (!value) {
                        return
                      }
                      if (value === 'custom') {
                        setScrollbackMode('custom')
                        return
                      }

                      setScrollbackMode('preset')
                      updateSettings({
                        terminalScrollbackBytes: Number(value) * 1_000_000
                      })
                    }}
                    variant="outline"
                    size="sm"
                    className="h-8 flex-wrap justify-end"
                  >
                    {SCROLLBACK_PRESETS_MB.map((preset) => (
                      <ToggleGroupItem
                        key={preset}
                        value={`${preset}`}
                        className="h-8 px-3 text-xs"
                        aria-label={`${preset} megabytes`}
                      >
                        {preset} MB
                      </ToggleGroupItem>
                    ))}
                    <ToggleGroupItem
                      value="custom"
                      className="h-8 px-3 text-xs"
                      aria-label={copy.options.custom}
                    >
                      {copy.options.custom}
                    </ToggleGroupItem>
                  </ToggleGroup>
                  {scrollbackMode === 'custom' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={256}
                        step={1}
                        value={scrollbackMb}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (Number.isFinite(value)) {
                            updateSettings({
                              terminalScrollbackBytes: clampNumber(value, 1, 256) * 1_000_000
                            })
                          }
                        }}
                        className="number-input-clean w-24 tabular-nums"
                      />
                      <span className="text-xs text-muted-foreground">MB</span>
                    </div>
                  ) : null}
                </div>
              }
            />
          </SearchableSetting>

          <SearchableSetting
            title={copy.advanced.wordSeparators.title}
            description={copy.advanced.wordSeparators.description}
            keywords={['word', 'separator', 'boundary', 'double-click', 'selection']}
          >
            <SettingsRow
              label={copy.advanced.wordSeparators.title}
              description={copy.advanced.wordSeparators.description}
              control={
                <Input
                  value={settings.terminalWordSeparator ?? ''}
                  onChange={(e) => {
                    const value = e.target.value
                    updateSettings({ terminalWordSeparator: value || undefined })
                  }}
                  placeholder={` ()[]{},'"\``}
                  className="w-56 font-mono text-xs"
                />
              }
            />
          </SearchableSetting>

          {showWindowsPowerShellImplementation &&
          matchesSettingsSearch(
            searchQuery,
            windowsPowerShellImplementationSearchEntry
          ) ? (
            <SearchableSetting
              title={copy.windowsShell.powerShellVersion.title}
              description={copy.windowsShell.powerShellVersion.description}
              keywords={[
                'terminal',
                'windows',
                'powershell',
                'pwsh',
                'powershell 7',
                'windows powershell',
                'version',
                'advanced'
              ]}
            >
              <SettingsRow
                alignTop
                label={copy.windowsShell.powerShellVersion.title}
                description={
                  pwshAvailable ? (
                    copy.windowsShell.powerShellVersion.rowDescription
                  ) : (
                    <>
                      {copy.windowsShell.powerShellVersion.autoFallback}{' '}
                      <a
                        href="https://github.com/PowerShell/PowerShell/releases/latest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        {copy.windowsShell.powerShellVersion.downloadPowerShell}
                      </a>
                      .
                    </>
                  )
                }
                control={
                  <SettingsSegmentedControl
                    ariaLabel={copy.windowsShell.powerShellVersion.title}
                    value={powerShellImplementation}
                    onChange={(value) =>
                      updateSettings({ terminalWindowsPowerShellImplementation: value })
                    }
                    options={[
                      { value: 'auto', label: copy.options.auto },
                      { value: 'powershell.exe', label: 'Windows PowerShell' },
                      { value: 'pwsh.exe', label: 'PowerShell 7+', disabled: !pwshAvailable }
                    ]}
                  />
                }
              />
            </SearchableSetting>
          ) : null}

          {isMac ? (
            <SearchableSetting
              title={copy.macOption.optionAsAlt.title}
              description={copy.macOption.optionAsAlt.description}
              keywords={[
                'terminal',
                'option',
                'alt',
                'key',
                'meta',
                'compose',
                'mac',
                'macos',
                'keyboard',
                'german',
                'international',
                'readline',
                'ghostty'
              ]}
            >
              <SettingsRow
                alignTop
                label={copy.macOption.optionAsAlt.title}
                description={
                  settings.terminalMacOptionAsAlt === 'auto'
                    ? copy.macOption.autoDetected(detectedLayoutLabel)
                    : settings.terminalMacOptionAsAlt === 'false'
                      ? copy.macOption.offDescription
                      : settings.terminalMacOptionAsAlt === 'true'
                        ? copy.macOption.bothDescription
                        : copy.macOption.singleDescription(settings.terminalMacOptionAsAlt)
                }
                control={
                  <SettingsSegmentedControl
                    ariaLabel={copy.macOption.optionAsAlt.title}
                    value={settings.terminalMacOptionAsAlt}
                    onChange={(option) => updateSettings({ terminalMacOptionAsAlt: option })}
                    options={[
                      { value: 'auto', label: copy.options.auto },
                      { value: 'true', label: copy.options.both },
                      { value: 'left', label: copy.options.left },
                      { value: 'right', label: copy.options.right },
                      { value: 'false', label: copy.options.off }
                    ]}
                  />
                }
              />
            </SearchableSetting>
          ) : null}
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
      <GhosttyImportModal
        open={ghostty.open}
        onOpenChange={ghostty.handleOpenChange}
        preview={ghostty.preview}
        loading={ghostty.loading}
        onApply={ghostty.handleApply}
        applied={ghostty.applied}
        applyError={ghostty.applyError}
      />
    </div>
  )
}
