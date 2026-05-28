import { describe, expect, it, vi } from 'vitest'
import { buildFeishuRunStatusCard } from './cards'
import {
  handleFeishuWebhook,
  type FeishuGatewayOrchestrator
} from './gateway'
import type { FeishuReceivedMessage } from './message'
import type { FeishuGateResolutionResult } from './gate-resolver'
import { sanitizeFeishuText } from './sanitizer'
import { calculateFeishuEventSignature } from './signature'

describe('handleFeishuWebhook', () => {
  it('responds to url verification challenges', async () => {
    const result = await handleFeishuWebhook({
      headers: {},
      rawBody: JSON.stringify({
        type: 'url_verification',
        token: 'verify-token',
        challenge: 'challenge-code'
      }),
      config: { verificationToken: 'verify-token' }
    })

    expect(result).toEqual({
      ok: true,
      kind: 'challenge',
      status: 200,
      responseBody: { challenge: 'challenge-code' }
    })
  })

  it('rejects invalid verification tokens', async () => {
    const result = await handleFeishuWebhook({
      headers: {},
      rawBody: JSON.stringify({ token: 'wrong', challenge: 'challenge-code' }),
      config: { verificationToken: 'verify-token' }
    })

    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ status: 400, reason: 'invalid_token' })
  })

  it('verifies signed message callbacks and forwards sanitized text', async () => {
    const rawBody = JSON.stringify({
      token: 'verify-token',
      header: { event_type: 'im.message.receive_v1' },
      event: {
        sender: { sender_id: { open_id: 'ou_user' } },
        message: {
          message_id: 'om_message',
          chat_id: 'oc_chat',
          content: JSON.stringify({
            text: 'run /Users/alice/project/orca with appSecret=plain'
          })
        }
      }
    })
    const signature = calculateFeishuEventSignature({
      timestamp: '1710000000',
      nonce: 'nonce',
      encryptKey: 'encrypt-key',
      rawBody
    })
    const receiveFeishuMessage = vi.fn((message: FeishuReceivedMessage) => ({
      runId: `run_for_${message.messageId}`
    }))

    const result = await handleFeishuWebhook({
      headers: {
        'x-lark-request-timestamp': '1710000000',
        'x-lark-request-nonce': 'nonce',
        'x-lark-signature': signature
      },
      rawBody,
      config: { verificationToken: 'verify-token', encryptKey: 'encrypt-key' },
      orchestrator: { receiveFeishuMessage }
    })

    expect(result.ok).toBe(true)
    expect(result).toMatchObject({
      kind: 'message',
      responseBody: { code: 0, msg: 'ok', runId: 'run_for_om_message' }
    })
    expect(receiveFeishuMessage).toHaveBeenCalledWith({
      text: 'run [local-path] with appSecret=[redacted]',
      messageId: 'om_message',
      chatId: 'oc_chat',
      senderOpenId: 'ou_user',
      eventType: 'im.message.receive_v1'
    })
  })

  it('rejects signed callbacks with mismatched signatures', async () => {
    const result = await handleFeishuWebhook({
      headers: {
        'x-lark-request-timestamp': '1710000000',
        'x-lark-request-nonce': 'nonce',
        'x-lark-signature': '0'.repeat(64)
      },
      rawBody: '{}',
      config: { encryptKey: 'encrypt-key' }
    })

    expect(result).toEqual({
      ok: false,
      status: 401,
      reason: 'invalid_signature',
      responseBody: { code: 401, msg: 'invalid_signature' }
    })
  })

  it('resolves gates from card action callbacks', async () => {
    const resolvedGate: FeishuGateResolutionResult = {
      ok: true,
      gate: {
        id: 'gate_1',
        task_id: 'task_1',
        question: 'Proceed?',
        options: '["yes"]',
        status: 'resolved',
        resolution: 'yes',
        created_at: '2026-05-26 00:00:00',
        resolved_at: '2026-05-26 00:00:01'
      }
    }
    const resolveFeishuGate: FeishuGatewayOrchestrator['resolveFeishuGate'] = vi.fn(
      () => resolvedGate
    )

    const result = await handleFeishuWebhook({
      headers: {},
      rawBody: JSON.stringify({
        token: 'verify-token',
        event: {
          action: {
            value: {
              action: 'resolve_gate',
              run_id: 'run_1',
              gate_id: 'gate_1',
              resolution: 'yes'
            }
          }
        }
      }),
      config: { verificationToken: 'verify-token' },
      orchestrator: { receiveFeishuMessage: vi.fn(), resolveFeishuGate }
    })

    expect(result).toEqual({
      ok: true,
      kind: 'gate_resolution',
      status: 200,
      responseBody: { code: 0, msg: 'ok', gateId: 'gate_1' }
    })
    expect(resolveFeishuGate).toHaveBeenCalledWith({
      runId: 'run_1',
      gateId: 'gate_1',
      resolution: 'yes'
    })
  })

  it('rejects stale card action callbacks', async () => {
    const staleGate: FeishuGateResolutionResult = {
      ok: false,
      reason: 'gate_already_closed'
    }
    const result = await handleFeishuWebhook({
      headers: {},
      rawBody: JSON.stringify({
        token: 'verify-token',
        event: {
          action: {
            value: {
              action: 'resolve_gate',
              run_id: 'run_1',
              gate_id: 'gate_1',
              resolution: 'yes'
            }
          }
        }
      }),
      config: { verificationToken: 'verify-token' },
      orchestrator: {
        receiveFeishuMessage: vi.fn(),
        resolveFeishuGate: vi.fn(() => staleGate)
      }
    })

    expect(result).toEqual({
      ok: false,
      status: 400,
      reason: 'gate_resolution_failed',
      responseBody: { code: 400, msg: 'gate_resolution_failed:gate_already_closed' }
    })
  })
})

describe('Feishu sanitizer and cards', () => {
  it('redacts local paths and secret references from text', () => {
    expect(
      sanitizeFeishuText(
        'path=/Users/alice/project/orca secret keychain:orca/feishu/app-secret token=abc'
      )
    ).toBe('path=[local-path] secret keychain:[redacted] token=[redacted]')
  })

  it('builds run status cards without leaking local paths', () => {
    const card = buildFeishuRunStatusCard({
      status: 'blocked',
      runId: 'run_1',
      summary: 'Needs review for /Users/alice/project/orca and keychain:orca/feishu/app-secret',
      gateId: 'gate_1',
      options: ['Approve /Users/alice/project/orca', 'Reject'],
      tasks: [{ id: 'task_1', title: 'Patch /Users/alice/project/orca/src/a.ts', status: 'blocked' }],
      artifacts: ['/Users/alice/project/orca/artifacts/task_1/manifest.json']
    })

    const serialized = JSON.stringify(card)
    expect(serialized).toContain('[local-path]')
    expect(serialized).toContain('keychain:[redacted]')
    expect(serialized).not.toContain('/Users/alice')
    expect(serialized).not.toContain('keychain:orca')
  })
})
