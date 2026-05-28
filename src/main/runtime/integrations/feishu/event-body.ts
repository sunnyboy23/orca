import { decryptFeishuEventPayload } from './signature'

export type FeishuEventBodyParseResult =
  | { ok: true; body: Record<string, unknown> }
  | {
      ok: false
      reason: 'missing_encrypt_key' | 'invalid_encrypted_payload'
    }

export function parseFeishuEventBody(
  parsed: Record<string, unknown>,
  encryptKey?: string
): FeishuEventBodyParseResult {
  const encrypted = readString(parsed, 'encrypt')
  if (!encrypted) {
    return { ok: true, body: parsed }
  }
  if (!encryptKey) {
    return { ok: false, reason: 'missing_encrypt_key' }
  }
  try {
    const decrypted = decryptFeishuEventPayload(encrypted, encryptKey)
    const body = parseJsonObject(decrypted)
    return body ? { ok: true, body } : { ok: false, reason: 'invalid_encrypted_payload' }
  } catch {
    return { ok: false, reason: 'invalid_encrypted_payload' }
  }
}

export function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}
