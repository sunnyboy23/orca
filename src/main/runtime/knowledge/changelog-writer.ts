import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ArtifactManifestRow, CoordinatorRun, TaskRow } from '../orchestration/db'
import type { KnowledgeRunChange } from './types'

export async function appendRunChangelog(params: {
  repoRoot: string
  run: CoordinatorRun
  tasks: TaskRow[]
  artifacts: ArtifactManifestRow[]
  now?: string
}): Promise<KnowledgeRunChange> {
  const change = buildRunChange(params)
  const path = join(params.repoRoot, '.helloagents', 'CHANGELOG.md')
  const existing = await readExisting(path)
  const content = existing.trim()
  const next = `${content || '# CHANGELOG'}\n\n${formatRunChange(change)}`
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${next.trimEnd()}\n`, 'utf8')
  return change
}

export function buildRunChange(params: {
  run: CoordinatorRun
  tasks: TaskRow[]
  artifacts: ArtifactManifestRow[]
  now?: string
}): KnowledgeRunChange {
  return {
    runId: params.run.id,
    status: params.run.status,
    summary: `${params.run.spec} (${params.tasks.length} tasks)`,
    filesChanged: unique(
      params.artifacts.flatMap((artifact) => parseJsonArray<string>(artifact.files_changed))
    ),
    verification: params.artifacts.flatMap((artifact) =>
      parseJsonArray<unknown>(artifact.verification).map((item) =>
        typeof item === 'string' ? item : JSON.stringify(item)
      )
    ),
    completedAt: params.now ?? new Date().toISOString()
  }
}

function formatRunChange(change: KnowledgeRunChange): string {
  const files =
    change.filesChanged.length > 0
      ? change.filesChanged.map((file) => `  - ${file}`).join('\n')
      : '  - （无）'
  const verification =
    change.verification.length > 0
      ? change.verification.map((item) => `  - ${item}`).join('\n')
      : '  - （无）'
  return [
    `## ${change.completedAt}`,
    '',
    `- **run**: ${change.runId}`,
    `- **status**: ${change.status}`,
    `- **summary**: ${change.summary}`,
    '- **files**:',
    files,
    '- **verification**:',
    verification
  ].join('\n')
}

async function readExisting(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return ''
  }
}

function parseJsonArray<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}
