import React, { useMemo, useState } from 'react'
import type { CtrlTabOrderMode } from '../../../../shared/types'
import {
  findKeybindingConflicts,
  formatKeybindingList,
  getEffectiveKeybindingsForAction,
  keybindingFromInputForAction,
  normalizeKeybindingListForAction,
  type KeybindingActionId,
  type KeybindingInput,
  type KeybindingOverrides,
  type TerminalShortcutPolicy
} from '../../../../shared/keybindings'
import { useI18n } from '@/i18n'
import { useAppStore } from '../../store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { KeybindingsFileActions } from './KeybindingsFileActions'
import { SearchableSetting } from './SearchableSetting'
import { SettingsRow, SettingsSubsectionHeader } from './SettingsFormControls'
import { ShortcutBindingRow } from './ShortcutBindingRow'
import { matchesSettingsSearch, type SettingsSearchEntry } from './settings-search'
import {
  SHORTCUTS_PANE_SEARCH_ENTRIES,
  getCtrlTabBehaviorSearchEntry,
  getTerminalShortcutPolicySearchEntry
} from './shortcuts-search'
import { getShortcutActionCopy, localizeShortcutError } from './shortcut-copy'
import { getLocalizedShortcutGroups, getShortcutTerminalStatus } from './shortcut-presentation'
export { SHORTCUTS_PANE_SEARCH_ENTRIES }

const isMac = navigator.userAgent.includes('Mac')
const platform: NodeJS.Platform = isMac
  ? 'darwin'
  : navigator.userAgent.includes('Windows')
    ? 'win32'
    : 'linux'

function sameBindings(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((binding, index) => binding === b[index])
}

function hasOwnBindingOverride(
  overrides: KeybindingOverrides,
  actionId: KeybindingActionId
): boolean {
  return Object.prototype.hasOwnProperty.call(overrides, actionId)
}

function removeBindingOverride(
  overrides: KeybindingOverrides,
  actionId: KeybindingActionId
): KeybindingOverrides {
  const next = { ...overrides }
  delete next[actionId]
  return next
}

function hasCommonBindingOverride(
  snapshot: ReturnType<typeof useAppStore.getState>['keybindingSnapshot'],
  actionId: KeybindingActionId
): boolean {
  return hasOwnBindingOverride(snapshot?.commonOverrides ?? {}, actionId)
}

