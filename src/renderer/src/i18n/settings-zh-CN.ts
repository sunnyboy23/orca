import type { SettingsMessages } from './settings-types'
import { settingsBaseZhCN } from './settings-base-zh-CN'
import { settingsGeneralZhCN } from './settings-general-zh-CN'
import { settingsAppearanceZhCN } from './settings-appearance-zh-CN'

export const zhCNSettingsMessages: SettingsMessages = {
  ...settingsBaseZhCN,
  general: settingsGeneralZhCN,
  appearance: settingsAppearanceZhCN
}
