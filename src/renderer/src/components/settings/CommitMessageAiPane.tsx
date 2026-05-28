/* eslint-disable max-lines -- Why: each agent setting (toggle, agent dropdown,
   model dropdown, thinking effort dropdown, custom command, custom prompt) is
   a SearchableSetting block, and splitting the pane across files would scatter
   the ~6 conditional render branches without making any of them clearer. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Terminal } from 'lucide-react'
import type { CommitMessageAiSettings, GlobalSettings, TuiAgent } from '../../../../shared/types'
import {
  CUSTOM_AGENT_ID,
  getCommitMessageAgentCapability,
  isCustomAgentId,
  listCommitMessageAgentCapabilities,
  resolveCommitMessageAgentChoice,
  type CommitMessageAgentCapability,
  type CommitMessageModelCapability
} from '../../../../shared/commit-message-agent-spec'
import { CUSTOM_PROMPT_PLACEHOLDER } from '../../../../shared/commit-message-prompt'
import {
  getCommitMessageModelDiscoveryHostKeyForScope,
  LOCAL_COMMIT_MESSAGE_HOST_KEY
} from '../../../../shared/commit-message-host-key'
import { AGENT_CATALOG, AgentIcon } from '@/lib/agent-catalog'
import { getConnectionId } from '@/lib/connection-context'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import {
  discoverRuntimeCommitMessageModels,
  getRuntimeGitScope
} from '../../runtime/runtime-git-client'
import { useAppStore } from '../../store'
import { useActiveWorktree } from '../../store/selectors'
import { useI18n } from '@/i18n'
import { getCommitMessageAiPaneSearchEntries } from './commit-message-ai-search'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'

type CommitMessageAiPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void | Promise<void>
  onCustomPromptDirtyChange?: (dirty: boolean) => void
  customPromptDiscardSignal?: number
}

const EMPTY_SETTINGS: CommitMessageAiSettings = {
  enabled: false,
  agentId: null,
  selectedModelByAgent: {},
  discoveredModelsByAgent: {},
  selectedThinkingByModel: {},
  customPrompt: '',
  customAgentCommand: ''
}

type ModelDiscoveryState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  hostKey: string
  models: CommitMessageModelCapability[]
  defaultModelId?: string
  error?: string
}

const UNCONFIGURED_AGENT_SELECT_VALUE = ''
const COMING_SOON_COMMIT_MESSAGE_AGENTS: readonly { id: TuiAgent; label: string }[] = [
  { id: 'gemini', label: 'Gemini' }
]

function readSettings(settings: GlobalSettings): CommitMessageAiSettings {
  return settings.commitMessageAi ?? EMPTY_SETTINGS
}

function agentLabel(agentId: TuiAgent, capability: CommitMessageAgentCapability): string {
  return AGENT_CATALOG.find((a) => a.id === agentId)?.label ?? capability.label
}

function readSelectedModelId(
  config: CommitMessageAiSettings,
  hostKey: string,
  agentId: TuiAgent
): string | undefined {
  return (
    config.selectedModelByAgentByHost?.[hostKey]?.[agentId] ??
    (hostKey === LOCAL_COMMIT_MESSAGE_HOST_KEY ? config.selectedModelByAgent[agentId] : undefined)
  )
}

function resolveSelectedModel(
  config: CommitMessageAiSettings,
  capability: CommitMessageAgentCapability,
  hostKey: string
): CommitMessageModelCapability {
  const persisted = readSelectedModelId(config, hostKey, capability.id)
  if (persisted) {
    const found = capability.models.find((m) => m.id === persisted)
    if (found) {
      return found
    }
  }
  // Why: defaultModelId is guaranteed to exist in provider capabilities by construction.
  return capability.models.find((m) => m.id === capability.defaultModelId) ?? capability.models[0]
}

function resolveSelectedThinking(
  config: CommitMessageAiSettings,
  model: CommitMessageModelCapability
): string | undefined {
  if (!model.thinkingLevels) {
    return undefined
  }
  const persisted = config.selectedThinkingByModel[model.id]
  if (persisted && model.thinkingLevels.some((l) => l.id === persisted)) {
    return persisted
  }
  return model.defaultThinkingLevel
}

function translateThinkingLabel(
  id: string,
  label: string,
  levels: Record<'off' | 'low' | 'medium' | 'high' | 'xhigh' | 'max', string>
): string {
  return id in levels ? levels[id as keyof typeof levels] : label
}

export function mergeDiscoveredModelsIntoCommitMessageConfig(
  config: CommitMessageAiSettings,
  agentId: TuiAgent,
  models: CommitMessageModelCapability[],
  defaultModelId: string,
  hostKey = LOCAL_COMMIT_MESSAGE_HOST_KEY
): CommitMessageAiSettings {
  const hostSelectedModels = config.selectedModelByAgentByHost?.[hostKey] ?? {}
  const persisted = readSelectedModelId(config, hostKey, agentId)
  const nextModelId = models.some((model) => model.id === persisted) ? persisted : defaultModelId
  const nextHostSelectedModels =
    nextModelId && nextModelId !== persisted
      ? {
          ...hostSelectedModels,
          [agentId]: nextModelId
        }
      : hostSelectedModels
  const nextHostDiscoveredModels = {
    ...config.discoveredModelsByAgentByHost?.[hostKey],
    [agentId]: models
  }
  return {
    ...config,
    ...(hostKey === LOCAL_COMMIT_MESSAGE_HOST_KEY
      ? {
          discoveredModelsByAgent: {
            ...config.discoveredModelsByAgent,
            [agentId]: models
          },
          selectedModelByAgent:
            nextModelId && nextModelId !== persisted
              ? {
                  ...config.selectedModelByAgent,
                  [agentId]: nextModelId
                }
              : config.selectedModelByAgent
        }
      : {}),
    discoveredModelsByAgentByHost: {
      ...config.discoveredModelsByAgentByHost,
      [hostKey]: nextHostDiscoveredModels
    },
    selectedModelByAgentByHost: {
      ...config.selectedModelByAgentByHost,
      [hostKey]: nextHostSelectedModels
    }
  }
}

function selectModelForHost(
  config: CommitMessageAiSettings,
  hostKey: string,
  agentId: TuiAgent,
  modelId: string
): Pick<CommitMessageAiSettings, 'selectedModelByAgent' | 'selectedModelByAgentByHost'> {
  const hostSelectedModels = config.selectedModelByAgentByHost?.[hostKey] ?? {}
  return {
    selectedModelByAgent:
      hostKey === LOCAL_COMMIT_MESSAGE_HOST_KEY
        ? {
            ...config.selectedModelByAgent,
            [agentId]: modelId
          }
        : config.selectedModelByAgent,
    selectedModelByAgentByHost: {
      ...config.selectedModelByAgentByHost,
      [hostKey]: {
        ...hostSelectedModels,
        [agentId]: modelId
      }
    }
  }
}

export function getCommitMessageSettingsPaneDiscoveryHostKey(
  settings: GlobalSettings,
  activeConnectionId: string | null | undefined,
  hasActiveWorktree: boolean
): string {
  const runtimeScope = hasActiveWorktree
    ? getRuntimeGitScope(settings, activeConnectionId)
    : activeConnectionId
  return getCommitMessageModelDiscoveryHostKeyForScope(runtimeScope)
}

export function CommitMessageAiPane({
  settings,
  updateSettings,
  onCustomPromptDirtyChange,
  customPromptDiscardSignal
}: CommitMessageAiPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.commitMessageAi
  const searchEntries = getCommitMessageAiPaneSearchEntries(copy)
  const searchQuery = useAppStore((s) => s.settingsSearchQuery)
  const activeWorktree = useActiveWorktree()
  const activeConnectionId = getConnectionId(activeWorktree?.id ?? null)
  const discoveryHostKey = getCommitMessageSettingsPaneDiscoveryHostKey(
    settings,
    activeConnectionId,
    Boolean(activeWorktree?.id)
  )
  const config = readSettings(settings)
  const latestConfigRef = useRef(config)
  latestConfigRef.current = config
  const [modelDiscoveryByAgent, setModelDiscoveryByAgent] = useState<
    Partial<Record<TuiAgent, ModelDiscoveryState>>
  >({})
  const persistedCustomPrompt = config.customPrompt
  const [customPromptDraft, setCustomPromptDraft] = useState(persistedCustomPrompt)
  const [isSavingCustomPrompt, setIsSavingCustomPrompt] = useState(false)
  const persistedCustomPromptRef = useRef(persistedCustomPrompt)
  const isCustomPromptDirty = customPromptDraft !== persistedCustomPrompt

  useEffect(() => {
    persistedCustomPromptRef.current = persistedCustomPrompt
  }, [persistedCustomPrompt])

  useEffect(() => {
    if (!isCustomPromptDirty) {
      setCustomPromptDraft(persistedCustomPrompt)
    }
  }, [isCustomPromptDirty, persistedCustomPrompt])

  useEffect(() => {
    setCustomPromptDraft(persistedCustomPromptRef.current)
    // Why: parent navigation guards use this signal after the user confirms
    // they want to leave without saving the prompt draft.
  }, [customPromptDiscardSignal])

  useEffect(() => {
    onCustomPromptDirtyChange?.(isCustomPromptDirty)
  }, [isCustomPromptDirty, onCustomPromptDirtyChange])

  useEffect(
    () => () => {
      onCustomPromptDirtyChange?.(false)
    },
    [onCustomPromptDirtyChange]
  )

  const baseAgentCapabilities = useMemo(listCommitMessageAgentCapabilities, [])
  const agentCapabilities = useMemo(
    () =>
      baseAgentCapabilities.map((capability) => {
        const discovery = modelDiscoveryByAgent[capability.id]
        if (
          capability.modelSource !== 'dynamic' ||
          discovery?.status !== 'ready' ||
          discovery.hostKey !== discoveryHostKey
        ) {
          return capability
        }
        return {
          ...capability,
          models: discovery.models,
          defaultModelId: discovery.defaultModelId ?? capability.defaultModelId
        }
      }),
    [baseAgentCapabilities, discoveryHostKey, modelDiscoveryByAgent]
  )
  const resolvedAgentId = resolveCommitMessageAgentChoice(config.agentId, settings.defaultTuiAgent)
  const unsupportedSelectedAgent =
    config.agentId &&
    !isCustomAgentId(config.agentId) &&
    !getCommitMessageAgentCapability(config.agentId)
      ? config.agentId
      : null
  const activeAgentSelectValue = unsupportedSelectedAgent
    ? UNCONFIGURED_AGENT_SELECT_VALUE
    : (resolvedAgentId ?? UNCONFIGURED_AGENT_SELECT_VALUE)
  const unsupportedDefaultAgent =
    resolvedAgentId === null &&
    !config.agentId &&
    settings.defaultTuiAgent &&
    settings.defaultTuiAgent !== 'blank'
      ? settings.defaultTuiAgent
      : null
  const unsupportedDefaultAgentLabel = unsupportedDefaultAgent
    ? (AGENT_CATALOG.find((a) => a.id === unsupportedDefaultAgent)?.label ??
      unsupportedDefaultAgent)
    : null
  const unsupportedSelectedAgentIsComingSoon = COMING_SOON_COMMIT_MESSAGE_AGENTS.some(
    (agent) => agent.id === unsupportedSelectedAgent
  )
  const unsupportedSelectedAgentLabel = unsupportedSelectedAgent
    ? (COMING_SOON_COMMIT_MESSAGE_AGENTS.find((a) => a.id === unsupportedSelectedAgent)?.label ??
      AGENT_CATALOG.find((a) => a.id === unsupportedSelectedAgent)?.label ??
      unsupportedSelectedAgent)
    : null
  const isCustom = isCustomAgentId(resolvedAgentId)
  const activeAgentId = resolvedAgentId && !isCustom ? resolvedAgentId : null
  const activeCapability = activeAgentId
    ? (agentCapabilities.find((capability) => capability.id === activeAgentId) ??
      getCommitMessageAgentCapability(activeAgentId))
    : undefined
  const activeModel = activeCapability
    ? resolveSelectedModel(config, activeCapability, discoveryHostKey)
    : null
  const activeThinking = activeModel ? resolveSelectedThinking(config, activeModel) : undefined
  const rawActiveDiscovery = activeAgentId ? modelDiscoveryByAgent[activeAgentId] : undefined
  const activeDiscovery =
    rawActiveDiscovery?.hostKey === discoveryHostKey ? rawActiveDiscovery : undefined

  const writeConfig = (patch: Partial<CommitMessageAiSettings>): void => {
    updateSettings({ commitMessageAi: { ...config, ...patch } })
  }

  const refreshModels = async (agentId: TuiAgent): Promise<void> => {
    const capability =
      agentCapabilities.find((candidate) => candidate.id === agentId) ??
      getCommitMessageAgentCapability(agentId)
    if (!capability || capability.modelSource !== 'dynamic') {
      return
    }
    setModelDiscoveryByAgent((prev) => ({
      ...prev,
      [agentId]: {
        status: 'loading',
        hostKey: discoveryHostKey,
        models:
          prev[agentId]?.hostKey === discoveryHostKey
            ? (prev[agentId]?.models ?? capability.models)
            : capability.models
      }
    }))
    try {
      const result = await discoverRuntimeCommitMessageModels(
        {
          settings,
          worktreeId: activeWorktree?.id,
          worktreePath: activeWorktree?.path ?? '',
          connectionId: activeConnectionId ?? undefined
        },
        agentId
      )
      if (!result.success) {
        setModelDiscoveryByAgent((prev) => ({
          ...prev,
          [agentId]: {
            status: 'error',
            hostKey: discoveryHostKey,
            models:
              prev[agentId]?.hostKey === discoveryHostKey
                ? (prev[agentId]?.models ?? capability.models)
                : capability.models,
            error: result.error
          }
        }))
        return
      }
      setModelDiscoveryByAgent((prev) => ({
        ...prev,
        [agentId]: {
          status: 'ready',
          hostKey: discoveryHostKey,
          models: result.models,
          defaultModelId: result.defaultModelId
        }
      }))
      const latestConfig = latestConfigRef.current
      updateSettings({
        commitMessageAi: mergeDiscoveredModelsIntoCommitMessageConfig(
          latestConfig,
          agentId,
          result.models,
          result.defaultModelId,
          discoveryHostKey
        )
      })
    } catch (error) {
      setModelDiscoveryByAgent((prev) => ({
        ...prev,
        [agentId]: {
          status: 'error',
          hostKey: discoveryHostKey,
          models:
            prev[agentId]?.hostKey === discoveryHostKey
              ? (prev[agentId]?.models ?? capability.models)
              : capability.models,
          error: error instanceof Error ? error.message : copy.model.discoveryFailed
        }
      }))
    }
  }

  useEffect(() => {
    if (
      !config.enabled ||
      isCustom ||
      !activeCapability ||
      activeCapability.modelSource !== 'dynamic'
    ) {
      return
    }
    const discovery = modelDiscoveryByAgent[activeCapability.id]
    if (
      discovery?.hostKey === discoveryHostKey &&
      (discovery.status === 'loading' || discovery.status === 'ready')
    ) {
      return
    }
    void refreshModels(activeCapability.id)
    // Why: auto-refresh should run once when a dynamic agent becomes active.
    // Including the discovery map would retry immediately after an error and
    // turn a visible CLI failure into a request loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeCapability?.id,
    activeCapability?.modelSource,
    config.enabled,
    discoveryHostKey,
    isCustom
  ])

  const onToggleEnabled = (): void => {
    const next = !config.enabled
    if (!next) {
      writeConfig({ enabled: false })
      return
    }
    // Why: when the user enables the feature for the first time, hydrate the
    // agent / model / thinking choices from their default agent when possible
    // so Generate works without maintaining a second agent preference. If the
    // user previously persisted 'custom', keep it and let them re-edit the
    // command — no implicit reset to a preset.
    const seedAgentId = resolveCommitMessageAgentChoice(config.agentId, settings.defaultTuiAgent)
    if (!seedAgentId) {
      writeConfig({ enabled: true, agentId: null })
      return
    }
    const seedCapability = isCustomAgentId(seedAgentId)
      ? undefined
      : getCommitMessageAgentCapability(seedAgentId)
    const seedModel = seedCapability
      ? resolveSelectedModel(config, seedCapability, discoveryHostKey)
      : null
    const seedThinking = seedModel ? resolveSelectedThinking(config, seedModel) : undefined

    const selectedModelPatch = seedCapability
      ? selectModelForHost(
          config,
          discoveryHostKey,
          seedCapability.id,
          readSelectedModelId(config, discoveryHostKey, seedCapability.id) ??
            seedCapability.defaultModelId
        )
      : {
          selectedModelByAgent: config.selectedModelByAgent,
          selectedModelByAgentByHost: config.selectedModelByAgentByHost
        }
    const nextSelectedThinkingByModel = { ...config.selectedThinkingByModel }
    if (seedModel && seedThinking && !nextSelectedThinkingByModel[seedModel.id]) {
      nextSelectedThinkingByModel[seedModel.id] = seedThinking
    }
    writeConfig({
      enabled: true,
      agentId: seedAgentId,
      ...selectedModelPatch,
      selectedThinkingByModel: nextSelectedThinkingByModel
    })
  }

  const onAgentChange = (newAgentId: string): void => {
    if (newAgentId === UNCONFIGURED_AGENT_SELECT_VALUE) {
      return
    }
    if (isCustomAgentId(newAgentId)) {
      writeConfig({ agentId: CUSTOM_AGENT_ID })
      return
    }
    const capability = getCommitMessageAgentCapability(newAgentId as TuiAgent)
    if (!capability) {
      return
    }
    const selectedModelPatch = selectModelForHost(
      config,
      discoveryHostKey,
      capability.id,
      readSelectedModelId(config, discoveryHostKey, capability.id) ?? capability.defaultModelId
    )
    const newModel = resolveSelectedModel(
      { ...config, ...selectedModelPatch, agentId: capability.id },
      capability,
      discoveryHostKey
    )
    const nextSelectedThinkingByModel = { ...config.selectedThinkingByModel }
    if (
      newModel.thinkingLevels &&
      newModel.defaultThinkingLevel &&
      !nextSelectedThinkingByModel[newModel.id]
    ) {
      nextSelectedThinkingByModel[newModel.id] = newModel.defaultThinkingLevel
    }
    writeConfig({
      agentId: capability.id,
      ...selectedModelPatch,
      selectedThinkingByModel: nextSelectedThinkingByModel
    })
  }

  const onCustomCommandChange = (value: string): void => {
    writeConfig({ customAgentCommand: value })
  }

  const onModelChange = (newModelId: string): void => {
    if (!activeCapability) {
      return
    }
    const model = activeCapability.models.find((m) => m.id === newModelId)
    if (!model) {
      return
    }
    const selectedModelPatch = selectModelForHost(
      config,
      discoveryHostKey,
      activeCapability.id,
      model.id
    )
    const nextSelectedThinkingByModel = { ...config.selectedThinkingByModel }
    if (
      model.thinkingLevels &&
      model.defaultThinkingLevel &&
      !nextSelectedThinkingByModel[model.id]
    ) {
      nextSelectedThinkingByModel[model.id] = model.defaultThinkingLevel
    }
    writeConfig({
      ...selectedModelPatch,
      selectedThinkingByModel: nextSelectedThinkingByModel
    })
  }

  const onThinkingChange = (newLevelId: string): void => {
    if (!activeModel) {
      return
    }
    writeConfig({
      selectedThinkingByModel: {
        ...config.selectedThinkingByModel,
        [activeModel.id]: newLevelId
      }
    })
  }

  const onSaveCustomPrompt = async (): Promise<void> => {
    if (!isCustomPromptDirty || isSavingCustomPrompt) {
      return
    }
    setIsSavingCustomPrompt(true)
    try {
      await updateSettings({ commitMessageAi: { ...config, customPrompt: customPromptDraft } })
    } finally {
      setIsSavingCustomPrompt(false)
    }
  }

  const onDiscardCustomPrompt = (): void => {
    setCustomPromptDraft(persistedCustomPrompt)
  }

  const sections: React.ReactNode[] = []

  if (
    matchesSettingsSearch(searchQuery, {
      title: searchEntries[0].title,
      description: searchEntries[0].description,
      keywords: searchEntries[0].keywords
    })
  ) {
    sections.push(
      <SearchableSetting
        key="enabled"
        title={copy.enable.title}
        description={copy.enable.description}
        keywords={copy.enable.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.enable.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.enable.rowDescription}</p>
        </div>
        <button
          role="switch"
          aria-checked={config.enabled}
          onClick={onToggleEnabled}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
            config.enabled ? 'bg-foreground' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              config.enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </SearchableSetting>
    )
  }

  if (
    config.enabled &&
    matchesSettingsSearch(searchQuery, {
      title: searchEntries[1].title,
      description: searchEntries[1].description,
      keywords: searchEntries[1].keywords
    })
  ) {
    sections.push(
      <SearchableSetting
        key="agent"
        title={copy.agent.title}
        description={copy.agent.description}
        keywords={copy.agent.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.agent.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.agent.rowDescription}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Select value={activeAgentSelectValue} onValueChange={onAgentChange}>
            <SelectTrigger size="sm" className="h-8 w-[260px] shrink-0 text-xs">
              <SelectValue placeholder={copy.agent.notConfigured} />
            </SelectTrigger>
            <SelectContent>
              {agentCapabilities.map((capability) => {
                const id = capability.id
                return (
                  <SelectItem key={id} value={id} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <AgentIcon agent={id} size={14} />
                      <span>{agentLabel(id, capability)}</span>
                    </span>
                  </SelectItem>
                )
              })}
              {COMING_SOON_COMMIT_MESSAGE_AGENTS.filter(
                (agent) => !agentCapabilities.some((capability) => capability.id === agent.id)
              ).map((agent) => (
                <SelectItem key={agent.id} value={agent.id} disabled className="cursor-not-allowed">
                  <span className="flex items-center gap-2">
                    <AgentIcon agent={agent.id} size={14} />
                    <span>{agent.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {copy.agent.comingSoon}
                    </span>
                  </span>
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_AGENT_ID} className="cursor-pointer">
                <span className="flex items-center gap-2">
                  <Terminal className="size-3.5" />
                  <span>{copy.agent.custom}</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {unsupportedDefaultAgentLabel ? (
            <p className="max-w-[260px] text-right text-[11px] text-muted-foreground">
              {copy.agent.unsupportedDefault(unsupportedDefaultAgentLabel)}{' '}
              {copy.agent.chooseSupported}
            </p>
          ) : null}
          {unsupportedSelectedAgentLabel ? (
            <p className="max-w-[260px] text-right text-[11px] text-muted-foreground">
              {unsupportedSelectedAgentIsComingSoon
                ? copy.agent.unsupportedSelectedComingSoon(unsupportedSelectedAgentLabel)
                : copy.agent.unsupportedSelected(unsupportedSelectedAgentLabel)}{' '}
              {copy.agent.chooseSupported}
            </p>
          ) : null}
        </div>
      </SearchableSetting>
    )
  }

  if (
    config.enabled &&
    isCustom &&
    matchesSettingsSearch(searchQuery, {
      title: searchEntries[5].title,
      description: searchEntries[5].description,
      keywords: searchEntries[5].keywords
    })
  ) {
    sections.push(
      <SearchableSetting
        key="custom-command"
        title={copy.customCommand.title}
        description={copy.customCommand.description}
        keywords={copy.customCommand.keywords}
        className="space-y-2 py-2"
      >
        <div className="space-y-0.5">
          <Label htmlFor="commit-message-ai-custom-command">{copy.customCommand.label}</Label>
          <p className="text-xs text-muted-foreground">
            {copy.customCommand.help.beforePlaceholder}{' '}
            <code className="rounded bg-muted/60 px-1 py-0.5 text-[10px]">
              {CUSTOM_PROMPT_PLACEHOLDER}
            </code>{' '}
            {copy.customCommand.help.afterPlaceholder} {copy.customCommand.help.stdin}{' '}
            <code className="rounded bg-muted/60 px-1 py-0.5 text-[10px]">claude -p</code>.{' '}
            {copy.customCommand.help.quoting}
          </p>
        </div>
        <input
          id="commit-message-ai-custom-command"
          type="text"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          value={config.customAgentCommand}
          onChange={(e) => onCustomCommandChange(e.target.value)}
          placeholder={copy.customCommand.placeholder(CUSTOM_PROMPT_PLACEHOLDER)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-ring"
        />
      </SearchableSetting>
    )
  }

  if (
    config.enabled &&
    activeCapability &&
    activeModel &&
    matchesSettingsSearch(searchQuery, {
      title: searchEntries[2].title,
      description: searchEntries[2].description,
      keywords: searchEntries[2].keywords
    })
  ) {
    sections.push(
      <SearchableSetting
        key="model"
        title={copy.model.title}
        description={copy.model.description}
        keywords={copy.model.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.model.title}</Label>
          <p className="text-xs text-muted-foreground">
            {activeCapability.modelSource === 'dynamic'
              ? copy.model.dynamicDescription
              : copy.model.staticDescription}
          </p>
          {activeDiscovery?.status === 'error' && (
            <p className="text-xs text-destructive">{activeDiscovery.error}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCapability.modelSource === 'dynamic' && (
            <button
              type="button"
              onClick={() => void refreshModels(activeCapability.id)}
              disabled={activeDiscovery?.status === 'loading'}
              title={copy.model.refresh}
              aria-label={copy.model.refresh}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`size-3.5 ${activeDiscovery?.status === 'loading' ? 'animate-spin' : ''}`}
              />
            </button>
          )}
          <Select value={activeModel.id} onValueChange={onModelChange}>
            <SelectTrigger size="sm" className="h-8 w-[260px] shrink-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeCapability.models.map((m) => (
                <SelectItem key={m.id} value={m.id} className="cursor-pointer">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SearchableSetting>
    )
  }

  if (
    config.enabled &&
    activeModel?.thinkingLevels &&
    activeThinking &&
    matchesSettingsSearch(searchQuery, {
      title: searchEntries[3].title,
      description: searchEntries[3].description,
      keywords: searchEntries[3].keywords
    })
  ) {
    sections.push(
      <SearchableSetting
        key="thinking"
        title={copy.thinking.title}
        description={copy.thinking.description}
        keywords={copy.thinking.keywords}
        className="flex items-center justify-between gap-4 py-2"
      >
        <div className="space-y-0.5">
          <Label>{copy.thinking.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.thinking.rowDescription}</p>
        </div>
        <Select value={activeThinking} onValueChange={onThinkingChange}>
          <SelectTrigger size="sm" className="h-8 text-xs w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activeModel.thinkingLevels.map((level) => (
              <SelectItem key={level.id} value={level.id} className="cursor-pointer">
                {translateThinkingLabel(level.id, level.label, copy.thinking.levels)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchableSetting>
    )
  }

  if (
    (config.enabled || isCustomPromptDirty) &&
    (isCustomPromptDirty ||
      matchesSettingsSearch(searchQuery, {
        title: searchEntries[4].title,
        description: searchEntries[4].description,
        keywords: searchEntries[4].keywords
      }))
  ) {
    sections.push(
      <SearchableSetting
        key="custom-prompt"
        title={copy.customPrompt.title}
        description={copy.customPrompt.description}
        keywords={copy.customPrompt.keywords}
        forceVisible={isCustomPromptDirty}
        className="space-y-2 py-2"
      >
        <div className="space-y-0.5">
          <Label htmlFor="commit-message-ai-custom-prompt">{copy.customPrompt.title}</Label>
          <p className="text-xs text-muted-foreground">{copy.customPrompt.rowDescription}</p>
        </div>
        <textarea
          id="commit-message-ai-custom-prompt"
          rows={4}
          value={customPromptDraft}
          onChange={(e) => setCustomPromptDraft(e.target.value)}
          placeholder={copy.customPrompt.placeholder}
          className="w-full resize-y rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            {isCustomPromptDirty ? copy.customPrompt.unsavedChanges : copy.customPrompt.saved}
          </p>
          <div className="flex items-center gap-2">
            {isCustomPromptDirty ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onDiscardCustomPrompt}
                disabled={isSavingCustomPrompt}
              >
                {copy.customPrompt.discard}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="xs"
              onClick={() => void onSaveCustomPrompt()}
              disabled={!isCustomPromptDirty || isSavingCustomPrompt}
            >
              {isSavingCustomPrompt ? copy.customPrompt.saving : copy.customPrompt.save}
            </Button>
          </div>
        </div>
      </SearchableSetting>
    )
  }

  if (sections.length === 0) {
    return <div className="space-y-4" />
  }
  // Why: this pane lives nested inside the Git section, so we draw an explicit
  // sub-heading + top border to keep its toggles visually distinct from the
  // Branch Prefix / Refresh Local Base Ref / Orca Attribution rows above.
  return (
    <div className="space-y-4 border-t border-border/40 pt-4">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold">{copy.header.title}</h3>
        <p className="text-xs text-muted-foreground">{copy.header.description}</p>
      </div>
      {sections}
    </div>
  )
}
