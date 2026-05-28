import { accessSync, constants, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, join } from 'node:path'

export type CliProbeResult = {
  name: string
  command: string
  path: string | null
  available: boolean
}

export type HelloAgentsConfigProbe = {
  configPath: string
  exists: boolean
}

export type FullstackConfigProbe = {
  globalConfigPath: string
  runtimeConfigPath: string | null
  projectConfigPath: string | null
  selectedConfigPath: string | null
  exists: boolean
}

export type HelloAgentsEnvironment = {
  homeDir: string
  cli: {
    helloagents: CliProbeResult
    claude: CliProbeResult
    codex: CliProbeResult
  }
  config: HelloAgentsConfigProbe
  fullstack: FullstackConfigProbe
  issues: string[]
}

export type HelloAgentsEnvironmentOptions = {
  env?: NodeJS.ProcessEnv
  homeDir?: string
  projectRoot?: string
  pathExists?: (path: string) => boolean
  canExecute?: (path: string) => boolean
}

const DEFAULT_CLI_NAMES = {
  helloagents: 'helloagents',
  claude: 'claude',
  codex: 'codex'
} as const

function defaultCanExecute(path: string): boolean {
  try {
    accessSync(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}

function getExecutableCandidates(command: string, env: NodeJS.ProcessEnv): string[] {
  const pathExt = env.PATHEXT ?? ''
  const extensions = pathExt
    .split(';')
    .map((extension) => extension.trim())
    .filter(Boolean)

  return [command, ...extensions.map((extension) => `${command}${extension.toLowerCase()}`)]
}

function resolveExecutable(
  command: string,
  env: NodeJS.ProcessEnv,
  canExecute: (path: string) => boolean
): string | null {
  const pathValue = env.PATH ?? ''
  if (!pathValue.trim()) {
    return null
  }

  const candidates = getExecutableCandidates(command, env)
  for (const entry of pathValue.split(delimiter)) {
    if (!entry) {
      continue
    }
    for (const executable of candidates) {
      const candidate = join(entry, executable)
      if (canExecute(candidate)) {
        return candidate
      }
    }
  }

  return null
}

function probeCli(
  name: string,
  command: string,
  env: NodeJS.ProcessEnv,
  canExecute: (path: string) => boolean
): CliProbeResult {
  const resolvedPath = resolveExecutable(command, env, canExecute)
  return {
    name,
    command,
    path: resolvedPath,
    available: resolvedPath !== null
  }
}

function firstExistingPath(paths: (string | null)[], pathExists: (path: string) => boolean): string | null {
  for (const path of paths) {
    if (path && pathExists(path)) {
      return path
    }
  }
  return null
}

export function detectHelloAgentsEnvironment(
  options: HelloAgentsEnvironmentOptions = {}
): HelloAgentsEnvironment {
  const env = options.env ?? process.env
  const homeDir = options.homeDir ?? homedir()
  const pathExists = options.pathExists ?? existsSync
  const canExecute = options.canExecute ?? defaultCanExecute
  const configRoot = join(homeDir, '.helloagents')
  const configPath = join(configRoot, 'helloagents.json')

  const globalFullstackConfig = join(configRoot, 'fullstack', 'config', 'fullstack.yaml')
  const runtimeRoot = env.FULLSTACK_RUNTIME_ROOT?.trim()
  const runtimeFullstackConfig = runtimeRoot ? join(runtimeRoot, 'config', 'fullstack.yaml') : null
  const projectFullstackConfig = options.projectRoot
    ? join(options.projectRoot, '.helloagents', 'fullstack', 'fullstack.yaml')
    : null

  const cli = {
    helloagents: probeCli(
      'helloagents',
      DEFAULT_CLI_NAMES.helloagents,
      env,
      canExecute
    ),
    claude: probeCli('claude', DEFAULT_CLI_NAMES.claude, env, canExecute),
    codex: probeCli('codex', DEFAULT_CLI_NAMES.codex, env, canExecute)
  }

  const selectedFullstackConfig = firstExistingPath(
    [globalFullstackConfig, runtimeFullstackConfig, projectFullstackConfig],
    pathExists
  )

  const issues = [
    !cli.helloagents.available ? 'helloagents CLI not found on PATH' : '',
    !cli.claude.available && !cli.codex.available
      ? 'No supported orchestrator CLI found on PATH'
      : '',
    !pathExists(configPath) ? 'helloagents.json not found' : ''
  ].filter(Boolean)

  return {
    homeDir,
    cli,
    config: {
      configPath,
      exists: pathExists(configPath)
    },
    fullstack: {
      globalConfigPath: globalFullstackConfig,
      runtimeConfigPath: runtimeFullstackConfig,
      projectConfigPath: projectFullstackConfig,
      selectedConfigPath: selectedFullstackConfig,
      exists: selectedFullstackConfig !== null
    },
    issues
  }
}
