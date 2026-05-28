import { describe, expect, it } from 'vitest'
import { getFeishuSetupStatus } from './feishu-integration-settings'
import type { FeishuIntegrationSettings } from './types'

function completeSettings(overrides: Partial<FeishuIntegrationSettings> = {}): FeishuIntegrationSettings {
  return {
    enabled: true,
    appId: 'cli_app',
    appSecret: 'secret',
    encryptKeyRef: 'keychain:encrypt-key',
    verificationTokenRef: 'keychain:verification-token',
    webhookPublicUrl: 'https://example.com/webhook',
    tunnelCommand: '',
    wikiSource: {
      spaceId: 'spc_team',
      configNodeToken: 'wikcn_config',
      projectDocsRootToken: 'wikcn_projects'
    },
    baseAppToken: 'bascn_token',
    baseViewId: 'vew_id',
    baseFieldMapping: {
      reposTableId: 'tbl_repos',
      capabilitiesTableId: 'tbl_capabilities',
      dependenciesTableId: 'tbl_dependencies',
      agentsTableId: 'tbl_agents',
      policiesTableId: 'tbl_policies'
    },
    repoBindings: [{ repoName: 'orca', localPath: '/repo/orca' }],
    ...overrides
  }
}

describe('getFeishuSetupStatus', () => {
  it('marks complete when app credentials, Base mapping, and repo bindings exist', () => {
    expect(getFeishuSetupStatus(completeSettings())).toEqual({ complete: true, missingSteps: [] })
  })

  it('reports missing setup steps without requiring Feishu event-admin fields', () => {
    const status = getFeishuSetupStatus(
      completeSettings({
        appId: '',
        appSecret: '',
        wikiSource: {
          spaceId: '',
          configNodeToken: '',
          projectDocsRootToken: ''
        },
        baseFieldMapping: {
          reposTableId: '',
          capabilitiesTableId: '',
          dependenciesTableId: '',
          agentsTableId: '',
          policiesTableId: ''
        },
        repoBindings: []
      })
    )

    expect(status.complete).toBe(false)
    expect(status.missingSteps).toEqual([
      'create-bot',
      'app-secret',
      'wiki',
      'base',
      'repo-bindings'
    ])
  })
})
