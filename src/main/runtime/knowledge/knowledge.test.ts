import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OrchestrationDb } from '../orchestration/db'
import { appendRunChangelog } from './changelog-writer'
import { buildCodeGraph } from './codegraph'
import { indexKnowledgeContext, readKnowledgeContext } from './context-indexer'
import { detectKnowledgeDrift } from './drift-detector'
import { syncKnowledgeToFeishuView } from './feishu-sync-view'

describe('Knowledge Layer', () => {
  let root: string
  let db: OrchestrationDb | null = null

  afterEach(async () => {
    db?.close()
    db = null
    if (root) {
      await rm(root, { recursive: true, force: true })
    }
  })

  async function createRepoFixture(): Promise<string> {
    root = await mkdtemp(join(tmpdir(), 'orca-knowledge-'))
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'src', 'index.ts'), "import { answer } from './lib'\nanswer()\n")
    await writeFile(join(root, 'src', 'lib.ts'), 'export const answer = () => 42\n')
    await writeFile(join(root, 'src', 'lib.test.ts'), "import { answer } from './lib'\n")
    await writeFile(join(root, 'README.md'), '# Fixture\n')
    return root
  }

  it('creates a generated context index inside repo .helloagents', async () => {
    const repoRoot = await createRepoFixture()

    const summary = await indexKnowledgeContext({
      repoRoot,
      repoName: 'orca',
      now: '2026-05-26T00:00:00.000Z'
    })
    const context = await readKnowledgeContext(join(repoRoot, '.helloagents', 'context.md'))

    expect(summary.modules.map((module) => module.path)).toContain('src/index.ts')
    expect(context).toContain('ORCA_KNOWLEDGE:GENERATED START')
    expect(context).toContain('- src/lib.ts (source)')
    expect(context).not.toContain('.helloagents')
  })

  it('builds a local CodeGraph and detects missing context drift', async () => {
    const repoRoot = await createRepoFixture()

    const graph = await buildCodeGraph({ repoRoot, now: '2026-05-26T00:00:00.000Z' })
    const warnings = detectKnowledgeDrift({
      graph,
      contextMarkdown: '# context\n- src/index.ts\n<!-- ORCA_KNOWLEDGE:GENERATED START -->'
    })

    expect(graph.nodes.map((node) => node.path)).toEqual([
      'src/index.ts',
      'src/lib.test.ts',
      'src/lib.ts'
    ])
    expect(graph.edges).toContainEqual({ from: 'src/index.ts', to: 'src/lib.ts', type: 'imports' })
    expect(warnings).toContainEqual(
      expect.objectContaining({ path: 'src/lib.ts', reason: 'missing_from_context' })
    )
  })

  it('appends run completion changes to repo CHANGELOG', async () => {
    const repoRoot = await createRepoFixture()
    db = new OrchestrationDb(':memory:')
    const run = db.createCoordinatorRun({ spec: 'ship feature', coordinatorHandle: 'coord' })
    const task = db.createTask({ spec: 'edit lib', runId: run.id })
    db.upsertArtifactManifest({
      runId: run.id,
      taskId: task.id,
      manifestPath: 'artifacts/task/manifest.json',
      status: 'completed',
      filesChanged: ['src/lib.ts'],
      verification: [{ command: 'pnpm test', status: 'passed' }]
    })
    db.updateCoordinatorRun(run.id, 'completed')

    const change = await appendRunChangelog({
      repoRoot,
      run: db.getCoordinatorRun(run.id)!,
      tasks: db.listTasks({ runId: run.id }),
      artifacts: db.listArtifactManifests({ runId: run.id }),
      now: '2026-05-26T00:00:00.000Z'
    })
    const changelog = await readFile(join(repoRoot, '.helloagents', 'CHANGELOG.md'), 'utf8')

    expect(change.filesChanged).toEqual(['src/lib.ts'])
    expect(changelog).toContain(run.id)
    expect(changelog).toContain('src/lib.ts')
    expect(changelog).toContain('pnpm test')
  })

  it('builds a Feishu Wiki sync payload and reports retryable failures', async () => {
    const repoRoot = await createRepoFixture()
    const summary = await indexKnowledgeContext({
      repoRoot,
      repoName: 'orca',
      now: '2026-05-26T00:00:00.000Z'
    })
    const graph = await buildCodeGraph({ repoRoot, now: summary.generatedAt })
    const syncProjectKnowledge = vi.fn(async () => {
      throw new Error('network unavailable')
    })

    const result = await syncKnowledgeToFeishuView({
      sink: { syncProjectKnowledge },
      wikiSpaceId: 'spc_team',
      projectDocsRootToken: 'wikcn_projects',
      summary,
      graph,
      recentChanges: [],
      driftWarnings: []
    })

    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ retryable: true, reason: 'network unavailable' })
    expect(result.payload.markdown).toContain('# orca 项目资料')
    expect(syncProjectKnowledge).toHaveBeenCalledWith(result.payload)
  })
})
