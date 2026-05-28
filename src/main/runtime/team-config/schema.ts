import { z } from 'zod'

export const TeamConfigRepoSchema = z.object({
  repoName: z.string().min(1),
  displayName: z.string().min(1),
  provider: z.enum(['github', 'gitlab', 'gitea', 'bitbucket', 'other']).default('other'),
  remoteUrl: z.string().min(1).optional(),
  serviceType: z.enum(['domain', 'adapter', 'frontend', 'backend', 'mobile', 'tooling', 'other']),
  status: z.enum(['active', 'archived', 'disabled']).default('active')
})

export const TeamConfigCapabilitySchema = z.object({
  repoName: z.string().min(1),
  capabilityKey: z.string().min(1),
  summary: z.string().min(1),
  writeAuthority: z.array(z.string().min(1)).default([]),
  readAuthority: z.array(z.string().min(1)).default([])
})

export const TeamConfigDependencySchema = z.object({
  repoName: z.string().min(1),
  dependsOnRepoName: z.string().min(1),
  dependencyType: z.enum(['runtime', 'api', 'data', 'build', 'knowledge', 'other']).default('runtime')
})

export const TeamConfigAgentSchema = z.object({
  agentId: z.string().min(1),
  role: z.string().min(1),
  ownerUser: z.string().min(1).optional(),
  defaultRepoNames: z.array(z.string().min(1)).default([])
})

export const TeamConfigPolicySchema = z.object({
  repoName: z.string().min(1),
  subject: z.string().min(1),
  access: z.enum(['read', 'write', 'admin', 'deny']),
  notes: z.string().optional()
})

export const TeamConfigSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string().min(1).optional(),
  repos: z.array(TeamConfigRepoSchema).default([]),
  capabilities: z.array(TeamConfigCapabilitySchema).default([]),
  dependencies: z.array(TeamConfigDependencySchema).default([]),
  agents: z.array(TeamConfigAgentSchema).default([]),
  policies: z.array(TeamConfigPolicySchema).default([])
})

export const LocalRepoBindingSchema = z.object({
  repoName: z.string().min(1),
  localPath: z.string().min(1),
  worktreePath: z.string().min(1).optional(),
  connectionId: z.string().min(1).nullable().optional()
})

export const PersonalBotConfigSchema = z.object({
  appId: z.string().min(1).optional(),
  appSecretRef: z.string().min(1).optional(),
  encryptKeyRef: z.string().min(1).optional(),
  verificationTokenRef: z.string().min(1).optional()
})

export const PersonalTeamConfigSchema = z.object({
  version: z.literal(1),
  bot: PersonalBotConfigSchema.default({}),
  webhook: z
    .object({
      publicUrl: z.string().min(1).optional(),
      tunnelCommand: z.string().min(1).optional()
    })
    .default({}),
  repoBindings: z.array(LocalRepoBindingSchema).default([])
})

export type TeamConfig = z.infer<typeof TeamConfigSchema>
export type TeamConfigRepo = z.infer<typeof TeamConfigRepoSchema>
export type TeamConfigCapability = z.infer<typeof TeamConfigCapabilitySchema>
export type TeamConfigDependency = z.infer<typeof TeamConfigDependencySchema>
export type TeamConfigAgent = z.infer<typeof TeamConfigAgentSchema>
export type TeamConfigPolicy = z.infer<typeof TeamConfigPolicySchema>
export type LocalRepoBinding = z.infer<typeof LocalRepoBindingSchema>
export type PersonalTeamConfig = z.infer<typeof PersonalTeamConfigSchema>

export type TeamConfigValidationResult =
  | { ok: true; config: TeamConfig }
  | { ok: false; message: string }

export type PersonalTeamConfigValidationResult =
  | { ok: true; config: PersonalTeamConfig }
  | { ok: false; message: string }

export function parseTeamConfig(value: unknown): TeamConfigValidationResult {
  const parsed = TeamConfigSchema.safeParse(value)
  if (!parsed.success) {
    return { ok: false, message: z.prettifyError(parsed.error) }
  }
  return { ok: true, config: parsed.data }
}

export function parsePersonalTeamConfig(value: unknown): PersonalTeamConfigValidationResult {
  const parsed = PersonalTeamConfigSchema.safeParse(value)
  if (!parsed.success) {
    return { ok: false, message: z.prettifyError(parsed.error) }
  }
  return { ok: true, config: parsed.data }
}
