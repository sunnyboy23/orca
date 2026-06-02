import type { Automation, AutomationRun } from '../../../../shared/automations-types'

export type AutomationRunViewAvailability = 'terminal' | 'workspace' | 'snapshot' | 'metadata'

export type AutomationRunViewState = {
  availability: AutomationRunViewAvailability
  actionLabel: string
  statusLabel: string
  canOpen: boolean
}

export const AUTOMATION_RERUN_PENDING_MIN_VISIBLE_MS = 800

export function getAutomationRerunPendingRemainingMs({
  pendingStartedAt,
  now = Date.now()
}: {
  pendingStartedAt: number
  now?: number
}): number {
  return Math.max(0, pendingStartedAt + AUTOMATION_RERUN_PENDING_MIN_VISIBLE_MS - now)
}

export function canRerunAutomationRun({
  automation,
  run
}: {
  automation: Automation | null
  run: AutomationRun
}): boolean {
  if (!automation || run.automationId !== automation.id) {
    return false
  }
  return (
    run.status === 'dispatch_failed' ||
    run.status === 'skipped_unavailable' ||
    run.status === 'skipped_needs_interactive_auth'
  )
}

export function getAutomationRunViewState({
  run,
  workspaceExists,
  terminalTabExists
}: {
  run: AutomationRun
  workspaceExists: boolean
  terminalTabExists: boolean
}): AutomationRunViewState {
  if (run.workspaceId && workspaceExists && run.terminalSessionId && terminalTabExists) {
    return {
      availability: 'terminal',
      actionLabel: '查看运行',
      statusLabel: '运行已打开',
      canOpen: true
    }
  }

  if (run.workspaceId && workspaceExists) {
    return {
      availability: 'workspace',
      actionLabel: '打开工作区',
      statusLabel: run.terminalSessionId ? '已打开工作区；原终端已关闭。' : '已打开工作区。',
      canOpen: true
    }
  }

  if (run.outputSnapshot?.content.trim()) {
    return {
      availability: 'snapshot',
      actionLabel: '已保存快照',
      statusLabel: '正在显示已保存的运行快照。',
      canOpen: false
    }
  }

  return {
    availability: 'metadata',
    actionLabel: '查看运行',
    statusLabel: run.workspaceId
      ? run.workspaceDisplayName?.trim()
        ? `${run.workspaceDisplayName.trim()} 已不可用`
        : '工作区已不可用'
      : '未启动工作区',
    canOpen: false
  }
}
