import type { CodeGraph, KnowledgeDriftWarning, KnowledgeRepoSummary, KnowledgeRunChange } from './types'

export type FeishuKnowledgeSyncPayload = {
  wikiSpaceId: string
  projectDocsRootToken: string
  repoName: string
  markdown: string
}

export type FeishuKnowledgeSyncSink = {
  syncProjectKnowledge(payload: FeishuKnowledgeSyncPayload): Promise<void>
}

export type FeishuKnowledgeSyncResult =
  | { ok: true; payload: FeishuKnowledgeSyncPayload }
  | { ok: false; payload: FeishuKnowledgeSyncPayload; retryable: true; reason: string }

export async function syncKnowledgeToFeishuView(params: {
  sink: FeishuKnowledgeSyncSink
  wikiSpaceId: string
  projectDocsRootToken: string
  summary: KnowledgeRepoSummary
  graph: CodeGraph
  recentChanges: KnowledgeRunChange[]
  driftWarnings: KnowledgeDriftWarning[]
}): Promise<FeishuKnowledgeSyncResult> {
  const payload = buildFeishuKnowledgePayload(params)
  try {
    await params.sink.syncProjectKnowledge(payload)
    return { ok: true, payload }
  } catch (err) {
    return {
      ok: false,
      payload,
      retryable: true,
      reason: err instanceof Error ? err.message : String(err)
    }
  }
}

function buildFeishuKnowledgePayload(params: {
  wikiSpaceId: string
  projectDocsRootToken: string
  summary: KnowledgeRepoSummary
  graph: CodeGraph
  recentChanges: KnowledgeRunChange[]
  driftWarnings: KnowledgeDriftWarning[]
}): FeishuKnowledgeSyncPayload {
  const markdown = [
    `# ${params.summary.repoName} 项目资料`,
    '',
    `更新时间：${params.summary.generatedAt}`,
    '',
    '## 模块索引',
    ...params.summary.modules.map((module) => `- ${module.path} (${module.kind})`),
    '',
    '## CodeGraph',
    `- 节点：${params.graph.nodes.length}`,
    `- 边：${params.graph.edges.length}`,
    '',
    '## 最近变更',
    ...formatChanges(params.recentChanges),
    '',
    '## 漂移告警',
    ...formatWarnings(params.driftWarnings)
  ].join('\n')
  return {
    wikiSpaceId: params.wikiSpaceId,
    projectDocsRootToken: params.projectDocsRootToken,
    repoName: params.summary.repoName,
    markdown
  }
}

function formatChanges(changes: KnowledgeRunChange[]): string[] {
  if (changes.length === 0) {
    return ['- （无）']
  }
  return changes.map((change) => `- ${change.runId}: ${change.status}，${change.summary}`)
}

function formatWarnings(warnings: KnowledgeDriftWarning[]): string[] {
  if (warnings.length === 0) {
    return ['- （无）']
  }
  return warnings.map((warning) => `- ${warning.path}: ${warning.detail}`)
}
