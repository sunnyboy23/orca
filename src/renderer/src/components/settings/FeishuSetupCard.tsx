import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Loader2,
  MessageSquareText,
  PlugZap
} from 'lucide-react'
import type { FeishuBotConnectionStatus, FeishuIntegrationSettings } from '../../../../shared/types'
import {
  getFeishuSetupStatus,
  type FeishuSetupStep
} from '../../../../shared/feishu-integration-settings'
import { Button } from '../ui/button'
import { SettingsBadge, SettingsSubsectionHeader } from './SettingsFormControls'
import { FeishuBaseMappingForm } from './FeishuBaseMappingForm'
import { FeishuRepoBindingEditor } from './FeishuRepoBindingEditor'
import { FeishuSetupField } from './FeishuSetupField'
import { useI18n, type I18nMessages } from '@/i18n'
import { useAppStore } from '../../store'

export function getDefaultFeishuSettings(): FeishuIntegrationSettings {
  return {
    enabled: false,
    appId: '',
    appSecret: '',
    encryptKeyRef: '',
    verificationTokenRef: '',
    webhookPublicUrl: '',
    tunnelCommand: '',
    wikiSource: {
      spaceId: '',
      configNodeToken: '',
      projectDocsRootToken: ''
    },
    baseAppToken: '',
    baseViewId: '',
    baseFieldMapping: {
      reposTableId: '',
      capabilitiesTableId: '',
      dependenciesTableId: '',
      agentsTableId: '',
      policiesTableId: ''
    },
    repoBindings: []
  }
}

export function patchFeishuSettings(
  current: FeishuIntegrationSettings | undefined,
  updates: Partial<FeishuIntegrationSettings>
): FeishuIntegrationSettings {
  const base = current ?? getDefaultFeishuSettings()
  return {
    ...base,
    ...updates,
    wikiSource: {
      ...base.wikiSource,
      ...updates.wikiSource
    },
    baseFieldMapping: {
      ...base.baseFieldMapping,
      ...updates.baseFieldMapping
    },
    repoBindings: updates.repoBindings ?? base.repoBindings
  }
}

export function FeishuSetupCard({
  settings,
  onChange
}: {
  settings: FeishuIntegrationSettings
  onChange: (updates: Partial<FeishuIntegrationSettings>) => void
}): React.JSX.Element {
  const { messages } = useI18n()
  const openFeishuChannelPanel = useAppStore((state) => state.openFeishuChannelPanel)
  const stepLabels = getStepLabels(messages)
  const status = useMemo(() => getFeishuSetupStatus(settings), [settings])
  const missing = new Set(status.missingSteps)
  const [connectionState, setConnectionState] = useState<
    | { kind: 'idle' }
    | { kind: 'checking' }
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })
  const [botStatus, setBotStatus] = useState<FeishuBotConnectionStatus>({
    state: 'idle',
    configured: false
  })
  const [botActionPending, setBotActionPending] = useState(false)

  useEffect(() => {
    let cancelled = false
    void window.api.settings.feishuBotGetStatus().then((nextStatus) => {
      if (!cancelled) {
        setBotStatus(nextStatus)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const checkConnection = async (): Promise<void> => {
    setConnectionState({ kind: 'checking' })
    try {
      const result = await window.api.settings.feishuCheckConnection()
      setConnectionState(
        result.ok
          ? { kind: 'success', message: messages.feishu.credentialSuccess(result.expiresIn) }
          : { kind: 'error', message: result.message }
      )
    } catch (err) {
      setConnectionState({
        kind: 'error',
        message: err instanceof Error ? err.message : messages.feishu.connectionErrorFallback
      })
    }
  }

  const startBot = async (): Promise<void> => {
    setBotActionPending(true)
    try {
      setBotStatus(await window.api.settings.feishuBotStart())
    } finally {
      setBotActionPending(false)
    }
  }

  const stopBot = async (): Promise<void> => {
    setBotActionPending(true)
    try {
      setBotStatus(await window.api.settings.feishuBotStop())
    } finally {
      setBotActionPending(false)
    }
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-background p-4">
      <SettingsSubsectionHeader
        title={messages.feishu.title}
        description={messages.feishu.description}
        action={
          <SettingsBadge tone={status.complete ? 'accent' : 'muted'}>
            {status.complete
              ? messages.common.ready
              : messages.common.missing(status.missingSteps.length)}
          </SettingsBadge>
        }
      />
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(stepLabels) as FeishuSetupStep[]).map((step) => (
          <SettingsBadge key={step} tone={missing.has(step) ? 'muted' : 'accent'}>
            {missing.has(step) ? null : <CheckCircle2 className="size-3" />}
            {stepLabels[step]}
          </SettingsBadge>
        ))}
      </div>
      <SetupGuide messages={messages} />
      <BotSecretFields settings={settings} onChange={onChange} messages={messages} />
      <ConnectionCheck
        disabled={!settings.appId.trim() || !settings.appSecret.trim()}
        state={connectionState}
        onCheck={() => void checkConnection()}
        messages={messages}
      />
      <EventChannelStatus
        disabled={!settings.appId.trim() || !settings.appSecret.trim()}
        pending={botActionPending}
        status={botStatus}
        onStart={() => void startBot()}
        onStop={() => void stopBot()}
        messages={messages}
      />
      <Button type="button" variant="outline" size="sm" onClick={openFeishuChannelPanel}>
        <MessageSquareText className="size-4" />
        {messages.feishuChannel.actions.openChannel}
      </Button>
      <FeishuBaseMappingForm settings={settings} onChange={onChange} />
      <FeishuRepoBindingEditor
        bindings={settings.repoBindings}
        onChange={(repoBindings) => onChange({ repoBindings })}
      />
    </div>
  )
}

function getStepLabels(messages: I18nMessages): Record<FeishuSetupStep, string> {
  return {
    'create-bot': messages.feishu.createBot,
    'app-secret': messages.feishu.appSecret,
    wiki: messages.feishu.wiki,
    base: messages.feishu.base,
    'repo-bindings': messages.feishu.repoBindings
  }
}

function ConnectionCheck({
  disabled,
  state,
  onCheck,
  messages
}: {
  disabled: boolean
  state:
    | { kind: 'idle' }
    | { kind: 'checking' }
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
  onCheck: () => void
  messages: I18nMessages
}): React.JSX.Element {
  const checking = state.kind === 'checking'
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 text-xs">
        <p className="font-medium text-foreground">{messages.feishu.credentialTitle}</p>
        <p className={state.kind === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
          {state.kind === 'idle'
            ? messages.feishu.credentialIdle
            : state.kind === 'checking'
              ? messages.feishu.credentialChecking
              : state.message}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || checking}
        onClick={onCheck}
      >
        {checking ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
        {messages.feishu.testCredentials}
      </Button>
    </div>
  )
}

function EventChannelStatus({
  disabled,
  pending,
  status,
  onStart,
  onStop,
  messages
}: {
  disabled: boolean
  pending: boolean
  status: FeishuBotConnectionStatus
  onStart: () => void
  onStop: () => void
  messages: I18nMessages
}): React.JSX.Element {
  const connected = status.state === 'connected' || status.state === 'connecting'
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 text-xs">
        <p className="font-medium text-foreground">{messages.feishu.eventChannelTitle}</p>
        <p className={status.state === 'failed' ? 'text-destructive' : 'text-muted-foreground'}>
          {describeEventChannel(status, messages)}
        </p>
        <EventChannelMeta status={status} messages={messages} />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || pending}
        onClick={connected ? onStop : onStart}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
        {connected ? messages.feishu.disconnectBot : messages.feishu.connectBot}
      </Button>
    </div>
  )
}

