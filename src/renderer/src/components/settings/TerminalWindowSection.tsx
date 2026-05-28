import { useEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import type { GlobalSettings, TerminalColorOverrides } from '../../../../shared/types'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { ColorField, NumberField } from './SettingsFormControls'
import { SearchableSetting } from './SearchableSetting'
import { clampNumber } from '@/lib/terminal-theme'
import type { SettingsTerminalMessages } from '@/i18n/settings-terminal-types'

type TerminalWindowSectionProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
  copy: SettingsTerminalMessages
}

const COLOR_OVERRIDE_GROUP_KEYS: {
  group: keyof SettingsTerminalMessages['window']['colorOverrideGroups']
  keys: (keyof TerminalColorOverrides)[]
}[] = [
  {
    group: 'base',
    keys: [
      'foreground',
      'background',
      'cursor',
      'cursorAccent',
      'selectionBackground',
      'selectionForeground',
      'bold'
    ]
  },
  {
    group: 'ansiNormal',
    keys: ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
  },
  {
    group: 'ansiBright',
    keys: [
      'brightBlack',
      'brightRed',
      'brightGreen',
      'brightYellow',
      'brightBlue',
      'brightMagenta',
      'brightCyan',
      'brightWhite'
    ]
  }
]

export function TerminalWindowSection({
  settings,
  updateSettings,
  copy
}: TerminalWindowSectionProps): React.JSX.Element {
  const windowCopy = copy.window
  const [colorOverridesExpanded, setColorOverridesExpanded] = useState(false)
  // Why: windowBackgroundBlur is only read by createMainWindow() at startup
  // (macOS vibrancy / Windows acrylic both require window creation options),
  // so the UI has to ask the user to restart for the change to take effect.
  // Snapshot the value on first render and compare to the live setting to
  // show a "Restart required" banner only when they differ.
  const blurAtMountRef = useRef<boolean>(settings.windowBackgroundBlur ?? false)
  const blurPendingRestart = (settings.windowBackgroundBlur ?? false) !== blurAtMountRef.current
  const [relaunchingBlur, setRelaunchingBlur] = useState(false)

  // Why: the mount-time snapshot captures local state, not main-process state.
  // If the setting is persisted and read correctly on next boot we never need
  // to re-snapshot, but tests mount the component with arbitrary initial
  // values — keep `blurAtMountRef` honest if the settings load asynchronously
  // and the value arrives after mount.
  useEffect(() => {
    blurAtMountRef.current = settings.windowBackgroundBlur ?? false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRelaunch = async (): Promise<void> => {
    if (relaunchingBlur) {
      return
    }
    setRelaunchingBlur(true)
    try {
      await window.api.app.relaunch()
    } catch {
      setRelaunchingBlur(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{copy.sections.window.title}</h3>
        <p className="text-xs text-muted-foreground">{copy.sections.window.description}</p>
      </div>

      <SearchableSetting
        title={windowCopy.backgroundOpacity.title}
        description={windowCopy.backgroundOpacity.description}
        keywords={windowCopy.backgroundOpacity.keywords}
      >
        <NumberField
          label={windowCopy.backgroundOpacity.title}
          description={windowCopy.backgroundOpacity.rowDescription}
          value={settings.terminalBackgroundOpacity ?? 1}
          defaultValue={1}
          min={0}
          max={1}
          step={0.05}
          suffix="0 to 1"
          defaultValueLabel={copy.formControls.defaultValue}
          onChange={(value) =>
            updateSettings({ terminalBackgroundOpacity: clampNumber(value, 0, 1) })
          }
        />
      </SearchableSetting>

      <SearchableSetting
        title={windowCopy.blur.title}
        description={windowCopy.blur.description}
        keywords={windowCopy.blur.keywords}
        className="space-y-3 py-2"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label>{windowCopy.blur.title}</Label>
            <p className="text-xs text-muted-foreground">{windowCopy.blur.description}</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.windowBackgroundBlur ?? false}
            onClick={() => updateSettings({ windowBackgroundBlur: !settings.windowBackgroundBlur })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
              (settings.windowBackgroundBlur ?? false) ? 'bg-foreground' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
                (settings.windowBackgroundBlur ?? false) ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {blurPendingRestart ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-yellow-500/50 bg-yellow-500/10 px-3 py-2.5">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                {windowCopy.restartRequired}
              </p>
              <p className="text-xs text-muted-foreground">{windowCopy.restartDescription}</p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="shrink-0 gap-1.5"
              disabled={relaunchingBlur}
              onClick={() => void handleRelaunch()}
            >
              <RotateCw className={`size-3 ${relaunchingBlur ? 'animate-spin' : ''}`} />
              {relaunchingBlur ? windowCopy.restarting : windowCopy.restartNow}
            </Button>
          </div>
        ) : null}
      </SearchableSetting>

      <SearchableSetting
        title={windowCopy.horizontalPadding.title}
        description={windowCopy.horizontalPadding.description}
        keywords={windowCopy.horizontalPadding.keywords}
      >
        <NumberField
          label={windowCopy.horizontalPadding.title}
          description={windowCopy.horizontalPadding.description ?? ''}
          value={settings.terminalPaddingX ?? 4}
          defaultValue={4}
          min={0}
          max={512}
          step={1}
          suffix="px"
          defaultValueLabel={copy.formControls.defaultValue}
          onChange={(value) => updateSettings({ terminalPaddingX: Math.max(0, value) })}
        />
      </SearchableSetting>

      <SearchableSetting
        title={windowCopy.verticalPadding.title}
        description={windowCopy.verticalPadding.description}
        keywords={windowCopy.verticalPadding.keywords}
      >
        <NumberField
          label={windowCopy.verticalPadding.title}
          description={windowCopy.verticalPadding.description ?? ''}
          value={settings.terminalPaddingY ?? 4}
          defaultValue={4}
          min={0}
          max={512}
          step={1}
          suffix="px"
          defaultValueLabel={copy.formControls.defaultValue}
          onChange={(value) => updateSettings({ terminalPaddingY: Math.max(0, value) })}
        />
      </SearchableSetting>

      <SearchableSetting
        title={windowCopy.hideMouse.title}
        description={windowCopy.hideMouse.description}
        keywords={windowCopy.hideMouse.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{windowCopy.hideMouse.title}</Label>
          <p className="text-xs text-muted-foreground">{windowCopy.hideMouse.description}</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.terminalMouseHideWhileTyping ?? false}
          onClick={() =>
            updateSettings({
              terminalMouseHideWhileTyping: !settings.terminalMouseHideWhileTyping
            })
          }
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
            (settings.terminalMouseHideWhileTyping ?? false)
              ? 'bg-foreground'
              : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              (settings.terminalMouseHideWhileTyping ?? false) ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SearchableSetting>

      <SearchableSetting
        title={windowCopy.colorOverrides.title}
        description={windowCopy.colorOverrides.description}
        keywords={windowCopy.colorOverrides.keywords}
        className="space-y-3"
      >
        <div className="space-y-2">
          <button
            onClick={() => setColorOverridesExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span className={`transition-transform ${colorOverridesExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            {windowCopy.colorOverrides.title}
          </button>
          <div
            className={`grid overflow-hidden transition-all duration-300 ease-out ${
              colorOverridesExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="min-h-0 space-y-4">
              {COLOR_OVERRIDE_GROUP_KEYS.map((group) => (
                <div key={group.group} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {windowCopy.colorOverrideGroups[group.group]}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.keys.map((key) => (
                      <ColorField
                        key={key}
                        label={windowCopy.colorFields[key].label}
                        description={windowCopy.colorFields[key].description}
                        value={settings.terminalColorOverrides?.[key] ?? ''}
                        fallback=""
                        onChange={(value) =>
                          updateSettings({
                            terminalColorOverrides: {
                              ...settings.terminalColorOverrides,
                              [key]: value || undefined
                            }
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSettings({ terminalColorOverrides: undefined })}
              >
                {windowCopy.resetColorOverrides}
              </Button>
            </div>
          </div>
        </div>
      </SearchableSetting>
    </section>
  )
}
