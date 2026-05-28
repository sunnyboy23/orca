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
import { runR2FailureFixture, runR2SuccessFixture } from './helloagents-r2-flows'

test.describe.serial('HelloAGENTS R2 orchestration E2E', () => {
  test.beforeEach(async ({ orcaPage }) => {
    await waitForSessionReady(orcaPage)
    await waitForActiveWorktree(orcaPage)
  })

  test('completes a multi-worker R2 DAG and injects upstream artifacts', async ({
    electronApp,
    orcaPage
  }) => {
    const workspaceRoot = await activeWorktreePath(orcaPage)
    const result = await runR2SuccessFixture(electronApp, orcaPage, workspaceRoot)
    expect(result.verifyPrompt).toContain('=== UPSTREAM ARTIFACTS ===')
    expect(result.verifyPrompt).toContain('api-contract')
    expect(result.verifyPrompt).toContain('web-contract')

    await openOrchestration(orcaPage)
    await expect(orcaPage.getByRole('heading', { name: 'Task DAG' })).toBeVisible()
    await expect(
      orcaPage.getByRole('heading', {
        name: 'R2 E2E DAG completes with upstream artifact propagation'
      })
    ).toBeVisible()
    await expect(orcaPage.getByText(result.tasks.verify, { exact: true })).toBeVisible()
    await expect(orcaPage.getByText('docs/r2-report.md')).toBeVisible()

    await expect
      .poll(() => existsSync(path.join(result.helloAgentsRoot, 'contract.json')), {
        timeout: 10_000,
        message: 'R2 success contract was not persisted'
      })
      .toBe(true)
    const contract = readFileSync(path.join(result.helloAgentsRoot, 'contract.json'), 'utf8')
    expect(contract).toContain('verification-contract')
    expect(readFileSync(path.join(result.helloAgentsRoot, 'tasks.md'), 'utf8')).toContain(
      result.tasks.verify
    )
  })

  test('marks the run failed when an upstream worker fails and blocks downstream tasks', async ({
    electronApp,
    orcaPage
  }) => {
    const workspaceRoot = await activeWorktreePath(orcaPage)
    const result = await runR2FailureFixture(electronApp, orcaPage, workspaceRoot)
    const detail = await callRuntime<RuntimeDetail>(orcaPage, 'orchestration.runDetail', {
      runId: result.runId
    })
    const verify = detail.tasks.find((task) => task.id === result.tasks.verify)
    expect(detail.run.status).toBe('failed')
    expect(verify?.status).toBe('blocked')
    expect(verify?.result).toContain(result.tasks.api)

    await openOrchestration(orcaPage)
    await expect(
      orcaPage.getByRole('heading', { name: 'R2 E2E DAG fails and blocks downstream verification' })
    ).toBeVisible()
    await expect(orcaPage.getByText(`Blocked by ${result.tasks.api}.`).first()).toBeVisible()
    await expect(orcaPage.getByText(`Blocked by ${result.tasks.api}.`)).toHaveCount(2)
    await expect(orcaPage.getByText('failed', { exact: true })).toBeVisible()

    await expect
      .poll(() => existsSync(path.join(result.helloAgentsRoot, '.status.json')), {
        timeout: 10_000,
        message: 'R2 failure status file was not persisted'
      })
      .toBe(true)
    const status = JSON.parse(readFileSync(path.join(result.helloAgentsRoot, '.status.json'), 'utf8'))
    expect(status).toMatchObject({ status: 'failed', mode: 'r2', failed: 1, blocked: 2 })
  })
})