export function ShortcutsPane(): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.shortcuts
  const searchQuery = useAppStore((state) => state.settingsSearchQuery)
  const ctrlTabOrderMode = useAppStore((state) => state.settings?.ctrlTabOrderMode ?? 'mru')
  const terminalShortcutPolicy = useAppStore(
    (state) => state.settings?.terminalShortcutPolicy ?? 'orca-first'
  )
  const updateSettings = useAppStore((state) => state.updateSettings)
  const keybindings = useAppStore((state) => state.keybindings)
  const keybindingSnapshot = useAppStore((state) => state.keybindingSnapshot)
  const setKeybindingOverride = useAppStore((state) => state.setKeybindingOverride)
  const resetKeybindingOverride = useAppStore((state) => state.resetKeybindingOverride)
  const disableKeybindingAction = useAppStore((state) => state.disableKeybindingAction)
  const [errors, setErrors] = useState<Partial<Record<KeybindingActionId, string>>>({})
  const [recordingActionId, setRecordingActionId] = useState<KeybindingActionId | null>(null)

  const groups = useMemo(() => getLocalizedShortcutGroups(copy), [copy])
  const terminalPolicySearchEntry = useMemo(
    () => getTerminalShortcutPolicySearchEntry(copy),
    [copy]
  )
  const ctrlTabSearchEntry = useMemo(() => getCtrlTabBehaviorSearchEntry(copy), [copy])
  const groupEntries = useMemo<Record<string, SettingsSearchEntry[]>>(
    () =>
      Object.fromEntries(
        groups.map((group) => [
          group.title,
          group.items.map((item) => ({
            title: item.localizedTitle,
            description: copy.search.actionDescription(group.localizedTitle),
            keywords: [...item.localizedSearchKeywords]
          }))
        ])
      ),
    [copy, groups]
  )
  const conflictByAction = useMemo(() => {
    const result = new Map<KeybindingActionId, string[]>()
    for (const conflict of findKeybindingConflicts(platform, keybindings)) {
      const labels = conflict.actionIds
        .map((id) => getShortcutActionCopy(copy, id).title)
        .join(', ')
      for (const actionId of conflict.actionIds) {
        result.set(actionId, [
          ...(result.get(actionId) ?? []),
          copy.errors.conflict(formatKeybindingList([conflict.binding], platform), labels)
        ])
      }
    }
    return result
  }, [copy, keybindings])

  const saveBindings = async (
    actionId: KeybindingActionId,
    normalized: string[]
  ): Promise<boolean> => {
    const normalizedResult = normalizeKeybindingListForAction(actionId, normalized.join(', '))
    if (!Array.isArray(normalizedResult)) {
      setErrors((prev) => ({
        ...prev,
        [actionId]: normalizedResult.ok
          ? copy.errors.unableToParse
          : localizeShortcutError(normalizedResult.error, copy)
      }))
      return false
    }

    const defaults = getEffectiveKeybindingsForAction(actionId, platform, {})
    const next =
      sameBindings(normalizedResult, defaults) ||
      (normalizedResult.length === 0 && defaults.length === 0)
        ? removeBindingOverride(keybindings, actionId)
        : { ...keybindings, [actionId]: normalizedResult }
    const blockingConflict = findKeybindingConflicts(platform, next).find((conflict) =>
      conflict.actionIds.includes(actionId)
    )
    if (blockingConflict) {
      const labels = blockingConflict.actionIds
        .filter((id) => id !== actionId)
        .map((id) => getShortcutActionCopy(copy, id).title)
        .join(', ')
      setErrors((prev) => ({
        ...prev,
        [actionId]: copy.errors.conflict(
          formatKeybindingList([blockingConflict.binding], platform),
          labels
        )
      }))
      return false
    }

    setErrors((prev) => ({ ...prev, [actionId]: undefined }))
    try {
      const matchesDefault =
        sameBindings(normalizedResult, defaults) ||
        (normalizedResult.length === 0 && defaults.length === 0)
      await (matchesDefault && !hasCommonBindingOverride(keybindingSnapshot, actionId)
        ? resetKeybindingOverride(actionId)
        : setKeybindingOverride(actionId, normalizedResult))
      return true
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [actionId]: error instanceof Error ? error.message : copy.errors.saveFailed
      }))
      return false
    }
  }

  const captureBinding = async (
    actionId: KeybindingActionId,
    input: KeybindingInput
  ): Promise<void> => {
    const captured = keybindingFromInputForAction(actionId, input, platform)
    if (!captured.ok) {
      setErrors((prev) => ({ ...prev, [actionId]: localizeShortcutError(captured.error, copy) }))
      return
    }

    // Why: the visual editor records one chord at a time; users can still
    // manage multi-binding arrays directly in keybindings.json.
    if (await saveBindings(actionId, [captured.value])) {
      setRecordingActionId(null)
    }
  }

  const resetBinding = async (actionId: KeybindingActionId): Promise<void> => {
    setErrors((prev) => ({ ...prev, [actionId]: undefined }))
    try {
      await (hasCommonBindingOverride(keybindingSnapshot, actionId)
        ? setKeybindingOverride(actionId, getEffectiveKeybindingsForAction(actionId, platform, {}))
        : resetKeybindingOverride(actionId))
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [actionId]: error instanceof Error ? error.message : copy.errors.resetFailed
      }))
    }
  }

  const disableBinding = async (actionId: KeybindingActionId): Promise<void> => {
    setErrors((prev) => ({ ...prev, [actionId]: undefined }))
    try {
      await disableKeybindingAction(actionId)
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [actionId]: error instanceof Error ? error.message : copy.errors.disableFailed
      }))
    }
  }

  const clearError = (actionId: KeybindingActionId): void => {
    setErrors((prev) => ({ ...prev, [actionId]: undefined }))
  }

  const showPolicy = matchesSettingsSearch(searchQuery, terminalPolicySearchEntry)
  const showCtrlTab = matchesSettingsSearch(searchQuery, ctrlTabSearchEntry)

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SettingsSubsectionHeader title={copy.header.title} description={copy.header.description} />

        {showPolicy || showCtrlTab ? (
          <div className="divide-y divide-border/40">
            {showPolicy ? (
              <SearchableSetting
                id="terminal-shortcut-policy"
                title={copy.terminalPolicy.title}
                description={copy.terminalPolicy.description}
                keywords={terminalPolicySearchEntry.keywords}
              >
                <SettingsRow
                  label={copy.terminalPolicy.title}
                  description={copy.terminalPolicy.detail}
                  control={
                    <Select
                      value={terminalShortcutPolicy}
                      onValueChange={(value) =>
                        void updateSettings({
                          terminalShortcutPolicy: value as TerminalShortcutPolicy
                        })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orca-first">{copy.terminalPolicy.orcaFirst}</SelectItem>
                        <SelectItem value="terminal-first">
                          {copy.terminalPolicy.terminalFirst}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
              </SearchableSetting>
            ) : null}

            {showCtrlTab ? (
              <SearchableSetting
                title={copy.ctrlTab.title}
                description={copy.ctrlTab.description}
                keywords={ctrlTabSearchEntry.keywords}
              >
                <SettingsRow
                  label={copy.ctrlTab.title}
                  description={copy.ctrlTab.detail}
                  control={
                    <Select
                      value={ctrlTabOrderMode}
                      onValueChange={(value) =>
                        void updateSettings({ ctrlTabOrderMode: value as CtrlTabOrderMode })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mru">{copy.ctrlTab.mostRecent}</SelectItem>
                        <SelectItem value="sequential">{copy.ctrlTab.tabStripOrder}</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
              </SearchableSetting>
            ) : null}
          </div>
        ) : null}

        <KeybindingsFileActions />

        <div className="grid gap-8">
          {groups
            .filter((group) => matchesSettingsSearch(searchQuery, groupEntries[group.title] ?? []))
            .map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="border-b border-border/50 pb-2 text-sm font-medium text-muted-foreground">
                  {group.localizedTitle}
                </h3>
                <div className="grid gap-2">
                  {group.items.map((item) => {
                    const effective = getEffectiveKeybindingsForAction(
                      item.id,
                      platform,
                      keybindings
                    )
                    const modified = hasOwnBindingOverride(keybindings, item.id)
                    const warnings = conflictByAction.get(item.id) ?? []
                    const terminalStatus = getShortcutTerminalStatus(
                      item,
                      terminalShortcutPolicy,
                      effective.length > 0,
                      copy.terminalStatus
                    )

                    return (
                      <ShortcutBindingRow
                        key={item.id}
                        item={item}
                        groupTitle={copy.search.actionDescription(group.localizedTitle)}
                        copy={copy.row}
                        platform={platform}
                        effective={effective}
                        modified={modified}
                        error={errors[item.id]}
                        warnings={warnings}
                        recording={recordingActionId === item.id}
                        terminalStatus={terminalStatus}
                        onStartRecording={(actionId) => {
                          setRecordingActionId(actionId)
                          clearError(actionId)
                        }}
                        onCancelRecording={() => setRecordingActionId(null)}
                        onCapture={(actionId, input) => void captureBinding(actionId, input)}
                        onClearError={clearError}
                        onDisable={(actionId) => void disableBinding(actionId)}
                        onReset={(actionId) => void resetBinding(actionId)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
