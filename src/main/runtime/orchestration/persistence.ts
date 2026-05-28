import type { OrchestrationDb } from './db'
import {
  buildHelloAgentsFileSet,
  writeHelloAgentsFileSet,
  type HelloAgentsFilePaths,
  type HelloAgentsRunSnapshot
} from './helloagents-files'

export type PersistenceResult =
  | { ok: true; paths: HelloAgentsFilePaths }
  | { ok: false; reason: string }

export function buildRunSnapshot(params: {
  db: Pick<OrchestrationDb, 'getCoordinatorRun' | 'listTasks' | 'listArtifactManifests'>
  runId: string
  now?: string
}): HelloAgentsRunSnapshot {
  const run = params.db.getCoordinatorRun(params.runId)
  if (!run) {
    throw new Error(`Coordinator run not found: ${params.runId}`)
  }
  return {
    run,
    tasks: params.db.listTasks({ runId: params.runId }),
    artifacts: params.db.listArtifactManifests({ runId: params.runId }),
    updatedAt: params.now ?? new Date().toISOString()
  }
}

export async function persistRunSnapshot(params: {
  db: Pick<OrchestrationDb, 'getCoordinatorRun' | 'listTasks' | 'listArtifactManifests'>
  runId: string
  helloAgentsRoot: string
  now?: string
  paths?: Partial<HelloAgentsFilePaths>
}): Promise<PersistenceResult> {
  let snapshot: HelloAgentsRunSnapshot
  try {
    snapshot = buildRunSnapshot({
      db: params.db,
      runId: params.runId,
      now: params.now
    })
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }

  try {
    const paths = await writeHelloAgentsFileSet({
      rootDir: params.helloAgentsRoot,
      files: buildHelloAgentsFileSet(snapshot),
      paths: params.paths
    })
    return { ok: true, paths }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}
