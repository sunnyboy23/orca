import type { SettingsSearchEntry } from './settings-search'
import type { VoiceMessages } from '@/i18n/settings-panes-types'
import { voiceEn } from '@/i18n/settings-panes-en'

export function getVoicePaneSearchEntries(
  messages: VoiceMessages = voiceEn
): SettingsSearchEntry[] {
  return [
    messages.enable,
    {
      title: messages.mode.title,
      description: messages.mode.description,
      keywords: messages.mode.keywords
    },
    messages.model
  ]
}
