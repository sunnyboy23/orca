import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { CodeGraph, CodeGraphNode } from './types'

const IMPORT_RE = /^\s*import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/gm
const REQUIRE_RE = /require\(['"]([^'"]+)['"]\)/g

export async function buildCodeGraph(params: {
  repoRoot: string
  now?: string
  maxFiles?: number
}): Promise<CodeGraph> {
  const sourceFiles = await listSourceFiles(params.repoRoot, params.maxFiles ?? 200)
  const nodes = sourceFiles.map((path) => ({ id: path, path, kind: classify(path) }))
  const nodeSet = new Set(nodes.map((node) => node.path))
  const edges: CodeGraph['edges'] = []
  for (const node of nodes) {
    const content = await readFile(join(params.repoRoot, node.path), 'utf8')
    for (const specifier of extractImports(content)) {
      const target = resolveLocalImport(node.path, specifier, nodeSet)
      if (target) {
        edges.push({ from: node.path, to: target, type: 'imports' })
      }
    }
  }
  return { generatedAt: params.now ?? new Date().toISOString(), nodes, edges }
}

async function listSourceFiles(root: string, maxFiles: number): Promise<string[]> {
  const result: string[] = []
  await walk(root, root, result, maxFiles)
  return result.sort()
}

async function walk(root: string, dir: string, result: string[], maxFiles: number): Promise<void> {
  if (result.length >= maxFiles) {
    return
  }
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (result.length >= maxFiles) {
      break
    }
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.helloagents') {
      continue
    }
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(root, path, result, maxFiles)
    } else if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) {
      result.push(relative(root, path))
    }
  }
}

function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const match of content.matchAll(IMPORT_RE)) {
    imports.push(match[1])
  }
  for (const match of content.matchAll(REQUIRE_RE)) {
    imports.push(match[1])
  }
  return imports
}

function resolveLocalImport(fromPath: string, specifier: string, nodeSet: Set<string>): string | null {
  if (!specifier.startsWith('.')) {
    return null
  }
  const base = join(fromPath, '..', specifier)
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, join(base, 'index.ts')]
  return candidates.find((candidate) => nodeSet.has(candidate)) ?? null
}

function classify(path: string): CodeGraphNode['kind'] {
  return /\.(test|spec)\.[cm]?[jt]sx?$/.test(path) ? 'test' : 'source'
}