function EventChannelMeta({
  status,
  messages
}: {
  status: FeishuBotConnectionStatus
  messages: I18nMessages
}): React.JSX.Element | null {
  const lines = [
    status.lastConnectedAt
      ? messages.feishu.eventChannelLastConnected(formatDateTime(status.lastConnectedAt))
      : '',
    status.lastEventAt
      ? messages.feishu.eventChannelLastEvent(formatDateTime(status.lastEventAt))
      : '',
    status.lastError ? messages.feishu.eventChannelLastError(status.lastError) : ''
  ].filter(Boolean)
  if (lines.length === 0) {
    return null
  }
  return <p className="text-muted-foreground">{lines.join(' · ')}</p>
}

function describeEventChannel(status: FeishuBotConnectionStatus, messages: I18nMessages): string {
  const labels: Record<FeishuBotConnectionStatus['state'], string> = {
    idle: messages.feishu.eventChannelIdle,
    connecting: messages.feishu.eventChannelConnecting,
    connected: messages.feishu.eventChannelConnected,
    failed: messages.feishu.eventChannelFailed,
    stopped: messages.feishu.eventChannelStopped
  }
  return labels[status.state]
}

function formatDateTime(value: number): string {
  return new Date(value).toLocaleString()
}

function SetupGuide({ messages }: { messages: I18nMessages }): React.JSX.Element {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-card/30 p-3 text-xs text-muted-foreground lg:grid-cols-[1fr_auto]">
      <div className="space-y-1">
        <p className="font-medium text-foreground">{messages.feishu.guideTitle}</p>
        <p>{messages.feishu.guide}</p>
      </div>
      <Button type="button" variant="outline" size="sm" asChild>
        <a href="https://open.feishu.cn/app" target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" />
          {messages.feishu.developerConsole}
        </a>
      </Button>
    </div>
  )
}

function BotSecretFields({
  settings,
  onChange,
  messages
}: {
  settings: FeishuIntegrationSettings
  onChange: (updates: Partial<FeishuIntegrationSettings>) => void
  messages: I18nMessages
}): React.JSX.Element {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <FeishuSetupField
        icon={Bot}
        label={messages.feishu.appId}
        value={settings.appId}
        placeholder={messages.feishu.appIdPlaceholder}
        onChange={(appId) => onChange({ appId })}
      />
      <FeishuSetupField
        icon={KeyRound}
        label={messages.feishu.appSecretLabel}
        value={settings.appSecret}
        placeholder={messages.feishu.appSecretPlaceholder}
        type="password"
        onChange={(appSecret) => onChange({ appSecret })}
      />
    </div>
  )
}
