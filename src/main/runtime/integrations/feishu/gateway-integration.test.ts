import { describe, expect, it } from 'vitest'
import { OrchestrationDb } from '../../orchestration/db'
import { buildFeishuRunStatusCard } from './cards'
import { resolveFeishuDecisionGate } from './gate-resolver'
import { handleFeishuWebhook, type FeishuGatewayOrchestrator } from './gateway'
import { calculateFeishuEventSignature } from './signature'

type SignedWebhook = {
  headers: {
    'x-lark-request-timestamp': string
    'x-lark-request-nonce': string
    'x-lark-signature': string
  }
  rawBody: string
}

describe('Feishu Gateway mocked integration', () => {
  it('handles signed messages, resolves card gates, and keeps cards sanitized', async () => {
    const db = new OrchestrationDb(':memory:')
    try {
      const run = db.createCoordinatorRun({
        spec: 'Review /Users/alice/project/orca before publishing token=abc',
        coordinatorHandle: 'coord',
        mode: 'r2',
        source: 'feishu'
      })
      const task = db.createTask({
        spec: 'Wait for Feishu approval',
        runId: run.id,
        repoName: 'orca',
        artifactDir: 'artifacts/approval'
      })
      const gate = db.createGate({
        taskId: task.id,
        question: 'Approve /Users/alice/project/orca?',
        options: ['Approve keychain:orca/feishu/app-secret', 'Reject']
      })
      const receivedMessages: string[] = []
      const orchestrator: FeishuGatewayOrchestrator = {
        receiveFeishuMessage(message) {
          receivedMessages.push(message.text)
          return { runId: run.id }
        },
        resolveFeishuGate(request) {
          return resolveFeishuDecisionGate(db, request)
        }
      }

      const messageResult = await handleFeishuWebhook({
        ...signWebhook({
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
        }),
        config: { verificationToken: 'verify-token', encryptKey: 'encrypt-key' },
        orchestrator
      })

      expect(messageResult).toMatchObject({
        ok: true,
        kind: 'message',
        responseBody: { code: 0, msg: 'ok', runId: run.id }
      })
      expect(receivedMessages).toEqual(['run [local-path] with appSecret=[redacted]'])

      const card = buildFeishuRunStatusCard({
        status: 'waiting',
        runId: run.id,
        summary: 'Waiting at /Users/alice/project/orca with token=abc',
        gateId: gate.id,
        options: ['Approve /Users/alice/project/orca', 'Reject keychain:orca/secret'],
        tasks: [
          {
            id: task.id,
            title: 'Review /Users/alice/project/orca/src/main.ts',
            status: 'blocked'
          }
        ],
        artifacts: ['/Users/alice/project/orca/artifacts/approval/manifest.json']
      })
      const serializedCard = JSON.stringify(card)
      expect(serializedCard).toContain('[local-path]')
      expect(serializedCard).toContain('keychain:[redacted]')
      expect(serializedCard).not.toContain('/Users/alice')
      expect(serializedCard).not.toContain('token=abc')

      const actionResult = await handleFeishuWebhook({
        ...signWebhook({
          token: 'verify-token',
          event: {
            action: {
              value: {
                action: 'resolve_gate',
                run_id: run.id,
                gate_id: gate.id,
                resolution: 'Approve'
              }
            }
          }
        }),
        config: { verificationToken: 'verify-token', encryptKey: 'encrypt-key' },
        orchestrator
      })

      expect(actionResult).toEqual({
        ok: true,
        kind: 'gate_resolution',
        status: 200,
        responseBody: { code: 0, msg: 'ok', gateId: gate.id }
      })
      expect(db.getGate(gate.id)).toMatchObject({
        status: 'resolved',
        resolution: 'Approve'
      })
      expect(db.getTask(task.id)?.status).toBe('ready')
    } finally {
      db.close()
    }
  })

  it('rejects forged callbacks before they can affect orchestration state', async () => {
    const db = new OrchestrationDb(':memory:')
    try {
      const run = db.createCoordinatorRun({ spec: 'guard', coordinatorHandle: 'coord' })
      const task = db.createTask({ spec: 'blocked', runId: run.id })
      const gate = db.createGate({ taskId: task.id, question: 'Proceed?' })

      const result = await handleFeishuWebhook({
        headers: {
          'x-lark-request-timestamp': '1710000000',
          'x-lark-request-nonce': 'nonce',
          'x-lark-signature': '0'.repeat(64)
        },
        rawBody: JSON.stringify({
          token: 'verify-token',
          event: {
            action: {
              value: {
                action: 'resolve_gate',
                run_id: run.id,
                gate_id: gate.id,
                resolution: 'Approve'
              }
            }
          }
        }),
        config: { verificationToken: 'verify-token', encryptKey: 'encrypt-key' },
        orchestrator: {
          receiveFeishuMessage() {
            return { runId: run.id }
          },
          resolveFeishuGate(request) {
            return resolveFeishuDecisionGate(db, request)
          }
        }
      })

      expect(result).toEqual({
        ok: false,
        status: 401,
        reason: 'invalid_signature',
        responseBody: { code: 401, msg: 'invalid_signature' }
      })
      expect(db.getGate(gate.id)?.status).toBe('pending')
      expect(db.getTask(task.id)?.status).toBe('blocked')
    } finally {
      db.close()
    }
  })
})

function signWebhook(body: Record<string, unknown>): SignedWebhook {
  const rawBody = JSON.stringify(body)
  const timestamp = '1710000000'
  const nonce = 'nonce'
  return {
    headers: {
      'x-lark-request-timestamp': timestamp,
      'x-lark-request-nonce': nonce,
      'x-lark-signature': calculateFeishuEventSignature({
        timestamp,
        nonce,
        encryptKey: 'encrypt-key',
        rawBody
      })
    },
    rawBody
  }
}
