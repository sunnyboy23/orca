import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { test, expect } from './helpers/orca-app'
import { waitForActiveWorktree, waitForSessionReady } from './helpers/store'
import {
  activeWorktreePath,
  callRuntime,
  openOrchestration,
  type RuntimeDetail
} from './helloagents-orchestration-runtime'
import { runFullstackFixture } from './helloagents-fullstack-flows'

test.describe.serial('HelloAGENTS fullstack orchestration E2E', () => {
  test.beforeEach(async ({ orcaPage }) => {
    await waitForSessionReady(orcaPage)
    await waitForActiveWorktree(orcaPage)
  })

  test('converts fullstack task JSON into an Orca DAG, records feedback, and renders UI', async ({
    electronApp,
    orcaPage
  }) => {
    const workspaceRoot = await activeWorktreePath(orcaPage)
    const result = await runFullstackFixture(electronApp, orcaPage, workspaceRoot)
    const detail = await callRuntime<RuntimeDetail>(orcaPage, 'orchestration.runDetail', {
      runId: result.runId
    })

    expect(detail.run.status).toBe('completed')
    expect(detail.tasks).toHaveLength(3)
    expect(detail.artifacts).toHaveLength(3)
    expect(detail.tasks.map((task) => task.status)).toEqual([
      'completed',
      'completed',
      'completed'
    ])
    expect(result.prompts.T1).toContain('Repo name: config-service')
    expect(result.prompts.T1).toContain(
      'Project path: redacted; resolve repo_name through Orca Team Config before dispatch'
    )
    expect(result.prompts.T2).toContain('=== UPSTREAM ARTIFACTS ===')
    expect(result.prompts.T2).toContain('fullstack/contracts/domain-config.md')
    expect(result.prompts.T3).toContain('fullstack/contracts/config-api.md')

    await openOrchestration(orcaPage)
    await expect(orcaPage.getByRole('heading', { name: 'Task DAG' })).toBeVisible()
    await expect(orcaPage.getByRole('heading', { name: result.requirement })).toBeVisible()
    await expect(orcaPage.getByText('FULLSTACK', { exact: true })).toHaveCount(2)
    await expect(orcaPage.getByText('fullstack/reports/config-management-report.md')).toBeVisible()
    await expect(orcaPage.getByText('Repo: config-service')).toBeVisible()
    await expect(orcaPage.getByText('Repo: config-api')).toBeVisible()
    await expect(orcaPage.getByText('Repo: config-web')).toBeVisible()

    await expect
      .poll(() => existsSync(path.join(result.helloAgentsRoot, 'contract.json')), {
        timeout: 10_000,
        message: 'Fullstack contract was not persisted'
      })
      .toBe(true)
    const contract = readFileSync(path.join(result.helloAgentsRoot, 'contract.json'), 'utf8')
    expect(contract).toContain('"mode": "fullstack"')
    expect(contract).toContain('fullstack/reports/feedback-summary.md')
    expect(readFileSync(path.join(result.helloAgentsRoot, 'tasks.md'), 'utf8')).toContain(
      result.tasks.T3
    )
  })
})
