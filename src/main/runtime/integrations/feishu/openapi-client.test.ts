import { describe, expect, it, vi } from 'vitest'
import { checkFeishuAppCredentials } from './openapi-client'

describe('checkFeishuAppCredentials', () => {
  it('exchanges app credentials for a tenant access token', async () => {
    const fetchImpl = vi.fn(async () => Response.json({
      code: 0,
      msg: 'ok',
      tenant_access_token: 't-token',
      expire: 7200
    }))

    const result = await checkFeishuAppCredentials({
      appId: ' cli_app ',
      appSecret: ' secret ',
      fetchImpl
    })

    expect(result).toEqual({ ok: true, expiresIn: 7200 })
    expect(JSON.stringify(result)).not.toContain('t-token')
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ app_id: 'cli_app', app_secret: 'secret' })
      })
    )
  })

  it('reports Feishu credential errors without exposing the secret', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ code: 99991663, msg: 'invalid app_secret' }))

    const result = await checkFeishuAppCredentials({
      appId: 'cli_app',
      appSecret: 'super-secret',
      fetchImpl
    })

    expect(result).toEqual({
      ok: false,
      reason: 'feishu_error',
      code: 99991663,
      message: 'invalid app_secret'
    })
    expect(JSON.stringify(result)).not.toContain('super-secret')
  })

  it('requires both credential fields', async () => {
    await expect(
      checkFeishuAppCredentials({ appId: '', appSecret: '', fetchImpl: vi.fn() })
    ).resolves.toMatchObject({ ok: false, reason: 'missing_credentials' })
  })
})
