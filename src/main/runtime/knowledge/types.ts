export type KnowledgeRepoSummary = {
  repoName: string
  rootPath: string
  generatedAt: string
  modules: KnowledgeModuleSummary[]
}

export type KnowledgeModuleSummary = {
  path: string
  kind: 'source' | 'test' | 'doc' | 'config' | 'other'
}

export type KnowledgeRunChange = {
  runId: string
  status: string
  summary: string
  filesChanged: string[]
  verification: string[]
  completedAt: string
}

export type CodeGraphNode = {
  id: string
  path: string
  kind: KnowledgeModuleSummary['kind']
}

export type CodeGraph = {
  generatedAt: string
  nodes: CodeGraphNode[]
  edges: {
    from: string
    to: string
    type: 'imports'
  }[]
}

export type KnowledgeDriftWarning = {
  path: string
  reason: 'missing_from_context' | 'stale_context'
  detail: string
}
