import { spawnSync } from 'child_process'
import { describe, expect, it } from 'vitest'
import { buildDispatchPreamble } from './preamble'

function baseParams(overrides: Partial<Parameters<typeof buildDispatchPreamble>[0]> = {}) {
  return {
    runId: 'run_xyz789',
    taskId: 'task_abc123',
    dispatchId: 'ctx_def456',
    taskSpec: 'Implement the login form',
    coordinatorHandle: 'term_coord',
    repoName: 'orca',
    worktreeSelector: 'id:wt_login',
    ...overrides
  }
}

describe('buildDispatchPreamble', () => {
  it('substitutes template variables', () => {
    const result = buildDispatchPreamble(baseParams())

    expect(result).toContain('task_abc123')
    expect(result).toContain('ctx_def456')
    expect(result).toContain('run_xyz789')
    expect(result).toContain('orca')
    expect(result).toContain('id:wt_login')
    expect(result).toContain('term_coord')
    expect(result).toContain('Implement the login form')
    expect(result).not.toContain('{{')
  })

  it('includes worker_done command with --body 3-sentence summary prompt and manifestPath', () => {
    const result = buildDispatchPreamble(baseParams())

    expect(result).toContain('worker_done')
    expect(result).toContain('orchestration send')
    expect(result).toContain('orchestration check')
    expect(result).toContain('--body')
    expect(result).toMatch(/3-sentence summary/)
    expect(result).toContain('manifestPath')
    expect(result).toContain('artifacts/task_abc123/manifest.json')
  })

  it('includes artifact manifest instructions and execution boundaries', () => {
    const result = buildDispatchPreamble(
      baseParams({
        allowedPaths: ['src/main/runtime/**', 'tests/**'],
        forbiddenPaths: ['mobile/**', '.env']
      })
    )

    expect(result).toContain('=== EXECUTION BOUNDARY ===')
    expect(result).toContain('Required artifact manifest')
    expect(result).toContain('"taskId": "task_abc123"')
    expect(result).toContain('- src/main/runtime/**')
    expect(result).toContain('- tests/**')
    expect(result).toContain('- mobile/**')
    expect(result).toContain('- .env')
    expect(result).toContain('Do not follow absolute paths')
  })

  it('CLI examples parse as valid shell (bash -n on the extracted block)', () => {
    const result = buildDispatchPreamble(baseParams())
    // Why: feeding `bash -n` the full preamble falsely fails on apostrophes
    // in the surrounding prose. Slice between the CLI markers and strip
    // shell-style comment lines so we only syntax-check the commands.
    const cliStart = result.indexOf('=== CLI COMMANDS ===')
    const cliEnd = result.indexOf('=== AFTER YOU SEND worker_done ===')
    expect(cliStart).toBeGreaterThan(-1)
    expect(cliEnd).toBeGreaterThan(cliStart)
    const block = result.slice(cliStart, cliEnd)
    const stripped = block
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .filter((line) => !line.trim().startsWith('==='))
      .join('\n')

    const check = spawnSync('bash', ['-n'], { input: stripped, encoding: 'utf8' })
    expect(check.status).toBe(0)
  })

  it('includes heartbeat CLI block with taskId and dispatchId and 5-minute cadence', () => {
    const result = buildDispatchPreamble(baseParams())
    expect(result).toContain('--type heartbeat')
    expect(result).toContain('--subject "alive"')
    expect(result).toMatch(/5 minutes/)
    // Both taskId and dispatchId are rendered inside the payload template
    // (regression guard for §5.3.4 attribution — dispatchId attribution
    // prevents the zombie-heartbeat-masks-hung-retry race).
    const heartbeatLine = result
      .split('\n')
      .find((line) => line.includes('"taskId"') && line.includes('dispatchId'))
    expect(heartbeatLine).toBeTruthy()
    expect(heartbeatLine).toContain('task_abc123')
    expect(heartbeatLine).toContain('ctx_def456')
  })

  it('includes ask block with BEHAVIOR RULE #1 forbidding AskUserQuestion', () => {
    const result = buildDispatchPreamble(baseParams())
    expect(result).toContain('orchestration ask')
    expect(result).toContain('--question')
    expect(result).toContain('--timeout-ms 600000')
    // Why: the exact phrase is asserted so the rule can't be trimmed away by
    // accident. BEHAVIOR RULE #1 is the only place AskUserQuestion appears.
    expect(result).toContain('BEHAVIOR RULE #1')
    expect(result).toContain('NEVER use AskUserQuestion')
    // AskUserQuestion must appear ONLY inside the rule text, not anywhere
    // else (e.g., not in an example payload or header). Count occurrences
    // of the exact token as a sanity check.
    const occurrences = (result.match(/AskUserQuestion/g) ?? []).length
    // Three mentions: the one-liner ban, the TUI-prompt rationale, and the
    // "when tempted to reach for AskUserQuestion" closing line.
    expect(occurrences).toBe(3)
  })

  it('includes AFTER YOU SEND block with 2-minute poll cadence and release signal', () => {
    const result = buildDispatchPreamble(baseParams())
    expect(result).toContain('=== AFTER YOU SEND worker_done ===')
    expect(result).toMatch(/2 minutes/)
    expect(result).toMatch(/may exit/)
  })

  it('uses === TASK === separator with the task spec appended', () => {
    const result = buildDispatchPreamble(baseParams({ taskSpec: 'refactor the auth module' }))
    expect(result).toContain('=== TASK ===')
    expect(result).toContain('refactor the auth module')
  })

  it('uses orca CLI by default when devMode is not set', () => {
    const result = buildDispatchPreamble(baseParams())
    expect(result).toContain('orca orchestration send')
    expect(result).toContain('orca orchestration check')
    expect(result).toContain('orca orchestration ask')
  })

  it('uses orca-dev CLI when devMode is true', () => {
    const result = buildDispatchPreamble(baseParams({ devMode: true }))
    expect(result).toContain('orca-dev orchestration send')
    expect(result).toContain('orca-dev orchestration check')
    expect(result).toContain('orca-dev orchestration ask')
    const fragments = result.split('orca-dev')
    for (const fragment of fragments) {
      expect(fragment).not.toMatch(/orca orchestration/)
    }
  })

  it('uses orca CLI when devMode is false', () => {
    const result = buildDispatchPreamble(baseParams({ devMode: false }))
    expect(result).toContain('orca orchestration send')
    expect(result).toContain('orca orchestration check')
  })

  it('appends a BASE DRIFT section when baseDrift.behind > 0', () => {
    const result = buildDispatchPreamble({
      runId: 'run_x',
      taskId: 'task_x',
      dispatchId: 'ctx_x',
      taskSpec: 'do stuff',
      coordinatorHandle: 'term_c',
      baseDrift: {
        base: 'origin/main',
        behind: 7,
        recentSubjects: ['fix: A', 'feat: B', 'chore: C']
      }
    })

    expect(result).toContain('--- BASE DRIFT ---')
    expect(result).toContain('7 commits behind origin/main')
    expect(result).toContain('  - fix: A')
    expect(result).toContain('  - feat: B')
    expect(result).toContain('  - chore: C')
    // drift section must appear before the task spec
    expect(result.indexOf('--- BASE DRIFT ---')).toBeLessThan(result.indexOf('=== TASK ==='))
  })

  it('omits the drift section when baseDrift.behind is 0', () => {
    const result = buildDispatchPreamble({
      runId: 'run_x',
      taskId: 'task_x',
      dispatchId: 'ctx_x',
      taskSpec: 'do stuff',
      coordinatorHandle: 'term_c',
      baseDrift: {
        base: 'origin/main',
        behind: 0,
        recentSubjects: []
      }
    })

    expect(result).not.toContain('--- BASE DRIFT ---')
    expect(result).not.toContain('commits behind')
  })

  it('omits the drift section when baseDrift is undefined', () => {
    const result = buildDispatchPreamble({
      runId: 'run_x',
      taskId: 'task_x',
      dispatchId: 'ctx_x',
      taskSpec: 'do stuff',
      coordinatorHandle: 'term_c'
    })

    expect(result).not.toContain('--- BASE DRIFT ---')
    expect(result).not.toContain('commits behind')
  })

  it('injects upstream artifact summaries before the task block', () => {
    const result = buildDispatchPreamble(
      baseParams({
        upstreamArtifacts: [
          {
            taskId: 'task_api',
            manifestPath: 'artifacts/task_api/manifest.json',
            filesChanged: ['src/api.ts'],
            contracts: ['artifacts/task_api/contract.md'],
            verification: [{ command: 'pnpm test', status: 'passed' }],
            downstreamNotes: 'Use POST /v1/items.'
          }
        ]
      })
    )

    expect(result).toContain('=== UPSTREAM ARTIFACTS ===')
    expect(result).toContain('Dependency task: task_api')
    expect(result).toContain('Manifest: artifacts/task_api/manifest.json')
    expect(result).toContain('  - src/api.ts')
    expect(result).toContain('Use POST /v1/items.')
    expect(result.indexOf('=== UPSTREAM ARTIFACTS ===')).toBeLessThan(result.indexOf('=== TASK ==='))
  })

  it('lists drift subjects in the order provided, each prefixed with two spaces and dash', () => {
    const result = buildDispatchPreamble({
      runId: 'run_x',
      taskId: 'task_x',
      dispatchId: 'ctx_x',
      taskSpec: 'do stuff',
      coordinatorHandle: 'term_c',
      baseDrift: {
        base: 'origin/main',
        behind: 3,
        recentSubjects: ['first', 'second', 'third']
      }
    })

    const firstIdx = result.indexOf('  - first')
    const secondIdx = result.indexOf('  - second')
    const thirdIdx = result.indexOf('  - third')
    expect(firstIdx).toBeGreaterThanOrEqual(0)
    expect(secondIdx).toBeGreaterThan(firstIdx)
    expect(thirdIdx).toBeGreaterThan(secondIdx)
  })

  it('renders a stable snapshot of the full preamble', () => {
    // Why: single strict snapshot catches any accidental regression in
    // formatting or rule presence in one line.
    const result = buildDispatchPreamble({
      runId: 'run_SNAP',
      taskId: 'task_SNAP',
      dispatchId: 'ctx_SNAP',
      taskSpec: 'TASK_BODY',
      coordinatorHandle: 'term_COORD',
      repoName: 'repo_SNAP',
      worktreeSelector: 'id:wt_SNAP',
      allowedPaths: ['src/**'],
      forbiddenPaths: ['mobile/**']
    })
    expect(result).toMatchSnapshot()
  })
})
