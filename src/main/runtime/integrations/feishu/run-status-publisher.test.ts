import { describe, expect, it, vi } from 'vitest'
import type { CoordinatorRun, TaskRow } from '../../orchestration/types'
import { createFeishuRunStatusPublisher } from './run-status-publisher'
import type { FeishuMessageClient } from './im-client'

function mockClient(): FeishuMessageClient {
  return {
    im: {
      message: {
        create: vi.fn(async () => ({ code: 0, data: { message_id: 'om_1' } }))
      }
    }
  } as unknown as FeishuMessageClient
}

describe('createFeishuRunStatusPublisher', () => {
  it('publishes sanitized run status cards', async () => {
    const client = mockClient()
    const publisher = createFeishuRunStatusPublisher({ client, minIntervalMs: 0 })

    await publisher.publish(
      {
        run: run({ spec: 'Review /Users/alice/project/orca token=abc' }),
        tasks: [task({ spec: 'Fix /Users/alice/project/orca/src/main.ts' })]
      },
      'oc_chat'
    )

    const payload = vi.mocked(client.im.message.create).mock.calls[0]?.[0]
    expect(payload?.data.msg_type).toBe('interactive')
    expect(payload?.data.content).toContain('[local-path]')
    expect(payload?.data.content).toContain('token=[redacted]')
    expect(payload?.data.content).not.toContain('/Users/alice')
  })

  it('coalesces unchanged running snapshots inside the interval', async () => {
    const client = mockClient()
    const publisher = createFeishuRunStatusPublisher({ client, minIntervalMs: 60_000 })
    const snapshot = {
      run: run({ status: 'running' }),
      tasks: [task({ status: 'ready' })]
    }

    await publisher.publish(snapshot, 'oc_chat')
    await publisher.publish(snapshot, 'oc_chat')

    expect(client.im.message.create).toHaveBeenCalledTimes(1)
  })
})

function run(overrides: Partial<CoordinatorRun> = {}): CoordinatorRun {
  return {
    id: 'run_1',
    spec: 'work',
    status: 'running',
    mode: 'r2',
    source: 'feishu',
    coordinator_handle: 'coord',
    poll_interval_ms: 2000,
    project_id: null,
    root_repo_name: null,
    plan_path: null,
    updated_at: '2026-05-27 00:00:00',
    created_at: '2026-05-27 00:00:00',
    completed_at: null,
    ...overrides
  }
}

function task(overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id: 'task_1',
    run_id: 'run_1',
    parent_id: null,
    created_by_terminal_handle: null,
    spec: 'task',
    status: 'ready',
    deps: '[]',
    repo_name: null,
    worktree_selector: null,
    artifact_dir: null,
    result: null,
    created_at: '2026-05-27 00:00:00',
    completed_at: null,
    ...overrides
  }
}
