import { stringify } from 'yaml'
import type { PersonalTeamConfig, TeamConfig, TeamConfigRepo } from './schema'

export type FullstackYamlBuildResult =
  | { ok: true; content: string; value: FullstackYamlValue }
  | { ok: false; message: string; missingRepoNames: string[] }

export type FullstackYamlValue = {
  version: 1
  mode: 'fullstack'
  engineers: {
    id: string
    type: string
    name: string
    projects: {
      path: string
      description: string
      tech_stack: string[]
      auto_init_kb: boolean
    }[]
  }[]
  service_dependencies: Record<string, { depends_on: string[] }>
  service_catalog: Record<string, unknown>
  orchestrator: {
    auto_sync_tech_docs: boolean
    parallel_execution: boolean
    max_parallel_engineers: number
    auto_init_project_kb: boolean
    cross_service_analysis: boolean
  }
}

export function buildFullstackYaml(
  teamConfig: TeamConfig,
  personalConfig: PersonalTeamConfig
): FullstackYamlBuildResult {
  const activeRepos = teamConfig.repos.filter((repo) => repo.status === 'active')
  const bindingByRepo = new Map(
    personalConfig.repoBindings.map((binding) => [binding.repoName, binding])
  )
  const missingRepoNames = activeRepos
    .filter((repo) => !bindingByRepo.has(repo.repoName))
    .map((repo) => repo.repoName)
    .sort()

  if (missingRepoNames.length > 0) {
    return {
      ok: false,
      message: 'Cannot build fullstack.yaml without local repo bindings',
      missingRepoNames
    }
  }

  const repoPathByName = new Map(
    activeRepos.map((repo) => [repo.repoName, bindingByRepo.get(repo.repoName)!.localPath])
  )
  const value: FullstackYamlValue = {
    version: 1,
    mode: 'fullstack',
    engineers: buildEngineers(teamConfig, repoPathByName),
    service_dependencies: buildServiceDependencies(teamConfig, repoPathByName),
    service_catalog: buildServiceCatalog(teamConfig, repoPathByName),
    orchestrator: {
      auto_sync_tech_docs: true,
      parallel_execution: true,
      max_parallel_engineers: 4,
      auto_init_project_kb: true,
      cross_service_analysis: true
    }
  }

  return { ok: true, value, content: `${stringify(value, { lineWidth: 0 }).trimEnd()}\n` }
}

function buildEngineers(
  teamConfig: TeamConfig,
  repoPathByName: Map<string, string>
): FullstackYamlValue['engineers'] {
  return teamConfig.agents.map((agent) => ({
    id: agent.agentId,
    type: agent.role,
    name: agent.ownerUser ? `${agent.ownerUser} / ${agent.role}` : agent.role,
    projects: agent.defaultRepoNames
      .map((repoName) => teamConfig.repos.find((repo) => repo.repoName === repoName))
      .filter((repo): repo is TeamConfigRepo => Boolean(repo))
      .filter((repo) => repoPathByName.has(repo.repoName))
      .map((repo) => ({
        path: repoPathByName.get(repo.repoName)!,
        description: repo.displayName,
        tech_stack: inferTechStack(repo),
        auto_init_kb: true
      }))
  }))
}

function buildServiceDependencies(
  teamConfig: TeamConfig,
  repoPathByName: Map<string, string>
): FullstackYamlValue['service_dependencies'] {
  const dependencies: FullstackYamlValue['service_dependencies'] = {}
  for (const dependency of teamConfig.dependencies) {
    const repoPath = repoPathByName.get(dependency.repoName)
    const dependsOnPath = repoPathByName.get(dependency.dependsOnRepoName)
    if (!repoPath || !dependsOnPath) {
      continue
    }
    const entry = dependencies[repoPath] ?? { depends_on: [] }
    entry.depends_on = [...new Set([...entry.depends_on, dependsOnPath])].sort()
    dependencies[repoPath] = entry
  }
  return dependencies
}

function buildServiceCatalog(
  teamConfig: TeamConfig,
  repoPathByName: Map<string, string>
): FullstackYamlValue['service_catalog'] {
  const catalog: FullstackYamlValue['service_catalog'] = {}
  for (const repo of teamConfig.repos) {
    const path = repoPathByName.get(repo.repoName)
    if (!path) {
      continue
    }
    const capabilities = teamConfig.capabilities.filter((item) => item.repoName === repo.repoName)
    catalog[path] = {
      service_type: repo.serviceType,
      service_summary: repo.displayName,
      business_scope: capabilities.map((item) => item.summary),
      owned_capabilities: capabilities.map((item) => item.capabilityKey),
      write_authority: uniqueSorted(capabilities.flatMap((item) => item.writeAuthority)),
      read_authority: uniqueSorted(capabilities.flatMap((item) => item.readAuthority)),
      bounded_context: repo.repoName
    }
  }
  return catalog
}

function inferTechStack(repo: TeamConfigRepo): string[] {
  if (repo.serviceType === 'frontend') {
    return ['frontend']
  }
  if (repo.serviceType === 'mobile') {
    return ['mobile']
  }
  if (repo.serviceType === 'backend' || repo.serviceType === 'domain') {
    return ['backend']
  }
  return [repo.serviceType]
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort()
}
