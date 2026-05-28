import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { stringifyTeamConfigYaml, readTeamConfigWithFallback, writeTeamConfigCache } from './cache'
import { mapFeishuRecordsToTeamConfig } from './feishu-base-source'
import { buildFullstackYaml } from './fullstack-yaml-builder'
import { resolveRepoName } from './path-resolver'
import type { PersonalTeamConfig, TeamConfig } from './schema'

describe('team config service', () => {
  let tempDir: string | undefined

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
      tempDir = undefined
    }
  })

  async function createTempDir(): Promise<string> {
    tempDir = await mkdtemp(join(tmpdir(), 'orca-team-config-'))
    return tempDir
  }

  it('maps Feishu Base records into a validated public team config', () => {
    const result = mapFeishuRecordsToTeamConfig({
      repos: [
        {
          fields: {
            repo_name: 'qc_support',
            display_name: 'QC Support',
            provider: 'gitlab',
            remote_url: 'ssh://git.example/qc_support.git',
            service_type: 'domain',
            status: 'active'
          }
        }
      ],
      capabilities: [
        {
          fields: {
            repo_name: 'qc_support',
            capability_key: 'xray_support',
            summary: 'X-ray support',
            write_authority: 'xray_config,device_rule',
            read_authority: ['inspection_query']
          }
        }
      ],
      dependencies: [
        {
          fields: {
            repo_name: 'athenaweb',
            depends_on_repo_name: 'qc_support',
            dependency_type: 'api'
          }
        }
      ],
      agents: [
        {
          fields: {
            agent_id: 'be-java-main',
            role: 'backend-java',
            owner_user: 'Alice',
            default_repo_names: 'qc_support,athenaweb'
          }
        }
      ],
      policies: [
        {
          fields: {
            repo_name: 'qc_support',
            subject: 'backend-java',
            access: 'write',
            notes: 'domain owner'
          }
        }
      ]
    })

    expect(result).toMatchObject({
      ok: true,
      config: {
        version: 1,
        repos: [{ repoName: 'qc_support', provider: 'gitlab' }],
        capabilities: [
          {
            capabilityKey: 'xray_support',
            writeAuthority: ['xray_config', 'device_rule'],
            readAuthority: ['inspection_query']
          }
        ],
        dependencies: [{ repoName: 'athenaweb', dependsOnRepoName: 'qc_support' }],
        agents: [{ agentId: 'be-java-main', defaultRepoNames: ['qc_support', 'athenaweb'] }],
        policies: [{ repoName: 'qc_support', access: 'write' }]
      }
    })
  })

  it('reads cache first and falls back to .orca-team.yaml when cache is missing', async () => {
    const root = await createTempDir()
    const cachePath = join(root, 'team-config-cache.json')
    const fallbackPath = join(root, '.orca-team.yaml')
    const fallbackConfig = makeTeamConfig()

    await writeFile(fallbackPath, stringifyTeamConfigYaml(fallbackConfig), 'utf8')
    await expect(
      readTeamConfigWithFallback({ cachePath, fallbackYamlPath: fallbackPath })
    ).resolves.toMatchObject({
      ok: true,
      source: 'fallback',
      config: { repos: [{ repoName: 'qc_support' }] }
    })

    const cacheConfig: TeamConfig = {
      ...fallbackConfig,
      repos: [{ ...fallbackConfig.repos[0], repoName: 'athenaweb', displayName: 'Athena Web' }]
    }
    await writeTeamConfigCache(cachePath, cacheConfig)
    await expect(
      readTeamConfigWithFallback({ cachePath, fallbackYamlPath: fallbackPath })
    ).resolves.toMatchObject({
      ok: true,
      source: 'cache',
      config: { repos: [{ repoName: 'athenaweb' }] }
    })
  })

  it('resolves repo_name through personal binding and Orca repo registration', () => {
    const result = resolveRepoName({
      repoName: 'qc_support',
      teamConfig: makeTeamConfig(),
      localBindings: [
        {
          repoName: 'qc_support',
          localPath: '/workspace/qc_support',
          worktreePath: '/workspace/qc_support-wt'
        }
      ],
      repos: [
        {
          id: 'repo-1',
          path: '/workspace/qc_support',
          displayName: 'QC Support',
          connectionId: null
        }
      ],
      worktrees: [
        {
          id: 'wt-1',
          repoId: 'repo-1',
          path: '/workspace/qc_support-wt'
        }
      ]
    })

    expect(result).toEqual({
      ok: true,
      repoName: 'qc_support',
      repoId: 'repo-1',
      repoPath: '/workspace/qc_support',
      worktreeId: 'wt-1',
      worktreePath: '/workspace/qc_support-wt',
      connectionId: null,
      source: 'binding'
    })
  })

  it('reports missing bindings and unregistered local paths', () => {
    const missingBinding = resolveRepoName({
      repoName: 'qc_support',
      teamConfig: makeTeamConfig(),
      localBindings: [],
      repos: [],
      worktrees: []
    })
    const unregistered = resolveRepoName({
      repoName: 'qc_support',
      teamConfig: makeTeamConfig(),
      localBindings: [{ repoName: 'qc_support', localPath: '/missing/qc_support' }],
      repos: [],
      worktrees: []
    })

    expect(missingBinding).toMatchObject({ ok: false, reason: 'missing_binding' })
    expect(unregistered).toMatchObject({ ok: false, reason: 'repo_not_registered' })
  })

  it('builds a local HelloAGENTS fullstack.yaml from public config and personal bindings', () => {
    const teamConfig = makeTeamConfig()
    const personalConfig = makePersonalConfig()

    const result = buildFullstackYaml(teamConfig, personalConfig)

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    expect(result.value.engineers).toEqual([
      {
        id: 'be-java-main',
        type: 'backend-java',
        name: 'backend-java',
        projects: [
          {
            path: '/workspace/qc_support',
            description: 'QC Support',
            tech_stack: ['backend'],
            auto_init_kb: true
          }
        ]
      }
    ])
    expect(result.value.service_catalog['/workspace/qc_support']).toMatchObject({
      service_type: 'domain',
      owned_capabilities: ['xray_support']
    })
    expect(result.content).toContain('mode: fullstack')
    expect(result.content).toContain('/workspace/qc_support')
  })

  it('does not build fullstack.yaml when an active repo has no local binding', () => {
    const result = buildFullstackYaml(makeTeamConfig(), {
      version: 1,
      bot: {},
      webhook: {},
      repoBindings: []
    })

    expect(result).toEqual({
      ok: false,
      message: 'Cannot build fullstack.yaml without local repo bindings',
      missingRepoNames: ['qc_support']
    })
  })
})

function makeTeamConfig(): TeamConfig {
  return {
    version: 1,
    repos: [
      {
        repoName: 'qc_support',
        displayName: 'QC Support',
        provider: 'gitlab',
        remoteUrl: 'ssh://git.example/qc_support.git',
        serviceType: 'domain',
        status: 'active'
      }
    ],
    capabilities: [
      {
        repoName: 'qc_support',
        capabilityKey: 'xray_support',
        summary: 'X-ray support',
        writeAuthority: ['xray_config'],
        readAuthority: ['inspection_query']
      }
    ],
    dependencies: [],
    agents: [
      {
        agentId: 'be-java-main',
        role: 'backend-java',
        defaultRepoNames: ['qc_support']
      }
    ],
    policies: []
  }
}

function makePersonalConfig(): PersonalTeamConfig {
  return {
    version: 1,
    bot: {},
    webhook: {},
    repoBindings: [
      {
        repoName: 'qc_support',
        localPath: '/workspace/qc_support'
      }
    ]
  }
}
