export type OrchestrationRunStatus = 'idle' | 'running' | 'completed' | 'failed'
export type OrchestrationRunMode = 'unknown' | 'r0' | 'r1' | 'r2' | 'fullstack'
export type OrchestrationRunSource = 'desktop' | 'web' | 'mobile' | 'feishu' | 'cli' | 'unknown'
export type OrchestrationTaskStatus =
  | 'pending'
  | 'ready'
  | 'dispatched'
  | 'completed'
  | 'failed'
  | 'blocked'
export type OrchestrationGateStatus = 'pending' | 'resolved' | 'timeout'

export type OrchestrationRun = {
  id: string
  spec: string
  status: OrchestrationRunStatus
  mode: OrchestrationRunMode
  source: OrchestrationRunSource
  coordinator_handle: string
  poll_interval_ms: number
  project_id: string | null
  root_repo_name: string | null
  plan_path: string | null
  updated_at: string | null
  created_at: string
  completed_at: string | null
}

export type OrchestrationTask = {
  id: string
  run_id: string | null
  parent_id: string | null
  created_by_terminal_handle: string | null
  spec: string
  status: OrchestrationTaskStatus
  deps: string
  repo_name: string | null
  worktree_selector: string | null
  artifact_dir: string | null
  result: string | null
  created_at: string
  completed_at: string | null
  assignee_handle?: string | null
  dispatch_id?: string | null
}

export type OrchestrationGate = {
  id: string
  task_id: string
  question: string
  options: string
  status: OrchestrationGateStatus
  resolution: string | null
  created_at: string
  resolved_at: string | null
}

export type OrchestrationArtifact = {
  id: string
  run_id: string | null
  task_id: string
  manifest_path: string
  status: string
  files_changed: string
  contracts: string
  verification: string
  downstream_notes: string | null
  created_at: string
  updated_at: string
}

export type OrchestrationRunListResult = {
  runs: OrchestrationRun[]
  count: number
}

export type OrchestrationRunDetail = {
  run: OrchestrationRun
  tasks: OrchestrationTask[]
  gates: OrchestrationGate[]
  artifacts: OrchestrationArtifact[]
}

export type OrchestrationPageState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'ready'; runs: OrchestrationRun[]; detail: OrchestrationRunDetail | null }
  | { kind: 'error'; message: string }
