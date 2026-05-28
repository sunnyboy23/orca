export type MessageType =
  | 'status'
  | 'dispatch'
  | 'worker_done'
  | 'merge_ready'
  | 'escalation'
  | 'handoff'
  | 'decision_gate'
  | 'heartbeat'

export type MessagePriority = 'normal' | 'high' | 'urgent'

export type TaskStatus = 'pending' | 'ready' | 'dispatched' | 'completed' | 'failed' | 'blocked'

export type DispatchStatus = 'pending' | 'dispatched' | 'completed' | 'failed' | 'circuit_broken'

export type GateStatus = 'pending' | 'resolved' | 'timeout'

export type CoordinatorStatus = 'idle' | 'running' | 'completed' | 'failed'

export type CoordinatorRunMode = 'unknown' | 'r0' | 'r1' | 'r2' | 'fullstack'

export type CoordinatorRunSource = 'desktop' | 'web' | 'mobile' | 'feishu' | 'cli' | 'unknown'

export type MessageRow = {
  id: string
  from_handle: string
  to_handle: string
  subject: string
  body: string
  type: MessageType
  priority: MessagePriority
  thread_id: string | null
  payload: string | null
  read: number
  sequence: number
  created_at: string
  delivered_at: string | null
}

export type TaskRow = {
  id: string
  run_id: string | null
  parent_id: string | null
  created_by_terminal_handle: string | null
  spec: string
  status: TaskStatus
  deps: string
  repo_name: string | null
  worktree_selector: string | null
  artifact_dir: string | null
  result: string | null
  created_at: string
  completed_at: string | null
}

export type DispatchContextRow = {
  id: string
  task_id: string
  assignee_handle: string | null
  status: DispatchStatus
  failure_count: number
  last_failure: string | null
  dispatched_at: string | null
  completed_at: string | null
  created_at: string
  last_heartbeat_at: string | null
}

export type DecisionGateRow = {
  id: string
  task_id: string
  question: string
  options: string
  status: GateStatus
  resolution: string | null
  created_at: string
  resolved_at: string | null
}

export type CoordinatorRun = {
  id: string
  spec: string
  status: CoordinatorStatus
  mode: CoordinatorRunMode
  source: CoordinatorRunSource
  coordinator_handle: string
  poll_interval_ms: number
  project_id: string | null
  root_repo_name: string | null
  plan_path: string | null
  updated_at: string | null
  created_at: string
  completed_at: string | null
}

export type ArtifactManifestRow = {
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
