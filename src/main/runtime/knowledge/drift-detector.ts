import type { CodeGraph, KnowledgeDriftWarning } from './types'

export function detectKnowledgeDrift(params: {
  contextMarkdown: string
  graph: CodeGraph
}): KnowledgeDriftWarning[] {
  const warnings: KnowledgeDriftWarning[] = []
  for (const node of params.graph.nodes) {
    if (node.kind === 'source' && !params.contextMarkdown.includes(node.path)) {
      warnings.push({
        path: node.path,
        reason: 'missing_from_context',
        detail: 'Source file exists in CodeGraph but is absent from .helloagents/context.md'
      })
    }
  }
  if (!params.contextMarkdown.includes('ORCA_KNOWLEDGE:GENERATED')) {
    warnings.push({
      path: '.helloagents/context.md',
      reason: 'stale_context',
      detail: 'Context file is missing the generated knowledge marker'
    })
  }
  return warnings
}
