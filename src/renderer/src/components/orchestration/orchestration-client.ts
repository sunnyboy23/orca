import { callRuntimeRpc, getActiveRuntimeTarget } from '@/runtime/runtime-rpc-client'
import type { GlobalSettings } from '../../../../shared/types'
import type { OrchestrationRunDetail, OrchestrationRunListResult } from './types'

export async function listOrchestrationRuns(
  settings: Pick<GlobalSettings, 'activeRuntimeEnvironmentId'> | null | undefined,
  limit = 50
): Promise<OrchestrationRunListResult> {
  return callRuntimeRpc<OrchestrationRunListResult>(
    getActiveRuntimeTarget(settings),
    'orchestration.runList',
    { limit }
  )
}

export async function getOrchestrationRunDetail(
  settings: Pick<GlobalSettings, 'activeRuntimeEnvironmentId'> | null | undefined,
  runId: string
): Promise<OrchestrationRunDetail> {
  return callRuntimeRpc<OrchestrationRunDetail>(
    getActiveRuntimeTarget(settings),
    'orchestration.runDetail',
    { runId }
  )
}
