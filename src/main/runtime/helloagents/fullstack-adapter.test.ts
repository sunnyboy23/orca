import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  convertFullstackCliExecution,
  convertFullstackJsonText,
  convertFullstackState,
  readFullstackDagFromFile
} from './fullstack-adapter'

describe('fullstack DAG adapter', () => {
  let tempDir: string | undefined

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
      tempDir = undefined
    }
  })

  async function createTempDir(): Promise<string> {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-ha-fullstack-'))
    return tempDir
  }

  it('converts real fullstack task maps into Orca task DAG specs', () => {
    const result = convertFullstackState({
      task_group_id: '20260429-xray-config-management',
      requirement: '新增 X-ray 配置管理',
      status: 'in_progress',
      tasks: {
        T2: {
          task_id: 'T2',
          engineer_id: 'be-java-main',
          project: '/Users/dev/project/athenaweb',
          description: '暴露 X-ray 配置管理 Controller 接口',
          depends_on: ['T1'],
          status: 'pending',
          verification_status: 'pending',
          closeout_status: 'pending'
        },
        T1: {
          task_id: 'T1',
          engineer_id: 'be-java-main',
          project: '/Users/dev/project/qc_support',
          description: '新增 X-ray 三类配置领域实现',
          depends_on: [],
          status: 'completed',
          verification_status: 'passed',
          closeout_status: 'pending',
          task_contract: {
            required_artifacts: [{ key: 'fullstack/docs/tasks.md' }]
          }
        }
      },
      required_artifacts: [
        {
          key: 'fullstack/docs/tasks.md',
          description: '全栈任务文档'
        }
      ]
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    expect(result.conversion).toMatchObject({
      groupId: '20260429-xray-config-management',
      requirement: '新增 X-ray 配置管理',
      status: 'in_progress',
      requiredArtifacts: [{ key: 'fullstack/docs/tasks.md', description: '全栈任务文档' }]
    })
    expect(result.conversion.tasks).toEqual([
      {
        id: 'T1',
        title: 'be-java-main: 新增 X-ray 三类配置领域实现',
        repoName: 'qc_support',
        deps: [],
        artifactRequired: true,
        spec: [
          'Fullstack requirement: 新增 X-ray 配置管理',
          'Task: 新增 X-ray 三类配置领域实现',
          'Engineer: be-java-main',
          'Repo name: qc_support',
          'Project path: redacted; resolve repo_name through Orca Team Config before dispatch',
          'Fullstack status: completed',
          'Verification status: passed',
          'Closeout status: pending',
          'Required artifacts: fullstack/docs/tasks.md'
        ].join('\n')
      },
      {
        id: 'T2',
        title: 'be-java-main: 暴露 X-ray 配置管理 Controller 接口',
        repoName: 'athenaweb',
        deps: ['T1'],
        artifactRequired: true,
        spec: [
          'Fullstack requirement: 新增 X-ray 配置管理',
          'Task: 暴露 X-ray 配置管理 Controller 接口',
          'Engineer: be-java-main',
          'Repo name: athenaweb',
          'Project path: redacted; resolve repo_name through Orca Team Config before dispatch',
          'Fullstack status: pending',
          'Verification status: pending',
          'Closeout status: pending'
        ].join('\n')
      }
    ])
  })

  it('also accepts array task payloads for exported snapshots', () => {
    const result = convertFullstackState({
      requirement: 'array fixture',
      tasks: [
        {
          task_id: 'T1',
          description: 'first task',
          depends_on: []
        }
      ]
    })

    expect(result).toMatchObject({
      ok: true,
      conversion: {
        tasks: [
          {
            id: 'T1',
            title: 'first task',
            repoName: undefined,
            deps: []
          }
        ]
      }
    })
  })

  it('rejects missing tasks and invalid dependencies without throwing', () => {
    expect(convertFullstackState({ requirement: 'empty' })).toEqual({
      ok: false,
      error: { kind: 'missing_tasks', message: 'Fullstack state does not contain tasks' }
    })

    const invalidDag = convertFullstackState({
      requirement: 'bad deps',
      tasks: {
        T1: {
          task_id: 'T1',
          description: 'blocked task',
          depends_on: ['T0']
        }
      }
    })

    expect(invalidDag).toMatchObject({
      ok: false,
      error: {
        kind: 'invalid_dag',
        issues: [{ kind: 'missing_dependency', taskId: 'T1', dependencyId: 'T0' }]
      }
    })
  })

  it('reports invalid JSON text and schema issues', () => {
    expect(convertFullstackJsonText('{')).toMatchObject({
      ok: false,
      error: { kind: 'invalid_json' }
    })
    expect(convertFullstackState({ tasks: { T1: { task_id: 'T1' } } })).toMatchObject({
      ok: false,
      error: { kind: 'invalid_schema' }
    })
  })

  it('preserves failed CLI stdout and stderr summaries', () => {
    const result = convertFullstackCliExecution({
      exitCode: 2,
      stdout: 'partial output',
      stderr: 'config missing'
    })

    expect(result).toEqual({
      ok: false,
      error: {
        kind: 'cli_failed',
        message: 'helloagents fullstack exited with code 2',
        stdout: 'partial output',
        stderr: 'config missing'
      }
    })
  })

  it('reads fullstack current.json from disk', async () => {
    const root = await createTempDir()
    const filePath = join(root, 'current.json')
    await writeFile(
      filePath,
      JSON.stringify({
        task_group_id: 'group_1',
        requirement: 'file fixture',
        tasks: {
          T1: {
            task_id: 'T1',
            engineer_id: 'fe-react-main',
            project: '/tmp/web-app',
            description: 'build page',
            depends_on: []
          }
        }
      }),
      'utf8'
    )

    const result = await readFullstackDagFromFile(filePath)

    expect(result).toMatchObject({
      ok: true,
      conversion: {
        groupId: 'group_1',
        tasks: [
          {
            id: 'T1',
            repoName: 'web-app'
          }
        ]
      }
    })
  })
})
