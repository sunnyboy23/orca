import { describe, expect, it } from 'vitest'
import { delimiter, join } from 'node:path'
import { buildOrchestratorLaunchPlan } from './adapter'
import { detectHelloAgentsEnvironment } from './environment'

function makeProbe(existingPaths: string[]) {
  const existing = new Set(existingPaths)
  return {
    pathExists: (path: string) => existing.has(path),
    canExecute: (path: string) => existing.has(path)
  }
}

describe('detectHelloAgentsEnvironment', () => {
  it('detects available CLIs and selects the global fullstack config first', () => {
    const homeDir = '/home/dev'
    const binDir = '/usr/local/bin'
    const globalFullstackConfig = join(
      homeDir,
      '.helloagents',
      'fullstack',
      'config',
      'fullstack.yaml'
    )
    const probe = makeProbe([
      join(binDir, 'helloagents'),
      join(binDir, 'claude'),
      join(binDir, 'codex'),
      join(homeDir, '.helloagents', 'helloagents.json'),
      globalFullstackConfig
    ])

    const result = detectHelloAgentsEnvironment({
      homeDir,
      env: { PATH: binDir },
      projectRoot: '/repo/orca',
      ...probe
    })

    expect(result.cli.helloagents.available).toBe(true)
    expect(result.cli.claude.available).toBe(true)
    expect(result.config.exists).toBe(true)
    expect(result.fullstack.selectedConfigPath).toBe(globalFullstackConfig)
    expect(result.issues).toEqual([])
  })

  it('falls back to runtime fullstack config when global config is absent', () => {
    const homeDir = '/home/dev'
    const binDir = '/opt/bin'
    const runtimeRoot = '/runtime/fullstack'
    const runtimeFullstackConfig = join(runtimeRoot, 'config', 'fullstack.yaml')
    const probe = makeProbe([
      join(binDir, 'helloagents'),
      join(binDir, 'codex'),
      join(homeDir, '.helloagents', 'helloagents.json'),
      runtimeFullstackConfig
    ])

    const result = detectHelloAgentsEnvironment({
      homeDir,
      env: {
        PATH: binDir,
        FULLSTACK_RUNTIME_ROOT: runtimeRoot
      },
      projectRoot: '/repo/orca',
      ...probe
    })

    expect(result.cli.claude.available).toBe(false)
    expect(result.cli.codex.available).toBe(true)
    expect(result.fullstack.selectedConfigPath).toBe(runtimeFullstackConfig)
    expect(result.issues).toEqual([])
  })

  it('reports missing required local configuration without throwing', () => {
    const result = detectHelloAgentsEnvironment({
      homeDir: '/home/dev',
      env: { PATH: '' },
      projectRoot: '/repo/orca',
      ...makeProbe([])
    })

    expect(result.cli.helloagents.available).toBe(false)
    expect(result.fullstack.exists).toBe(false)
    expect(result.issues).toEqual([
      'helloagents CLI not found on PATH',
      'No supported orchestrator CLI found on PATH',
      'helloagents.json not found'
    ])
  })

  it('uses platform PATH delimiter when probing commands', () => {
    const homeDir = '/home/dev'
    const firstBin = '/missing/bin'
    const secondBin = '/present/bin'
    const probe = makeProbe([
      join(secondBin, 'helloagents'),
      join(secondBin, 'claude'),
      join(homeDir, '.helloagents', 'helloagents.json')
    ])

    const result = detectHelloAgentsEnvironment({
      homeDir,
      env: { PATH: [firstBin, secondBin].join(delimiter) },
      ...probe
    })

    expect(result.cli.helloagents.path).toBe(join(secondBin, 'helloagents'))
    expect(result.cli.claude.path).toBe(join(secondBin, 'claude'))
  })

  it('honors Windows PATHEXT command shims', () => {
    const homeDir = '/users/dev'
    const binDir = '/tools/bin'
    const probe = makeProbe([
      join(binDir, 'helloagents.cmd'),
      join(binDir, 'codex.exe'),
      join(homeDir, '.helloagents', 'helloagents.json')
    ])

    const result = detectHelloAgentsEnvironment({
      homeDir,
      env: {
        PATH: binDir,
        PATHEXT: '.COM;.EXE;.CMD'
      },
      ...probe
    })

    expect(result.cli.helloagents.path).toBe(join(binDir, 'helloagents.cmd'))
    expect(result.cli.codex.path).toBe(join(binDir, 'codex.exe'))
  })
})

describe('buildOrchestratorLaunchPlan', () => {
  it('prefers Claude and emits HelloAGENTS env paths', () => {
    const homeDir = '/home/dev'
    const binDir = '/usr/local/bin'
    const configPath = join(homeDir, '.helloagents', 'helloagents.json')
    const probe = makeProbe([join(binDir, 'helloagents'), join(binDir, 'claude'), configPath])

    const plan = buildOrchestratorLaunchPlan({
      homeDir,
      env: { PATH: binDir },
      ...probe
    })

    expect(plan.ready).toBe(true)
    expect(plan.command).toBe(join(binDir, 'claude'))
    expect(plan.env.HELLOAGENTS_CONFIG).toBe(configPath)
  })

  it('falls back to Codex when Claude is unavailable', () => {
    const homeDir = '/home/dev'
    const binDir = '/usr/local/bin'
    const configPath = join(homeDir, '.helloagents', 'helloagents.json')
    const probe = makeProbe([join(binDir, 'helloagents'), join(binDir, 'codex'), configPath])

    const plan = buildOrchestratorLaunchPlan({
      homeDir,
      env: { PATH: binDir },
      ...probe
    })

    expect(plan.ready).toBe(true)
    expect(plan.command).toBe(join(binDir, 'codex'))
  })
})
