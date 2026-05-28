import type { GlobalSettings } from '../../../shared/types'
import { getMessages, isChineseLocale, normalizeAppLanguage, resolveLocale } from '../i18n'
import type { I18nMessages, SupportedLocale } from '../i18n'

export type { SupportedLocale }
export { isChineseLocale, normalizeAppLanguage, resolveLocale }

export const TRANSLATIONS: Record<SupportedLocale, I18nMessages> = {
  en: getMessages('en'),
  'zh-CN': getMessages('zh-CN')
}

export function getZhCopy(settings?: Pick<GlobalSettings, 'appLanguage'> | null): I18nMessages | null {
  return isChineseLocale(settings) ? getMessages('zh-CN') : null
}
