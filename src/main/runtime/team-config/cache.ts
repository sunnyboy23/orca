import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parse, stringify } from 'yaml'
import {
  parsePersonalTeamConfig,
  parseTeamConfig,
  type PersonalTeamConfig,
  type TeamConfig
} from './schema'

export type TeamConfigCacheReadResult =
  | { ok: true; config: TeamConfig; source: 'cache' | 'fallback' }
  | { ok: false; message: string }

export type PersonalConfigReadResult =
  | { ok: true; config: PersonalTeamConfig }
  | { ok: false; message: string }

export async function writeTeamConfigCache(path: string, config: TeamConfig): Promise<void> {
  await writeJsonAtomic(path, config)
}

export async function readTeamConfigCache(path: string): Promise<TeamConfigCacheReadResult> {
  const readResult = await readJsonFile(path)
  if (!readResult.ok) {
    return readResult
  }

  const parsed = parseTeamConfig(readResult.value)
  return parsed.ok
    ? { ok: true, config: parsed.config, source: 'cache' }
    : { ok: false, message: parsed.message }
}

export async function readTeamConfigWithFallback(options: {
  cachePath: string
  fallbackYamlPath?: string
}): Promise<TeamConfigCacheReadResult> {
  const cache = await readTeamConfigCache(options.cachePath)
  if (cache.ok || !options.fallbackYamlPath) {
    return cache
  }

  const fallback = await readYamlFile(options.fallbackYamlPath)
  if (!fallback.ok) {
    return {
      ok: false,
      message: `No valid team config cache or fallback: ${cache.message}; ${fallback.message}`
    }
  }

  const parsed = parseTeamConfig(fallback.value)
  return parsed.ok
    ? { ok: true, config: parsed.config, source: 'fallback' }
    : { ok: false, message: parsed.message }
}

export async function readPersonalTeamConfig(path: string): Promise<PersonalConfigReadResult> {
  const yaml = await readYamlFile(path)
  if (!yaml.ok) {
    return yaml
  }

  const parsed = parsePersonalTeamConfig(yaml.value)
  return parsed.ok ? { ok: true, config: parsed.config } : { ok: false, message: parsed.message }
}

async function readJsonFile(path: string): Promise<{ ok: true; value: unknown } | { ok: false; message: string }> {
  try {
    return { ok: true, value: JSON.parse(await readFile(path, 'utf8')) as unknown }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : `Failed to read ${path}` }
  }
}

async function readYamlFile(path: string): Promise<{ ok: true; value: unknown } | { ok: false; message: string }> {
  try {
    return { ok: true, value: parse(await readFile(path, 'utf8')) as unknown }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : `Failed to read ${path}` }
  }
}

async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const tempPath = `${path}.${Date.now()}.tmp`
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(tempPath, path)
}

export function stringifyTeamConfigYaml(config: TeamConfig): string {
  return `${stringify(config, { lineWidth: 0 }).trimEnd()}\n`
}
