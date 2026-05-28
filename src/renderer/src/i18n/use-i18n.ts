import { useMemo } from 'react'
import { useAppStore } from '../store'
import { getMessages } from './messages'
import { resolveLocale } from './locale'
import type { I18nMessages, SupportedLocale } from './types'

export type I18nContextValue = {
  locale: SupportedLocale
  messages: I18nMessages
}

export function useI18n(): I18nContextValue {
  const settings = useAppStore((state) => state.settings)
  const locale = resolveLocale(settings)
  return useMemo(
    () => ({
      locale,
      messages: getMessages(locale)
    }),
    [locale]
  )
}
