import type { SettingsSearchEntry } from './settings-search'
import { integrationsEn } from '@/i18n/settings-integrations-en'
import type { IntegrationsMessages } from '@/i18n/settings-integrations-types'

export function getIntegrationsPaneSearchEntries(
  messages: IntegrationsMessages = integrationsEn
): SettingsSearchEntry[] {
  return [
    messages.search.github,
    messages.search.gitlab,
    messages.search.bitbucket,
    messages.search.azureDevOps,
    messages.search.gitea,
    messages.search.linear
  ]
}

export const INTEGRATIONS_PANE_SEARCH_ENTRIES = getIntegrationsPaneSearchEntries()
