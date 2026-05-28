import { readFile } from 'node:fs/promises'
import { isAbsolute, normalize, resolve, sep } from 'node:path'
import { z } from 'zod'

export type ArtifactManifestStatus = 'completed' | 'failed' | 'blocked'

export type ArtifactVerificationEntry = {
  command: string
  status: 'passed' | 'failed' | 'skipped'
  output?: string
}

export type ArtifactManifest = {
  taskId: string
  status: ArtifactManifestStatus
  filesChanged: string[]
  contracts: string[]
  verification: ArtifactVerificationEntry[]
  downstreamNotes: string
}

export type ArtifactManifestValidationResult =
  | { ok: true; manifest: ArtifactManifest }
  | { ok: false; error: ArtifactManifestValidationError }

export type ArtifactManifestValidationError = {
  kind: 'missing' | 'invalid_path' | 'invalid_json' | 'invalid_schema' | 'task_mismatch'
  message: string
}

export type ArtifactManifestIndexer = {
  upsertArtifactManifest(manifest: {
    runId?: string
    taskId: string
    manifestPath: string
    status: string
    filesChanged?: string[]
    contracts?: string[]
    verification?: ArtifactVerificationEntry[]
    downstreamNotes?: string
  }): unknown
}

const VerificationSchema = z.object({
  command: z.string().min(1),
  status: z.enum(['passed', 'failed', 'skipped']),
  output: z.string().optional()
})

const ManifestSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(['completed', 'failed', 'blocked']),
  filesChanged: z.array(z.string().min(1)).default([]),
  contracts: z.array(z.string().min(1)).default([]),
  verification: z.array(VerificationSchema).default([]),
  downstreamNotes: z.string().default('')
})

export function validateArtifactManifest(
  value: unknown,
  expectedTaskId?: string
): ArtifactManifestValidationResult {
  const parsed = ManifestSchema.safeParse(value)
  if (!parsed.success) {
    return {
      ok: false,
      error: { kind: 'invalid_schema', message: z.prettifyError(parsed.error) }
    }
  }
  if (expectedTaskId && parsed.data.taskId !== expectedTaskId) {
    return {
      ok: false,
      error: {
        kind: 'task_mismatch',
        message: `Manifest taskId ${parsed.data.taskId} does not match ${expectedTaskId}`
      }
    }
  }
  return { ok: true, manifest: parsed.data }
}

export async function readAndValidateArtifactManifest(params: {
  workspaceRoot: string
  manifestPath: string
  expectedTaskId?: string
}): Promise<ArtifactManifestValidationResult> {
  const resolved = resolveManifestPath(params.workspaceRoot, params.manifestPath)
  if (!resolved.ok) {
    return { ok: false, error: resolved.error }
  }

  let raw: string
  try {
    raw = await readFile(resolved.path, 'utf8')
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: 'missing',
        message: err instanceof Error ? err.message : `Missing manifest: ${params.manifestPath}`
      }
    }
  }

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: 'invalid_json',
        message: err instanceof Error ? err.message : 'Invalid manifest JSON'
      }
    }
  }
  return validateArtifactManifest(value, params.expectedTaskId)
}

export function indexArtifactManifest(params: {
  indexer: ArtifactManifestIndexer
  runId?: string
  manifestPath: string
  manifest: ArtifactManifest
}): unknown {
  return params.indexer.upsertArtifactManifest({
    runId: params.runId,
    taskId: params.manifest.taskId,
    manifestPath: params.manifestPath,
    status: params.manifest.status,
    filesChanged: params.manifest.filesChanged,
    contracts: params.manifest.contracts,
    verification: params.manifest.verification,
    downstreamNotes: params.manifest.downstreamNotes
  })
}

function resolveManifestPath(
  workspaceRoot: string,
  manifestPath: string
): { ok: true; path: string } | { ok: false; error: ArtifactManifestValidationError } {
  if (isAbsolute(manifestPath)) {
    return {
      ok: false,
      error: { kind: 'invalid_path', message: 'Artifact manifest path must be relative' }
    }
  }
  const normalized = normalize(manifestPath)
  if (normalized === '..' || normalized.startsWith(`..${sep}`)) {
    return {
      ok: false,
      error: { kind: 'invalid_path', message: 'Artifact manifest path escapes workspace' }
    }
  }
  const root = resolve(workspaceRoot)
  const path = resolve(root, normalized)
  if (path !== root && !path.startsWith(`${root}${sep}`)) {
    return {
      ok: false,
      error: { kind: 'invalid_path', message: 'Artifact manifest path escapes workspace' }
    }
  }
  return { ok: true, path }
}
