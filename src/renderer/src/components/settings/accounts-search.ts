import type { SettingsSearchEntry } from './settings-search'
import { accountsEn } from '@/i18n/settings-accounts-en'
import type { AccountsMessages } from '@/i18n/settings-accounts-types'

export function getAccountsClaudeSearchEntries(
  messages: AccountsMessages = accountsEn
): SettingsSearchEntry[] {
  return [messages.search.claude]
}

export function getAccountsCodexSearchEntries(
  messages: AccountsMessages = accountsEn
): SettingsSearchEntry[] {
  return [messages.search.codex, messages.search.activeCodex]
}

export function getAccountsGeminiSearchEntries(
  messages: AccountsMessages = accountsEn
): SettingsSearchEntry[] {
  return [messages.search.gemini]
}

export function getAccountsOpenCodeSearchEntries(
  messages: AccountsMessages = accountsEn
): SettingsSearchEntry[] {
  return [messages.search.opencodeCookie, messages.search.opencodeWorkspace]
}

export const ACCOUNTS_CLAUDE_SEARCH_ENTRIES = getAccountsClaudeSearchEntries()
export const ACCOUNTS_CODEX_SEARCH_ENTRIES = getAccountsCodexSearchEntries()
export const ACCOUNTS_GEMINI_SEARCH_ENTRIES = getAccountsGeminiSearchEntries()
export const ACCOUNTS_OPENCODE_SEARCH_ENTRIES = getAccountsOpenCodeSearchEntries()

export function getAccountsPaneSearchEntries(
  messages: AccountsMessages = accountsEn
): SettingsSearchEntry[] {
  return [
    ...getAccountsClaudeSearchEntries(messages),
    ...getAccountsCodexSearchEntries(messages),
    ...getAccountsGeminiSearchEntries(messages),
    ...getAccountsOpenCodeSearchEntries(messages)
  ]
}

export const ACCOUNTS_PANE_SEARCH_ENTRIES = getAccountsPaneSearchEntries()
