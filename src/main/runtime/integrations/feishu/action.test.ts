import { describe, expect, it } from 'vitest'
import { extractFeishuCardAction } from './action'

describe('extractFeishuCardAction', () => {
  it('extracts gate resolution values from Feishu card callbacks', () => {
    expect(
      extractFeishuCardAction({
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
      })
    ).toEqual({
      type: 'resolve_gate',
      request: { runId: 'run_1', gateId: 'gate_1', resolution: 'yes' }
    })
  })

  it('returns unknown for unrelated actions', () => {
    expect(extractFeishuCardAction({ event: { action: { value: { action: 'noop' } } } })).toEqual({
      type: 'unknown'
    })
  })
})
