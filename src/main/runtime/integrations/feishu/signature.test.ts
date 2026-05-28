import { createCipheriv, createHash, randomBytes } from 'crypto'
import { describe, expect, it } from 'vitest'
import {
  calculateFeishuEventSignature,
  decryptFeishuEventPayload,
  verifyFeishuEventSignature
} from './signature'

describe('Feishu event signature', () => {
  it('verifies a valid event signature', () => {
    const rawBody = JSON.stringify({ type: 'event_callback', event: { text: 'hello' } })
    const signature = calculateFeishuEventSignature({
      timestamp: '1710000000',
      nonce: 'nonce',
      encryptKey: 'encrypt-key',
      rawBody
    })

    expect(
      verifyFeishuEventSignature({
        headers: {
          timestamp: '1710000000',
          nonce: 'nonce',
          signature
        },
        encryptKey: 'encrypt-key',
        rawBody
      })
    ).toEqual({ ok: true })
  })

  it('rejects missing or mismatched signatures', () => {
    expect(
      verifyFeishuEventSignature({
        headers: { timestamp: '1710000000', nonce: 'nonce' },
        encryptKey: 'encrypt-key',
        rawBody: '{}'
      })
    ).toEqual({ ok: false, reason: 'missing_header' })

    expect(
      verifyFeishuEventSignature({
        headers: {
          timestamp: '1710000000',
          nonce: 'nonce',
          signature: '0'.repeat(64)
        },
        encryptKey: 'encrypt-key',
        rawBody: '{}'
      })
    ).toEqual({ ok: false, reason: 'signature_mismatch' })
  })

  it('decrypts Feishu encrypted event payloads', () => {
    const encrypted = encryptFixture('{"challenge":"abc"}', 'encrypt-key')

    expect(decryptFeishuEventPayload(encrypted, 'encrypt-key')).toBe('{"challenge":"abc"}')
  })
})

function encryptFixture(plaintext: string, encryptKey: string): string {
  const iv = randomBytes(16)
  const key = createHash('sha256').update(encryptKey, 'utf8').digest()
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([iv, cipher.update(plaintext), cipher.final()]).toString('base64')
}
