import type { GlobalSettings } from '../../../../shared/types'
import type { OrcaRuntimeService } from '../../orca-runtime'

export function hasFeishuBotCredentials(settings: GlobalSettings['feishuIntegration']): boolean {
  return Boolean(settings?.appId.trim() && settings.appSecret.trim())
}

export function startFeishuBotWhenConfigured({
  runtime,
  getSettings
}: {
  runtime: Pick<OrcaRuntimeService, 'startFeishuBot'>
  getSettings: () => Pick<GlobalSettings, 'feishuIntegration'>
}): void {
  if (!hasFeishuBotCredentials(getSettings().feishuIntegration)) {
    return
  }

  void runtime.startFeishuBot().catch((error) => {
    console.warn('[feishu] auto-start failed:', error)
  })
}
