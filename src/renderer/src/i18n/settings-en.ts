import type { SettingsMessages } from './settings-types'
import { settingsBaseEn } from './settings-base-en'
import { settingsGeneralEn } from './settings-general-en'
import { settingsAppearanceEn } from './settings-appearance-en'

export const enSettingsMessages: SettingsMessages = {
  ...settingsBaseEn,
  general: settingsGeneralEn,
  appearance: settingsAppearanceEn
}
