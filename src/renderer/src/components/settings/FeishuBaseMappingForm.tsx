import { BookOpen, Table2 } from 'lucide-react'
import type { FeishuIntegrationSettings } from '../../../../shared/types'
import { SettingsSubsectionHeader } from './SettingsFormControls'
import { FeishuSetupField } from './FeishuSetupField'
import { useI18n } from '@/i18n'

export function FeishuBaseMappingForm({
  settings,
  onChange
}: {
  settings: FeishuIntegrationSettings
  onChange: (updates: Partial<FeishuIntegrationSettings>) => void
}): React.JSX.Element {
  const { messages } = useI18n()
  const updateMapping = (
    key: keyof FeishuIntegrationSettings['baseFieldMapping'],
    value: string
  ): void => {
    onChange({ baseFieldMapping: { ...settings.baseFieldMapping, [key]: value } })
  }
  const updateWikiSource = (
    key: keyof FeishuIntegrationSettings['wikiSource'],
    value: string
  ): void => {
    onChange({ wikiSource: { ...settings.wikiSource, [key]: value } })
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <SettingsSubsectionHeader
        title={messages.feishu.teamWikiTitle}
        description={messages.feishu.teamWikiDescription}
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <FeishuSetupField
          icon={BookOpen}
          label={messages.feishu.wikiSpaceId}
          value={settings.wikiSource.spaceId}
          placeholder="spc..."
          onChange={(value) => updateWikiSource('spaceId', value)}
        />
        <FeishuSetupField
          icon={BookOpen}
          label={messages.feishu.configNodeToken}
          value={settings.wikiSource.configNodeToken}
          placeholder="wikcn..."
          onChange={(value) => updateWikiSource('configNodeToken', value)}
        />
        <FeishuSetupField
          icon={BookOpen}
          label={messages.feishu.projectDocsRootToken}
          value={settings.wikiSource.projectDocsRootToken}
          placeholder="wikcn..."
          onChange={(value) => updateWikiSource('projectDocsRootToken', value)}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.configBaseAppToken}
          value={settings.baseAppToken}
          placeholder="bascn..."
          onChange={(baseAppToken) => onChange({ baseAppToken })}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.defaultViewId}
          value={settings.baseViewId}
          placeholder="vew..."
          onChange={(baseViewId) => onChange({ baseViewId })}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.reposTableId}
          value={settings.baseFieldMapping.reposTableId}
          placeholder="tbl..."
          onChange={(value) => updateMapping('reposTableId', value)}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.capabilitiesTableId}
          value={settings.baseFieldMapping.capabilitiesTableId}
          placeholder="tbl..."
          onChange={(value) => updateMapping('capabilitiesTableId', value)}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.dependenciesTableId}
          value={settings.baseFieldMapping.dependenciesTableId}
          placeholder="tbl..."
          onChange={(value) => updateMapping('dependenciesTableId', value)}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.agentsTableId}
          value={settings.baseFieldMapping.agentsTableId}
          placeholder="tbl..."
          onChange={(value) => updateMapping('agentsTableId', value)}
        />
        <FeishuSetupField
          icon={Table2}
          label={messages.feishu.policiesTableId}
          value={settings.baseFieldMapping.policiesTableId}
          placeholder="tbl..."
          onChange={(value) => updateMapping('policiesTableId', value)}
        />
      </div>
    </div>
  )
}
