import { buildFeishuRunStatusCard, type FeishuRunCardStatus } from './cards'
import { sendFeishuInteractiveCard, type FeishuMessageClient } from './im-client'
import type { ArtifactManifestRow, CoordinatorRun, DecisionGateRow, TaskRow } from '../../orchestration/types'

export type FeishuRunStatusSnapshot = {
  run: CoordinatorRun
  tasks: TaskRow[]
  gates?: DecisionGateRow[]
  artifacts?: ArtifactManifestRow[]
}

export type FeishuRunStatusPublisher = {
  publish(snapshot: FeishuRunStatusSnapshot, chatId: string | undefined): Promise<void>
}

export function createFeishuRunStatusPublisher({
  client,
  minIntervalMs = 3000
}: {
  client: FeishuMessageClient
  minIntervalMs?: number
}): FeishuRunStatusPublisher {
  let lastPublishedAt = 0
  let lastSignature = ''

  return {
    async publish(snapshot, chatId) {
      const signature = buildSnapshotSignature(snapshot)
      const status = mapRunCardStatus(snapshot)
      const now = Date.now()
      if (signature === lastSignature && status === 'running' && now - lastPublishedAt < minIntervalMs) {
        return
      }
      lastPublishedAt = now
      lastSignature = signature
      await sendFeishuInteractiveCard({
        client,
        chatId,
        card: buildFeishuRunStatusCard({
          status,
          runId: snapshot.run.id,
          title: `Orca ${status}`,
          summary: snapshot.run.spec,
          gateId: snapshot.gates?.find((gate) => gate.status === 'pending')?.id,
          options: readPendingGateOptions(snapshot.gates),
          tasks: snapshot.tasks.map((task) => ({
            id: task.id,
            title: task.spec,
            status: task.status
          })),
          artifacts: snapshot.artifacts?.map((artifact) => artifact.manifest_path)
        })
      })
    }
  }
}

function mapRunCardStatus(snapshot: FeishuRunStatusSnapshot): FeishuRunCardStatus {
  if (snapshot.gates?.some((gate) => gate.status === 'pending')) {
    return 'waiting'
  }
  if (snapshot.run.status === 'completed') {
    return 'completed'
  }
  if (snapshot.run.status === 'failed') {
    return 'failed'
  }
  if (snapshot.tasks.some((task) => task.status === 'blocked')) {
    return 'blocked'
  }
  return 'running'
}

function readPendingGateOptions(gates: DecisionGateRow[] | undefined): string[] | undefined {
  const pending = gates?.find((gate) => gate.status === 'pending')
  if (!pending) {
    return undefined
  }
  try {
    const parsed = JSON.parse(pending.options) as unknown
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')
      ? parsed
      : undefined
  } catch {
    return undefined
  }
}

function buildSnapshotSignature(snapshot: FeishuRunStatusSnapshot): string {
  return JSON.stringify({
    run: [snapshot.run.id, snapshot.run.status],
    tasks: snapshot.tasks.map((task) => [task.id, task.status]),
    gates: snapshot.gates?.map((gate) => [gate.id, gate.status]),
    artifacts: snapshot.artifacts?.map((artifact) => [artifact.id, artifact.status])
  })
}
