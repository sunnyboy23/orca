import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import type { KnowledgeModuleSummary, KnowledgeRepoSummary } from './types'

const DEFAULT_IGNORE_DIRS = new Set([
  '.git',
  '.helloagents',
  'node_modules',
  'out',
  'dist',
  'build',
  'coverage'
])

export async function indexKnowledgeContext(params: {
  repoRoot: string
  repoName: string
  now?: string
  maxFiles?: number
}): Promise<KnowledgeRepoSummary> {
  const modules = await listKnowledgeModules({
    root: params.repoRoot,
    maxFiles: params.maxFiles ?? 200
  })
  const summary: KnowledgeRepoSummary = {
    repoName: params.repoName,
    rootPath: params.repoRoot,
    generatedAt: params.now ?? new Date().toISOString(),
    modules
  }
  await writeContextMarkdown(join(params.repoRoot, '.helloagents', 'context.md'), summary)
  return summary
}

export async function readKnowledgeContext(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

async function listKnowledgeModules(params: {
  root: string
  maxFiles: number
}): Promise<KnowledgeModuleSummary[]> {
  const result: KnowledgeModuleSummary[] = []
  await walk(params.root, params.root, result, params.maxFiles)
  return result.sort((a, b) => a.path.localeCompare(b.path))
}

async function walk(
  root: string,
  dir: string,
  result: KnowledgeModuleSummary[],
  maxFiles: number
): Promise<void> {
  if (result.length >= maxFiles) {
    return
  }
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (result.length >= maxFiles) {
      break
    }
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!DEFAULT_IGNORE_DIRS.has(entry.name)) {
        await walk(root, fullPath, result, maxFiles)
      }
      continue
    }
    if (!entry.isFile()) {
      continue
    }
    const fileStat = await stat(fullPath)
    if (fileStat.size > 256 * 1024) {
      continue
    }
    const path = relative(root, fullPath)
    result.push({ path, kind: classifyModule(path) })
  }
}

function classifyModule(path: string): KnowledgeModuleSummary['kind'] {
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path)) {
    return 'test'
  }
  if (/\.(md|mdx|txt)$/.test(path)) {
    return 'doc'
  }
  if (/\.(json|ya?ml|toml|ini)$/.test(path)) {
    return 'config'
  }
  if (/\.[cm]?[jt]sx?$/.test(path)) {
    return 'source'
  }
  return 'other'
}

async function writeContextMarkdown(path: string, summary: KnowledgeRepoSummary): Promise<void> {
  const lines = [
    '# 项目知识索引',
    '',
    '<!-- ORCA_KNOWLEDGE:GENERATED START -->',
    `- repo_name: ${summary.repoName}`,
    `- generated_at: ${summary.generatedAt}`,
    '',
    '## 模块',
    ...summary.modules.map((module) => `- ${module.path} (${module.kind})`),
    '<!-- ORCA_KNOWLEDGE:GENERATED END -->',
    ''
  ]
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, lines.join('\n'), 'utf8')
}
