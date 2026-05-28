import type { Dispatch, SetStateAction } from 'react'
import type { GlobalSettings } from '../../../../shared/types'
import type { EffectiveTerminalAppearance } from '@/lib/terminal-theme'
import { ColorField, ThemePicker } from './SettingsFormControls'
import { SearchableSetting } from './SearchableSetting'
import { TerminalThemePreview } from './TerminalThemePreview'
import type { SettingsTerminalMessages } from '@/i18n/settings-terminal-types'

type ThemePreviewProps = {
  dividerThicknessPx: number
  inactivePaneOpacity: number
  activePaneOpacity: number
}

type DarkTerminalThemeSectionProps = {
  settings: GlobalSettings
  systemPrefersDark: boolean
  themeSearchDark: string
  setThemeSearchDark: Dispatch<SetStateAction<string>>
  updateSettings: (updates: Partial<GlobalSettings>) => void
  previewProps: ThemePreviewProps
  darkPreviewAppearance: EffectiveTerminalAppearance
  copy: SettingsTerminalMessages
}

type LightTerminalThemeSectionProps = {
  settings: GlobalSettings
  themeSearchLight: string
  setThemeSearchLight: Dispatch<SetStateAction<string>>
  updateSettings: (updates: Partial<GlobalSettings>) => void
  previewProps: ThemePreviewProps
  lightPreviewAppearance: EffectiveTerminalAppearance
  copy: SettingsTerminalMessages
}

export function DarkTerminalThemeSection({
  settings,
  systemPrefersDark,
  themeSearchDark,
  setThemeSearchDark,
  updateSettings,
  previewProps,
  darkPreviewAppearance,
  copy
}: DarkTerminalThemeSectionProps): React.JSX.Element {
  const darkThemeCopy = copy.theme.darkTheme
  const darkDividerCopy = copy.theme.darkDivider

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{darkThemeCopy.title}</h3>
          <p className="text-xs text-muted-foreground">{darkThemeCopy.description}</p>
        </div>

        <SearchableSetting
          title={darkThemeCopy.title}
          description={darkThemeCopy.description}
          keywords={darkThemeCopy.keywords}
        >
          <ThemePicker
            label={darkThemeCopy.title}
            description={darkThemeCopy.description ?? ''}
            selectedTheme={settings.terminalThemeDark}
            query={themeSearchDark}
            onQueryChange={setThemeSearchDark}
            onSelectTheme={(theme) => updateSettings({ terminalThemeDark: theme })}
            copy={copy.themePicker}
          />
        </SearchableSetting>

        <SearchableSetting
          title={darkDividerCopy.title}
          description={darkDividerCopy.description}
          keywords={darkDividerCopy.keywords}
        >
          <ColorField
            label={darkDividerCopy.title}
            description={darkDividerCopy.description ?? ''}
            value={settings.terminalDividerColorDark}
            fallback="#3f3f46"
            onChange={(value) => updateSettings({ terminalDividerColorDark: value })}
          />
        </SearchableSetting>
      </div>

      <TerminalThemePreview
        title={copy.theme.darkPreviewTitle}
        description={
          settings.theme === 'system'
            ? copy.theme.systemMode(systemPrefersDark ? copy.theme.mode.dark : copy.theme.mode.light)
            : copy.theme.orcaMode(
                settings.theme === 'dark' ? copy.theme.mode.dark : copy.theme.mode.light
              )
        }
        appearance={darkPreviewAppearance}
        dividerThicknessPx={previewProps.dividerThicknessPx}
        inactivePaneOpacity={previewProps.inactivePaneOpacity}
        activePaneOpacity={previewProps.activePaneOpacity}
      />
    </section>
  )
}

export function LightTerminalThemeSection({
  settings,
  themeSearchLight,
  setThemeSearchLight,
  updateSettings,
  previewProps,
  lightPreviewAppearance,
  copy
}: LightTerminalThemeSectionProps): React.JSX.Element {
  const separateLightCopy = copy.theme.separateLight
  const lightThemeCopy = copy.theme.lightTheme
  const lightDividerCopy = copy.theme.lightDivider

  return (
    <section className="space-y-4">
      <SearchableSetting
        title={separateLightCopy.title}
        description={separateLightCopy.description}
        keywords={separateLightCopy.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{separateLightCopy.title}</p>
          <p className="text-xs text-muted-foreground">{separateLightCopy.description}</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.terminalUseSeparateLightTheme}
          onClick={() =>
            updateSettings({
              terminalUseSeparateLightTheme: !settings.terminalUseSeparateLightTheme
            })
          }
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
            settings.terminalUseSeparateLightTheme ? 'bg-foreground' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              settings.terminalUseSeparateLightTheme ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SearchableSetting>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          settings.terminalUseSeparateLightTheme
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="grid gap-6 pt-2 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{copy.sections.lightTheme.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {copy.sections.lightTheme.description}
                </p>
              </div>

              <SearchableSetting
                title={lightThemeCopy.title}
                description={lightThemeCopy.description}
                keywords={lightThemeCopy.keywords}
              >
                <ThemePicker
                  label={lightThemeCopy.title}
                  description={lightThemeCopy.description ?? ''}
                  selectedTheme={settings.terminalThemeLight}
                  query={themeSearchLight}
                  onQueryChange={setThemeSearchLight}
                  onSelectTheme={(theme) => updateSettings({ terminalThemeLight: theme })}
                  copy={copy.themePicker}
                />
              </SearchableSetting>

              <SearchableSetting
                title={lightDividerCopy.title}
                description={lightDividerCopy.description}
                keywords={lightDividerCopy.keywords}
              >
                <ColorField
                  label={lightDividerCopy.title}
                  description={lightDividerCopy.description ?? ''}
                  value={settings.terminalDividerColorLight}
                  fallback="#d4d4d8"
                  onChange={(value) => updateSettings({ terminalDividerColorLight: value })}
                />
              </SearchableSetting>
            </div>

            <TerminalThemePreview
              title={copy.theme.lightPreviewTitle}
              description={copy.theme.lightPreviewDescription}
              appearance={lightPreviewAppearance}
              dividerThicknessPx={previewProps.dividerThicknessPx}
              inactivePaneOpacity={previewProps.inactivePaneOpacity}
              activePaneOpacity={previewProps.activePaneOpacity}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
