import type { AppLanguage } from '../../../shared/types'
import type { I18nSettings, SupportedLocale } from './types'

const SUPPORTED_LOCALES = new Set<SupportedLocale>(['en', 'zh-CN'])

export function normalizeAppLanguage(value: unknown): AppLanguage {
  return value === 'en' || value === 'zh-CN' || value === 'system' ? value : 'system'
}

export function resolveLocale(
  settings?: I18nSettings | null,
  browserLanguage = getBrowserLanguage()
): SupportedLocale {
  const preference = normalizeAppLanguage(settings?.appLanguage)
  if (isSupportedLocale(preference)) {
    return preference
  }
  return browserLanguage.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

export function isChineseLocale(settings?: I18nSettings | null): boolean {
  return resolveLocale(settings) === 'zh-CN'
}

function isSupportedLocale(value: AppLanguage): value is SupportedLocale {
  return SUPPORTED_LOCALES.has(value as SupportedLocale)
}

function getBrowserLanguage(): string {
  return globalThis.navigator?.language ?? 'en'
}
