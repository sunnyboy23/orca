import {
  indexArtifactManifest,
  readAndValidateArtifactManifest,
  type ArtifactManifestIndexer
} from './artifacts'

export type WorkerDonePayload = {
  runId?: string
  taskId?: string
  manifestPath?: string
  filesModified?: string[]
}

export type WorkerDoneArtifactResult =
  | { ok: true; status: 'completed' | 'failed' | 'blocked'; filesModified: string[] }
  | { ok: false; reason: string }

export async function validateAndIndexWorkerDoneArtifact(params: {
  payload: WorkerDonePayload
  expectedTaskId: string
  workspaceRoot?: string
  indexer: ArtifactManifestIndexer
}): Promise<WorkerDoneArtifactResult> {
  if (!params.payload.manifestPath) {
    return { ok: false, reason: 'worker_done missing payload.manifestPath' }
  }
  if (!params.workspaceRoot) {
    return { ok: false, reason: 'coordinator has no workspace root for artifact validation' }
  }

  const validation = await readAndValidateArtifactManifest({
    workspaceRoot: params.workspaceRoot,
    manifestPath: params.payload.manifestPath,
    expectedTaskId: params.expectedTaskId
  })
  if (!validation.ok) {
    return {
      ok: false,
      reason: `artifact manifest ${validation.error.kind}: ${validation.error.message}`
    }
  }

  indexArtifactManifest({
    indexer: params.indexer,
    runId: params.payload.runId,
    manifestPath: params.payload.manifestPath,
    manifest: validation.manifest
  })

  return {
    ok: true,
    status: validation.manifest.status,
    filesModified: params.payload.filesModified ?? validation.manifest.filesChanged
  }
}
