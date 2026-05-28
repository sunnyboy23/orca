import { enMessages } from './en'
import { zhCNMessages } from './zh-CN'
import type { I18nMessages, SupportedLocale } from './types'

export const DEFAULT_LOCALE: SupportedLocale = 'en'

export const MESSAGES: Record<SupportedLocale, I18nMessages> = {
  en: enMessages,
  'zh-CN': zhCNMessages
}

export function getMessages(locale: SupportedLocale): I18nMessages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
}
