import { z } from 'zod'
import { defineMethod, type RpcMethod } from '../core'
import { OptionalFiniteNumber, OptionalString, requiredString } from '../schemas'
import type { GateStatus } from '../../orchestration/db'
import { startCoordinatorRun, stopActiveCoordinatorRun } from '../../orchestration/run-service'

const RunParams = z.object({
  spec: requiredString('Missing --spec'),
  from: OptionalString,
  pollIntervalMs: OptionalFiniteNumber,
  maxConcurrent: OptionalFiniteNumber,
  worktree: OptionalString,
  mode: z.enum(['unknown', 'r0', 'r1', 'r2', 'fullstack']).optional(),
  source: z.enum(['desktop', 'web', 'mobile', 'feishu', 'cli', 'unknown']).optional(),
  projectId: OptionalString,
  rootRepoName: OptionalString,
  planPath: OptionalString,
  workspaceRoot: OptionalString,
  helloAgentsRoot: OptionalString
})

const RunStopParams = z.object({})

const GateCreateParams = z.object({
  task: requiredString('Missing --task'),
  question: requiredString('Missing --question'),
  options: OptionalString
})

const GateResolveParams = z.object({
  id: requiredString('Missing --id'),
  resolution: requiredString('Missing --resolution')
})

const GateListParams = z.object({
  task: OptionalString,
  status: z.enum(['pending', 'resolved', 'timeout']).optional()
})

export const ORCHESTRATION_GATE_METHODS: RpcMethod[] = [
  // Why: Section 4.12 — orchestration.run returns immediately with a run ID.
  // The coordinator loop runs in the background; progress is queried via
  // orchestration.taskList. This prevents the RPC call from blocking the
  // CLI (or any caller) for the entire duration of the pipeline.
  defineMethod({
    name: 'orchestration.run',
    params: RunParams,
    handler: (params, { runtime }) => {
      const db = runtime.getOrchestrationDb()
      return startCoordinatorRun(db, runtime, params)
    }
  }),

  defineMethod({
    name: 'orchestration.runStop',
    params: RunStopParams,
    handler: (_params, { runtime }) => {
      const db = runtime.getOrchestrationDb()
      return stopActiveCoordinatorRun(db)
    }
  }),

  defineMethod({
    name: 'orchestration.gateCreate',
    params: GateCreateParams,
    handler: (params, { runtime }) => {
      const db = runtime.getOrchestrationDb()
      let options: string[] | undefined
      if (params.options) {
        try {
          const parsed = JSON.parse(params.options)
          if (!Array.isArray(parsed) || !parsed.every((option) => typeof option === 'string')) {
            throw new Error('not an array of strings')
          }
          options = parsed
        } catch {
          throw new Error('Invalid --options: must be a JSON array of strings')
        }
      }
      const gate = db.createGate({
        taskId: params.task,
        question: params.question,
        options
      })
      return { gate }
    }
  }),

  defineMethod({
    name: 'orchestration.gateResolve',
    params: GateResolveParams,
    handler: (params, { runtime }) => {
      const db = runtime.getOrchestrationDb()
      const gate = db.resolveGate(params.id, params.resolution)
      if (!gate) {
        throw new Error(`Gate not found: ${params.id}`)
      }
      return { gate }
    }
  }),

  defineMethod({
    name: 'orchestration.gateList',
    params: GateListParams,
    handler: (params, { runtime }) => {
      const db = runtime.getOrchestrationDb()
      const gates = db.listGates({
        taskId: params.task,
        status: params.status as GateStatus
      })
      return { gates, count: gates.length }
    }
  })
]
