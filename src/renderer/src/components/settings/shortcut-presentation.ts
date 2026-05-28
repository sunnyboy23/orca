import {
  KEYBINDING_DEFINITIONS,
  isKeybindingAllowedInTerminal,
  isKeybindingPotentialTerminalConflict,
  keybindingIsActiveInContext,
  type TerminalShortcutPolicy
} from '../../../../shared/keybindings'
import type { ShortcutsMessages } from '@/i18n/settings-shortcuts-types'
import type { ShortcutTerminalStatus } from './ShortcutBindingRow'
import { localizeKeybindingDefinitions, type LocalizedKeybindingDefinition } from './shortcut-copy'

export type ShortcutGroup = {
  title: string
  localizedTitle: string
  items: LocalizedKeybindingDefinition[]
}

export function getLocalizedShortcutGroups(messages: ShortcutsMessages): ShortcutGroup[] {
  return groupDefinitions(localizeKeybindingDefinitions(KEYBINDING_DEFINITIONS, messages))
}

function groupDefinitions(definitions: readonly LocalizedKeybindingDefinition[]): ShortcutGroup[] {
  const groups = new Map<string, LocalizedKeybindingDefinition[]>()
  for (const definition of definitions) {
    groups.set(definition.group, [...(groups.get(definition.group) ?? []), definition])
  }
  return Array.from(groups.entries()).map(([title, items]) => ({
    title,
    localizedTitle: items[0]?.localizedGroup ?? title,
    items
  }))
}

export function getShortcutTerminalStatus(
  definition: LocalizedKeybindingDefinition,
  terminalShortcutPolicy: TerminalShortcutPolicy,
  hasEffectiveBinding: boolean,
  copy: ShortcutsMessages['terminalStatus']
): ShortcutTerminalStatus | undefined {
  if (!hasEffectiveBinding) {
    return undefined
  }
  if (definition.scope === 'terminal') {
    return copy.terminal
  }
  if (isKeybindingAllowedInTerminal(definition)) {
    return copy.terminalActive
  }
  if (!isKeybindingPotentialTerminalConflict(definition)) {
    return undefined
  }
  const activeInTerminal = keybindingIsActiveInContext(definition, {
    context: 'terminal',
    terminalShortcutPolicy
  })
  return activeInTerminal ? copy.orcaFirst : copy.terminalFirst
}
