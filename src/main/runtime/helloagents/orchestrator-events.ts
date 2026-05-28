export type OrchestratorRunStatus = 'running' | 'failed' | 'completed'

export type OrchestratorTerminalEvent =
  | {
      type: 'started'
      runId: string
      handle: string
      worktreeId: string
    }
  | {
      type: 'input'
      runId: string
      handle: string
      text: string
    }
  | {
      type: 'output'
      runId: string
      handle: string
      chunk: string
    }
  | {
      type: 'exit'
      runId: string
      handle: string
      status: OrchestratorRunStatus
      reason: string
    }
  | {
      type: 'error'
      runId: string
      handle: string | null
      message: string
    }

export type OrchestratorTerminalSnapshot = {
  runId: string
  handle: string
  worktreeId: string
  status: OrchestratorRunStatus
  lastOutput: string
}
