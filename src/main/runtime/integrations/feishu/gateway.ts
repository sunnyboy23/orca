import { verifyFeishuEventSignature } from './signature'
import { extractFeishuCardAction } from './action'
import type { FeishuGateResolutionResult, FeishuGateResolutionRequest } from './gate-resolver'
import { parseFeishuEventBody, parseJsonObject } from './event-body'
import {
  extractEventType,
  extractReceivedMessage,
  verifyFeishuToken,
  type FeishuReceivedMessage
} from './message'

export type FeishuWebhookHeaders = {
  'x-lark-request-timestamp'?: string
  'x-lark-request-nonce'?: string
  'x-lark-signature'?: string
  [key: string]: string | undefined
}

export type FeishuGatewayConfig = {
  verificationToken?: string
  encryptKey?: string
  coordinatorHandle?: string
}

export type FeishuGatewayOrchestrator = {
  receiveFeishuMessage(message: FeishuReceivedMessage): Promise<{ runId?: string }> | { runId?: string }
  resolveFeishuGate?(
    request: FeishuGateResolutionRequest
  ): Promise<FeishuGateResolutionResult> | FeishuGateResolutionResult
}

export type FeishuGatewayResult =
  | {
      ok: true
      kind: 'challenge'
      status: 200
      responseBody: { challenge: string }
    }
  | {
      ok: true
      kind: 'message'
      status: 200
      responseBody: { code: 0; msg: 'ok'; runId?: string }
      message: FeishuReceivedMessage
    }
  | {
      ok: true
      kind: 'gate_resolution'
      status: 200
      responseBody: { code: 0; msg: 'ok'; gateId: string }
    }
  | {
      ok: true
      kind: 'ignored'
      status: 200
      responseBody: { code: 0; msg: 'ignored' }
      eventType?: string
    }
  | {
      ok: false
      status: 401 | 400
      reason:
        | 'invalid_signature'
        | 'invalid_json'
        | 'invalid_token'
        | 'missing_encrypt_key'
        | 'invalid_encrypted_payload'
        | 'gate_resolution_failed'
      responseBody: { code: number; msg: string }
    }

export async function handleFeishuWebhook({
  headers,
  rawBody,
  config,
  orchestrator
}: {
  headers: FeishuWebhookHeaders
  rawBody: string | Buffer
  config: FeishuGatewayConfig
  orchestrator?: FeishuGatewayOrchestrator
}): Promise<FeishuGatewayResult> {
  const bodyText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody
  if (config.encryptKey) {
    const signature = verifyFeishuEventSignature({
      headers: {
        timestamp: headers['x-lark-request-timestamp'],
        nonce: headers['x-lark-request-nonce'],
        signature: headers['x-lark-signature']
      },
      encryptKey: config.encryptKey,
      rawBody
    })
    if (!signature.ok) {
      return unauthorized('invalid_signature')
    }
  }

  const parsed = parseJsonObject(bodyText)
  if (!parsed) {
    return badRequest('invalid_json')
  }
  const eventBody = parseFeishuEventBody(parsed, config.encryptKey)
  if (!eventBody.ok) {
    return badRequest(eventBody.reason)
  }

  const tokenResult = verifyFeishuToken(eventBody.body, config.verificationToken)
  if (!tokenResult.ok) {
    return badRequest('invalid_token')
  }

  const challenge = readString(eventBody.body, 'challenge')
  if (readString(eventBody.body, 'type') === 'url_verification' && challenge) {
    return { ok: true, kind: 'challenge', status: 200, responseBody: { challenge } }
  }

  const cardAction = extractFeishuCardAction(eventBody.body)
  if (cardAction.type === 'resolve_gate') {
    const result = await orchestrator?.resolveFeishuGate?.(cardAction.request)
    if (!result?.ok) {
      return badRequest('gate_resolution_failed', result?.reason)
    }
    return {
      ok: true,
      kind: 'gate_resolution',
      status: 200,
      responseBody: { code: 0, msg: 'ok', gateId: result.gate.id }
    }
  }

  const message = extractReceivedMessage(eventBody.body)
  if (!message) {
    return {
      ok: true,
      kind: 'ignored',
      status: 200,
      responseBody: { code: 0, msg: 'ignored' },
      eventType: extractEventType(eventBody.body)
    }
  }

  const dispatch = await orchestrator?.receiveFeishuMessage(message)
  return {
    ok: true,
    kind: 'message',
    status: 200,
    responseBody: { code: 0, msg: 'ok', runId: dispatch?.runId },
    message
  }
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

function unauthorized(reason: Extract<FeishuGatewayResult, { ok: false }>['reason']): Extract<
  FeishuGatewayResult,
  { ok: false }
> {
  return { ok: false, status: 401, reason, responseBody: { code: 401, msg: reason } }
}

function badRequest(
  reason: Extract<FeishuGatewayResult, { ok: false }>['reason'],
  detail?: string
): Extract<
  FeishuGatewayResult,
  { ok: false }
> {
  return {
    ok: false,
    status: 400,
    reason,
    responseBody: { code: 400, msg: detail ? `${reason}:${detail}` : reason }
  }
}
