import { detectHelloAgentsEnvironment, type HelloAgentsEnvironmentOptions } from './environment'

export type OrchestratorLaunchPlan = {
  command: string | null
  args: string[]
  env: Record<string, string>
  ready: boolean
  issues: string[]
}

export type OrchestratorLaunchOptions = HelloAgentsEnvironmentOptions & {
  preferredCli?: 'claude' | 'codex'
}

export function buildOrchestratorLaunchPlan(
  options: OrchestratorLaunchOptions = {}
): OrchestratorLaunchPlan {
  const environment = detectHelloAgentsEnvironment(options)
  const preferredCli = options.preferredCli ?? 'claude'
  const fallbackCli = preferredCli === 'claude' ? 'codex' : 'claude'
  const selected =
    environment.cli[preferredCli].available ? environment.cli[preferredCli] : environment.cli[fallbackCli]

  const issues = [
    ...environment.issues,
    !selected.available ? `Preferred orchestrator CLI unavailable: ${preferredCli}` : ''
  ].filter(Boolean)

  return {
    command: selected.path,
    args: [],
    env: {
      HELLOAGENTS_CONFIG: environment.config.configPath,
      ...(environment.fullstack.selectedConfigPath
        ? { HELLOAGENTS_FULLSTACK_CONFIG: environment.fullstack.selectedConfigPath }
        : {})
    },
    ready: selected.available && environment.cli.helloagents.available && issues.length === 0,
    issues
  }
}
