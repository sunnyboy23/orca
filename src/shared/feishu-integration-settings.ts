import type { FeishuIntegrationSettings } from './types'

export type FeishuSetupStep =
  | 'create-bot'
  | 'app-secret'
  | 'wiki'
  | 'base'
  | 'repo-bindings'

export type FeishuSetupStatus = {
  complete: boolean
  missingSteps: FeishuSetupStep[]
}

export function getFeishuSetupStatus(
  settings: Pick<
    FeishuIntegrationSettings,
    | 'appId'
    | 'appSecret'
    | 'wikiSource'
    | 'baseAppToken'
    | 'baseFieldMapping'
    | 'repoBindings'
  >
): FeishuSetupStatus {
  const missingSteps: FeishuSetupStep[] = []
  if (!settings.appId.trim()) {
    missingSteps.push('create-bot')
  }
  if (!settings.appSecret.trim()) {
    missingSteps.push('app-secret')
  }
  if (!hasWikiSource(settings.wikiSource)) {
    missingSteps.push('wiki')
  }
  if (!settings.baseAppToken.trim() || !hasBaseTableMapping(settings.baseFieldMapping)) {
    missingSteps.push('base')
  }
  if (settings.repoBindings.length === 0) {
    missingSteps.push('repo-bindings')
  }
  return { complete: missingSteps.length === 0, missingSteps }
}

function hasWikiSource(mapping: FeishuIntegrationSettings['wikiSource']): boolean {
  return (
    mapping.spaceId.trim() !== '' &&
    mapping.configNodeToken.trim() !== '' &&
    mapping.projectDocsRootToken.trim() !== ''
  )
}

function hasBaseTableMapping(mapping: FeishuIntegrationSettings['baseFieldMapping']): boolean {
  return (
    mapping.reposTableId.trim() !== '' &&
    mapping.capabilitiesTableId.trim() !== '' &&
    mapping.dependenciesTableId.trim() !== '' &&
    mapping.agentsTableId.trim() !== '' &&
    mapping.policiesTableId.trim() !== ''
  )
}
