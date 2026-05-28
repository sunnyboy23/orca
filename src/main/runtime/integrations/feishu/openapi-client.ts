import type { FeishuCredentialCheckResult } from '../../../../shared/types'

type FeishuTenantTokenResponse = {
  code?: number
  msg?: string
  tenant_access_token?: string
  expire?: number
}

const TENANT_TOKEN_URL =
  'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'

export async function checkFeishuAppCredentials({
  appId,
  appSecret,
  fetchImpl = fetch
}: {
  appId: string
  appSecret: string
  fetchImpl?: typeof fetch
}): Promise<FeishuCredentialCheckResult> {
  const trimmedAppId = appId.trim()
  const trimmedSecret = appSecret.trim()
  if (!trimmedAppId || !trimmedSecret) {
    return {
      ok: false,
      reason: 'missing_credentials',
      message: 'App ID and App Secret are required.'
    }
  }

  let response: Response
  try {
    response = await fetchImpl(TENANT_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        app_id: trimmedAppId,
        app_secret: trimmedSecret
      })
    })
  } catch (err) {
    return {
      ok: false,
      reason: 'network_error',
      message: err instanceof Error ? err.message : 'Failed to reach Feishu OpenAPI.'
    }
  }

  const payload = await readFeishuTokenPayload(response)
  if (!payload) {
    return {
      ok: false,
      reason: 'invalid_response',
      message: `Feishu returned an invalid response with HTTP ${response.status}.`
    }
  }
  if (payload.code !== 0) {
    return {
      ok: false,
      reason: 'feishu_error',
      code: payload.code,
      message: payload.msg || `Feishu returned error code ${payload.code}.`
    }
  }
  if (!payload.tenant_access_token || typeof payload.expire !== 'number') {
    return {
      ok: false,
      reason: 'invalid_response',
      message: 'Feishu response did not include tenant access token information.'
    }
  }
  return {
    ok: true,
    expiresIn: payload.expire
  }
}

async function readFeishuTokenPayload(response: Response): Promise<FeishuTenantTokenResponse | null> {
  try {
    const value = (await response.json()) as unknown
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as FeishuTenantTokenResponse)
      : null
  } catch {
    return null
  }
}
