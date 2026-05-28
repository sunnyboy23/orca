import { useEffect, useState } from 'react'
import { Workflow } from 'lucide-react'
import type { FeishuIntegrationSettings } from '../../../../shared/types'
import { Label } from '../ui/label'
import { ORCHESTRATION_SKILL_NAME } from '@/lib/agent-feature-install-commands'
import {
  AGENT_SKILL_CLI_PREREQUISITE_NOTICE,
  ensureOrcaCliAvailableForAgentSkillTerminal
} from '@/lib/agent-skill-cli-prerequisite'
import { ORCHESTRATION_SKILL_INSTALL_COMMAND } from '@/lib/orchestration-install-command'
import {
  GLOBAL_AGENT_SKILL_SOURCE_KINDS,
  useInstalledAgentSkill
} from '@/hooks/useInstalledAgentSkills'
import {
  ORCHESTRATION_ENABLED_STORAGE_KEY,
  ORCHESTRATION_SETUP_STATE_EVENT,
  isOrchestrationSetupEnabled,
  notifyOrchestrationSetupStateChanged
} from '@/lib/orchestration-setup-state'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import { useAppStore } from '../../store'
import { getOrchestrationPaneSearchEntries } from './orchestration-search'
import { AgentSkillSetupPanel } from './AgentSkillSetupPanel'
import { SettingsSwitch } from './SettingsFormControls'
import { FeishuSetupCard, patchFeishuSettings } from './FeishuSetupCard'
import { useI18n } from '@/i18n'

export function OrchestrationPane(): React.JSX.Element {
  const searchQuery = useAppStore((s) => s.settingsSearchQuery)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const { messages } = useI18n()
  const searchEntries = getOrchestrationPaneSearchEntries(settings ?? undefined)
  const showOrchestration = matchesSettingsSearch(searchQuery, searchEntries)

  const [orchestrationEnabled, setOrchestrationEnabled] = useState<boolean>(() => {
    return isOrchestrationSetupEnabled()
  })

  const feishuSettings = patchFeishuSettings(settings?.feishuIntegration, {})
  const {
    installed: orchestrationSkillDetected,
    loading: orchestrationSkillLoading,
    error: orchestrationSkillError,
    refresh: refreshOrchestrationSkill
  } = useInstalledAgentSkill(ORCHESTRATION_SKILL_NAME, {
    enabled: orchestrationEnabled,
    sourceKinds: GLOBAL_AGENT_SKILL_SOURCE_KINDS
  })

  useEffect(() => {
    const syncSetupState = (): void => {
      setOrchestrationEnabled(isOrchestrationSetupEnabled())
    }
    window.addEventListener(ORCHESTRATION_SETUP_STATE_EVENT, syncSetupState)
    return () => {
      window.removeEventListener(ORCHESTRATION_SETUP_STATE_EVENT, syncSetupState)
    }
  }, [])

  const toggleOrchestration = (value: boolean): void => {
    setOrchestrationEnabled(value)
    localStorage.setItem(ORCHESTRATION_ENABLED_STORAGE_KEY, value ? '1' : '0')
    notifyOrchestrationSetupStateChanged()
  }

  const updateFeishuSettings = (updates: Partial<FeishuIntegrationSettings>): void => {
    void updateSettings({
      feishuIntegration: patchFeishuSettings(feishuSettings, updates)
    })
  }

  if (!showOrchestration) {
    return <div />
  }

  return (
    <SearchableSetting
      title={messages.orchestration.title}
      description={messages.orchestration.description}
      keywords={searchEntries[0].keywords}
      className="space-y-4 py-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 shrink space-y-0.5">
          <Label>{messages.orchestration.title}</Label>
          <p className="text-xs text-muted-foreground">
            {messages.orchestration.switchDescription}
          </p>
        </div>
        <SettingsSwitch
          checked={orchestrationEnabled}
          onChange={() => toggleOrchestration(!orchestrationEnabled)}
          ariaLabel={messages.orchestration.ariaEnable}
        />
      </div>

      {orchestrationEnabled ? (
        <>
          <AgentSkillSetupPanel
            title={messages.orchestration.skillTitle}
            description={messages.orchestration.skillDescription}
            command={ORCHESTRATION_SKILL_INSTALL_COMMAND}
            terminalTitle={messages.orchestration.terminalTitle}
            terminalAriaLabel={messages.orchestration.terminalAriaLabel}
            terminalWorktreeId="settings-orchestration-skill-terminal"
            installed={orchestrationSkillDetected}
            loading={orchestrationSkillLoading}
            error={orchestrationSkillError}
            icon={<Workflow className="size-5" />}
            preInstallNotice={AGENT_SKILL_CLI_PREREQUISITE_NOTICE}
            onBeforeOpenTerminal={async () => {
              await ensureOrcaCliAvailableForAgentSkillTerminal()
            }}
            onRecheck={refreshOrchestrationSkill}
          />
          <FeishuSetupCard settings={feishuSettings} onChange={updateFeishuSettings} />
        </>
      ) : null}
    </SearchableSetting>
  )
}
