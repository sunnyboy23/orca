import type { KeybindingActionId, KeybindingDefinition } from '../../../../shared/keybindings'
import { shortcutsEn } from '@/i18n/settings-shortcuts-en'
import type {
  ShortcutActionCopy,
  ShortcutGroupName,
  ShortcutsMessages
} from '@/i18n/settings-shortcuts-types'

export type LocalizedKeybindingDefinition = KeybindingDefinition & {
  localizedTitle: string
  localizedGroup: string
  localizedSearchKeywords: readonly string[]
}

export function getShortcutActionCopy(
  messages: ShortcutsMessages,
  actionId: KeybindingActionId
): ShortcutActionCopy {
  return messages.actions[actionId] ?? shortcutsEn.actions[actionId]
}

export function getShortcutGroupLabel(messages: ShortcutsMessages, group: string): string {
  return messages.groups[group as ShortcutGroupName] ?? group
}

export function localizeKeybindingDefinition(
  definition: KeybindingDefinition,
  messages: ShortcutsMessages
): LocalizedKeybindingDefinition {
  const actionCopy = getShortcutActionCopy(messages, definition.id)
  const localizedGroup = getShortcutGroupLabel(messages, definition.group)
  return {
    ...definition,
    localizedTitle: actionCopy.title,
    localizedGroup,
    localizedSearchKeywords: actionCopy.keywords
  }
}

export function localizeKeybindingDefinitions(
  definitions: readonly KeybindingDefinition[],
  messages: ShortcutsMessages
): LocalizedKeybindingDefinition[] {
  return definitions.map((definition) => localizeKeybindingDefinition(definition, messages))
}

export function localizeShortcutError(message: string, messages: ShortcutsMessages): string {
  if (message === shortcutsEn.errors.invalidShortcutExample) {
    return messages.errors.invalidShortcutExample
  }
  if (message === shortcutsEn.errors.unableToParse) {
    return messages.errors.unableToParse
  }
  return message
}
