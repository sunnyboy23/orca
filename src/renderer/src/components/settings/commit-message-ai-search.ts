import type { SettingsSearchEntry } from './settings-search'
import { commitMessageAiEn } from '@/i18n/settings-commit-message-ai-en'
import type { CommitMessageAiMessages } from '@/i18n/settings-panes-types'

export function getCommitMessageAiPaneSearchEntries(
  messages: CommitMessageAiMessages = commitMessageAiEn
): SettingsSearchEntry[] {
  return [
    messages.enable,
    messages.agent,
    messages.model,
    messages.thinking,
    messages.customPrompt,
    messages.customCommand
  ]
}

export const COMMIT_MESSAGE_AI_PANE_SEARCH_ENTRIES = getCommitMessageAiPaneSearchEntries()
