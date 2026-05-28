import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  indexArtifactManifest,
  readAndValidateArtifactManifest,
  validateArtifactManifest
} from './artifacts'

describe('artifact manifest validation', () => {
  let tempDir: string | undefined

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
      tempDir = undefined
    }
  })

  it('normalizes a valid manifest', () => {
    const result = validateArtifactManifest(
      {
        taskId: 'task_api',
        status: 'completed',
        filesChanged: ['src/api.ts'],
        contracts: ['artifacts/task_api/api.md'],
        verification: [{ command: 'pnpm test', status: 'passed' }],
        downstreamNotes: 'Frontend can call POST /api.'
      },
      'task_api'
    )

    expect(result).toEqual({
      ok: true,
      manifest: {
        taskId: 'task_api',
        status: 'completed',
        filesChanged: ['src/api.ts'],
        contracts: ['artifacts/task_api/api.md'],
        verification: [{ command: 'pnpm test', status: 'passed' }],
        downstreamNotes: 'Frontend can call POST /api.'
      }
    })
  })

  it('returns task_mismatch when manifest belongs to another task', () => {
    const result = validateArtifactManifest(
      {
        taskId: 'task_other',
        status: 'completed'
      },
      'task_expected'
    )

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'task_mismatch' }
    })
  })

  it('rejects malformed schemas', () => {
    const result = validateArtifactManifest({
      taskId: 'task_api',
      status: 'done',
      verification: [{ command: '', status: 'passed' }]
    })

    expect(result).toMatchObject({
      ok: false,
      error: { kind: 'invalid_schema' }
    })
  })

  it('reads and validates a manifest from a workspace-relative path', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-artifacts-'))
    await mkdir(join(tempDir, 'artifacts', 'task_api'), { recursive: true })
    await writeFile(
      join(tempDir, 'artifacts', 'task_api', 'manifest.json'),
      JSON.stringify({
        taskId: 'task_api',
        status: 'completed',
        filesChanged: ['src/api.ts']
      })
    )

    const result = await readAndValidateArtifactManifest({
      workspaceRoot: tempDir,
      manifestPath: 'artifacts/task_api/manifest.json',
      expectedTaskId: 'task_api'
    })

    expect(result).toMatchObject({
      ok: true,
      manifest: {
        taskId: 'task_api',
        status: 'completed',
        filesChanged: ['src/api.ts'],
        contracts: [],
        verification: [],
        downstreamNotes: ''
      }
    })
  })

  it('rejects absolute or escaping manifest paths', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-artifacts-'))

    await expect(
      readAndValidateArtifactManifest({
        workspaceRoot: tempDir,
        manifestPath: '/tmp/manifest.json'
      })
    ).resolves.toMatchObject({ ok: false, error: { kind: 'invalid_path' } })
    await expect(
      readAndValidateArtifactManifest({
        workspaceRoot: tempDir,
        manifestPath: '../manifest.json'
      })
    ).resolves.toMatchObject({ ok: false, error: { kind: 'invalid_path' } })
  })

  it('reports missing and invalid JSON manifests', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-artifacts-'))
    await mkdir(join(tempDir, 'artifacts'), { recursive: true })
    await writeFile(join(tempDir, 'artifacts', 'bad.json'), '{')

    await expect(
      readAndValidateArtifactManifest({
        workspaceRoot: tempDir,
        manifestPath: 'artifacts/missing.json'
      })
    ).resolves.toMatchObject({ ok: false, error: { kind: 'missing' } })
    await expect(
      readAndValidateArtifactManifest({
        workspaceRoot: tempDir,
        manifestPath: 'artifacts/bad.json'
      })
    ).resolves.toMatchObject({ ok: false, error: { kind: 'invalid_json' } })
  })

  it('indexes a validated manifest through the provided indexer', () => {
    const upsertArtifactManifest = vi.fn(() => ({ id: 'artifact_1' }))
    const result = indexArtifactManifest({
      indexer: { upsertArtifactManifest },
      runId: 'run_1',
      manifestPath: 'artifacts/task_api/manifest.json',
      manifest: {
        taskId: 'task_api',
        status: 'completed',
        filesChanged: ['src/api.ts'],
        contracts: ['artifacts/task_api/api.md'],
        verification: [{ command: 'pnpm test', status: 'passed' }],
        downstreamNotes: 'Ready for UI.'
      }
    })

    expect(result).toEqual({ id: 'artifact_1' })
    expect(upsertArtifactManifest).toHaveBeenCalledWith({
      runId: 'run_1',
      taskId: 'task_api',
      manifestPath: 'artifacts/task_api/manifest.json',
      status: 'completed',
      filesChanged: ['src/api.ts'],
      contracts: ['artifacts/task_api/api.md'],
      verification: [{ command: 'pnpm test', status: 'passed' }],
      downstreamNotes: 'Ready for UI.'
    })
  })
})
