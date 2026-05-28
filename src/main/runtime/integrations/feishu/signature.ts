import { createDecipheriv, createHash, timingSafeEqual } from 'crypto'

export type FeishuEventSignatureHeaders = {
  timestamp?: string
  nonce?: string
  signature?: string
}

export type FeishuSignatureVerificationResult =
  | { ok: true }
  | {
      ok: false
      reason: 'missing_header' | 'signature_mismatch'
    }

export function calculateFeishuEventSignature({
  timestamp,
  nonce,
  encryptKey,
  rawBody
}: {
  timestamp: string
  nonce: string
  encryptKey: string
  rawBody: string | Buffer
}): string {
  const prefix = Buffer.from(`${timestamp}${nonce}${encryptKey}`, 'utf8')
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, 'utf8')
  return createHash('sha256').update(Buffer.concat([prefix, body])).digest('hex')
}

export function verifyFeishuEventSignature({
  headers,
  encryptKey,
  rawBody
}: {
  headers: FeishuEventSignatureHeaders
  encryptKey: string
  rawBody: string | Buffer
}): FeishuSignatureVerificationResult {
  if (!headers.timestamp || !headers.nonce || !headers.signature) {
    return { ok: false, reason: 'missing_header' }
  }
  const expected = calculateFeishuEventSignature({
    timestamp: headers.timestamp,
    nonce: headers.nonce,
    encryptKey,
    rawBody
  })
  return constantTimeEqual(expected, headers.signature)
    ? { ok: true }
    : { ok: false, reason: 'signature_mismatch' }
}

export function decryptFeishuEventPayload(encrypted: string, encryptKey: string): string {
  const buffer = Buffer.from(encrypted, 'base64')
  const iv = buffer.subarray(0, 16)
  const ciphertext = buffer.subarray(16)
  const key = createHash('sha256').update(encryptKey, 'utf8').digest()
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

function constantTimeEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const actualBuffer = Buffer.from(actual, 'utf8')
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer)
}
