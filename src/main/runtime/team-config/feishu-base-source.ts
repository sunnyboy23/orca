import type {
  TeamConfig,
  TeamConfigAgent,
  TeamConfigCapability,
  TeamConfigDependency,
  TeamConfigPolicy,
  TeamConfigRepo
} from './schema'
import { parseTeamConfig } from './schema'

export type FeishuBaseRecord = {
  fields: Record<string, unknown>
}

export type FeishuTeamConfigRecords = {
  repos?: FeishuBaseRecord[]
  capabilities?: FeishuBaseRecord[]
  dependencies?: FeishuBaseRecord[]
  agents?: FeishuBaseRecord[]
  policies?: FeishuBaseRecord[]
}

export type FeishuTeamConfigFieldMap = {
  repos: RepoFieldMap
  capabilities: CapabilityFieldMap
  dependencies: DependencyFieldMap
  agents: AgentFieldMap
  policies: PolicyFieldMap
}

export type RepoFieldMap = {
  repoName: string
  displayName: string
  provider: string
  remoteUrl: string
  serviceType: string
  status: string
}

export type CapabilityFieldMap = {
  repoName: string
  capabilityKey: string
  summary: string
  writeAuthority: string
  readAuthority: string
}

export type DependencyFieldMap = {
  repoName: string
  dependsOnRepoName: string
  dependencyType: string
}

export type AgentFieldMap = {
  agentId: string
  role: string
  ownerUser: string
  defaultRepoNames: string
}

export type PolicyFieldMap = {
  repoName: string
  subject: string
  access: string
  notes: string
}

export type FeishuTeamConfigSource = {
  fetchRecords(): Promise<FeishuTeamConfigRecords>
}

export const DEFAULT_FEISHU_TEAM_CONFIG_FIELD_MAP: FeishuTeamConfigFieldMap = {
  repos: {
    repoName: 'repo_name',
    displayName: 'display_name',
    provider: 'provider',
    remoteUrl: 'remote_url',
    serviceType: 'service_type',
    status: 'status'
  },
  capabilities: {
    repoName: 'repo_name',
    capabilityKey: 'capability_key',
    summary: 'summary',
    writeAuthority: 'write_authority',
    readAuthority: 'read_authority'
  },
  dependencies: {
    repoName: 'repo_name',
    dependsOnRepoName: 'depends_on_repo_name',
    dependencyType: 'dependency_type'
  },
  agents: {
    agentId: 'agent_id',
    role: 'role',
    ownerUser: 'owner_user',
    defaultRepoNames: 'default_repo_names'
  },
  policies: {
    repoName: 'repo_name',
    subject: 'subject',
    access: 'access',
    notes: 'notes'
  }
}

export type TeamConfigLoadResult =
  | { ok: true; config: TeamConfig }
  | { ok: false; message: string }

export async function loadTeamConfigFromFeishuSource(
  source: FeishuTeamConfigSource,
  fieldMap: FeishuTeamConfigFieldMap = DEFAULT_FEISHU_TEAM_CONFIG_FIELD_MAP
): Promise<TeamConfigLoadResult> {
  try {
    return mapFeishuRecordsToTeamConfig(await source.fetchRecords(), fieldMap)
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to fetch Feishu Base team config'
    }
  }
}

export function mapFeishuRecordsToTeamConfig(
  records: FeishuTeamConfigRecords,
  fieldMap: FeishuTeamConfigFieldMap = DEFAULT_FEISHU_TEAM_CONFIG_FIELD_MAP
): TeamConfigLoadResult {
  const candidate = {
    version: 1,
    repos: (records.repos ?? []).map((record) => mapRepo(record, fieldMap.repos)),
    capabilities: (records.capabilities ?? []).map((record) =>
      mapCapability(record, fieldMap.capabilities)
    ),
    dependencies: (records.dependencies ?? []).map((record) =>
      mapDependency(record, fieldMap.dependencies)
    ),
    agents: (records.agents ?? []).map((record) => mapAgent(record, fieldMap.agents)),
    policies: (records.policies ?? []).map((record) => mapPolicy(record, fieldMap.policies))
  }

  return parseTeamConfig(candidate)
}

function mapRepo(record: FeishuBaseRecord, map: RepoFieldMap): TeamConfigRepo {
  return {
    repoName: readString(record, map.repoName),
    displayName: readString(record, map.displayName),
    provider: readString(record, map.provider),
    remoteUrl: readOptionalString(record, map.remoteUrl),
    serviceType: readString(record, map.serviceType),
    status: readString(record, map.status)
  } as TeamConfigRepo
}

function mapCapability(
  record: FeishuBaseRecord,
  map: CapabilityFieldMap
): TeamConfigCapability {
  return {
    repoName: readString(record, map.repoName),
    capabilityKey: readString(record, map.capabilityKey),
    summary: readString(record, map.summary),
    writeAuthority: readStringList(record, map.writeAuthority),
    readAuthority: readStringList(record, map.readAuthority)
  }
}

function mapDependency(
  record: FeishuBaseRecord,
  map: DependencyFieldMap
): TeamConfigDependency {
  return {
    repoName: readString(record, map.repoName),
    dependsOnRepoName: readString(record, map.dependsOnRepoName),
    dependencyType: readString(record, map.dependencyType)
  } as TeamConfigDependency
}

function mapAgent(record: FeishuBaseRecord, map: AgentFieldMap): TeamConfigAgent {
  return {
    agentId: readString(record, map.agentId),
    role: readString(record, map.role),
    ownerUser: readOptionalString(record, map.ownerUser),
    defaultRepoNames: readStringList(record, map.defaultRepoNames)
  }
}

function mapPolicy(record: FeishuBaseRecord, map: PolicyFieldMap): TeamConfigPolicy {
  return {
    repoName: readString(record, map.repoName),
    subject: readString(record, map.subject),
    access: readString(record, map.access),
    notes: readOptionalString(record, map.notes)
  } as TeamConfigPolicy
}

function readString(record: FeishuBaseRecord, fieldName: string): string {
  return stringifyField(record.fields[fieldName])
}

function readOptionalString(record: FeishuBaseRecord, fieldName: string): string | undefined {
  const value = stringifyField(record.fields[fieldName])
  return value || undefined
}

function readStringList(record: FeishuBaseRecord, fieldName: string): string[] {
  const value = record.fields[fieldName]
  if (Array.isArray(value)) {
    return value.map(stringifyField).filter(Boolean)
  }
  return stringifyField(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function stringifyField(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    return value.map(stringifyField).filter(Boolean).join(',')
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return stringifyField(record.text ?? record.name ?? record.value)
  }
  return ''
}
