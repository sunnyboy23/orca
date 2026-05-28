import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store'
import { getOrchestrationRunDetail, listOrchestrationRuns } from './orchestration-client'
import type { OrchestrationPageState, OrchestrationRun } from './types'

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function pickSelectedRunId(runs: OrchestrationRun[], previous: string | null): string | null {
  if (previous && runs.some((run) => run.id === previous)) {
    return previous
  }
  return runs[0]?.id ?? null
}

export function useOrchestrationRuns(): {
  state: OrchestrationPageState
  selectedRunId: string | null
  selectRun: (runId: string) => void
  refresh: () => Promise<void>
} {
  const settings = useAppStore((s) => s.settings)
  const [state, setState] = useState<OrchestrationPageState>({ kind: 'loading' })
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setState((current) => (current.kind === 'ready' ? current : { kind: 'loading' }))
    try {
      const listResult = await listOrchestrationRuns(settings)
      if (listResult.runs.length === 0) {
        setSelectedRunId(null)
        setState({ kind: 'empty' })
        return
      }
      const nextSelectedRunId = pickSelectedRunId(listResult.runs, selectedRunId)
      setSelectedRunId(nextSelectedRunId)
      const detail = nextSelectedRunId
        ? await getOrchestrationRunDetail(settings, nextSelectedRunId)
        : null
      setState({ kind: 'ready', runs: listResult.runs, detail })
    } catch (error) {
      setState({ kind: 'error', message: getErrorMessage(error) })
    }
  }, [selectedRunId, settings])

  const selectRun = useCallback(
    (runId: string) => {
      setSelectedRunId(runId)
      setState((current) =>
        current.kind === 'ready' ? { kind: 'ready', runs: current.runs, detail: null } : current
      )
      void getOrchestrationRunDetail(settings, runId)
        .then((detail) => {
          setState((current) =>
            current.kind === 'ready' ? { kind: 'ready', runs: current.runs, detail } : current
          )
        })
        .catch((error) => setState({ kind: 'error', message: getErrorMessage(error) }))
    },
    [settings]
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { state, selectedRunId, selectRun, refresh }
}
