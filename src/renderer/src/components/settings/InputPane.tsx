import type { GlobalSettings } from '../../../../shared/types'
import { Label } from '../ui/label'
import { SearchableSetting } from './SearchableSetting'
import { isDefaultPrimarySelectionMiddleClickPasteUserAgent } from '@/hooks/usePrimarySelectionPaste'
import { useI18n } from '@/i18n'
export { getInputPaneSearchEntries, INPUT_PANE_SEARCH_ENTRIES } from './input-search'

type InputPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

export function InputPane({ settings, updateSettings }: InputPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.input
  const enabled =
    settings.primarySelectionMiddleClickPaste ??
    isDefaultPrimarySelectionMiddleClickPasteUserAgent()

  return (
    <section className="space-y-4">
      <SearchableSetting
        title={copy.middleClickPaste.title}
        description={copy.middleClickPaste.description}
        keywords={copy.middleClickPaste.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.middleClickPaste.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.middleClickPaste.description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() =>
            updateSettings({
              primarySelectionMiddleClickPaste: !enabled
            })
          }
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
            enabled ? 'bg-foreground' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SearchableSetting>
    </section>
  )
}
