import { describe, expect, it, vi } from 'vitest'
import type { GlobalSettings } from '../../../../shared/types'
import { hasFeishuBotCredentials, startFeishuBotWhenConfigured } from './auto-start'

function settings(
  overrides: Partial<NonNullable<GlobalSettings['feishuIntegration']>>
): Pick<GlobalSettings, 'feishuIntegration'> {
  return {
    feishuIntegration: {
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
      repoBindings: [],
      ...overrides
    }
  }
}

describe('Feishu bot auto-start', () => {
  it('requires both app ID and app secret', () => {
    expect(hasFeishuBotCredentials(settings({}).feishuIntegration)).toBe(false)
    expect(hasFeishuBotCredentials(settings({ appId: 'cli_a' }).feishuIntegration)).toBe(false)
    expect(hasFeishuBotCredentials(settings({ appSecret: 'secret' }).feishuIntegration)).toBe(false)
    expect(
      hasFeishuBotCredentials(settings({ appId: 'cli_a', appSecret: 'secret' }).feishuIntegration)
    ).toBe(true)
  })

  it('starts the bot when credentials are present', () => {
    const startFeishuBot = vi.fn().mockResolvedValue({ state: 'connected', configured: true })

    startFeishuBotWhenConfigured({
      runtime: { startFeishuBot },
      getSettings: () => settings({ appId: 'cli_a', appSecret: 'secret' })
    })

    expect(startFeishuBot).toHaveBeenCalledTimes(1)
  })

  it('does not start without credentials', () => {
    const startFeishuBot = vi.fn()

    startFeishuBotWhenConfigured({
      runtime: { startFeishuBot },
      getSettings: () => settings({ appId: 'cli_a' })
    })

    expect(startFeishuBot).not.toHaveBeenCalled()
  })
})
