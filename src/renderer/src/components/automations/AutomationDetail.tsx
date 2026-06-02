import React from 'react'
import { Pencil, Pause, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AGENT_CATALOG, AgentIcon } from '@/lib/agent-catalog'
import type { Automation, AutomationRun } from '../../../../shared/automations-types'
import { formatAutomationSchedule } from '../../../../shared/automation-schedules'
import { formatAutomationDateTimeWithRelative } from './automation-page-parts'
import {
  formatAutomationCost,
  formatAutomationTokens,
  summarizeAutomationRunUsage
} from './automation-usage-model'

type AutomationDetailProps = {
  automation: Automation | null
  runs: AutomationRun[]
  projectName: string
  workspaceName: string
  projectDefaultBaseRef: string | null
  now: number
  onRunNow: (automation: Automation) => void
  onEdit: (automation: Automation) => void
  onToggle: (automation: Automation) => void
  onDelete: (automation: Automation) => void
}

function DetailMetric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  )
}

function formatGrace(minutes: number): string {
  if (minutes <= 0) {
    return '不补跑'
  }
  if (minutes < 60) {
    return `${minutes} 分钟`
  }
  const hours = minutes / 60
  return `${hours} 小时`
}

function ToolbarIconButton({
  label,
  children,
  onClick,
  className
}: {
  label: string
  children: React.ReactNode
  onClick: () => void
  className?: string
}): React.JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          className={className}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function AutomationDetail({
  automation,
  runs,
  projectName,
  workspaceName,
  projectDefaultBaseRef,
  now,
  onRunNow,
  onEdit,
  onToggle,
  onDelete
}: AutomationDetailProps): React.JSX.Element {
  if (!automation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        创建自动化后即可开始定时调度 Agent 工作。
      </div>
    )
  }
  const usageSummary = summarizeAutomationRunUsage(runs)
  const usageCoverage =
    usageSummary.knownRuns > 0
      ? `${usageSummary.knownRuns}/${runs.length} 次运行`
      : usageSummary.unavailableRuns > 0
        ? '不可用'
        : '暂无运行'

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{automation.name}</h2>
            <Badge variant={automation.enabled ? 'secondary' : 'outline'}>
              {automation.enabled ? '已启用' : '已暂停'}
            </Badge>
          </div>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {projectName} / {workspaceName}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="secondary" size="sm" onClick={() => onRunNow(automation)}>
            <Play className="size-4" />
            立即运行
          </Button>
          <ToolbarIconButton label="编辑自动化" onClick={() => onEdit(automation)}>
            <Pencil className="size-4" />
          </ToolbarIconButton>
          <ToolbarIconButton
            label={automation.enabled ? '暂停自动化' : '恢复自动化'}
            onClick={() => onToggle(automation)}
          >
            {automation.enabled ? <Pause className="size-4" /> : <Play className="size-4" />}
          </ToolbarIconButton>
          <ToolbarIconButton
            label="删除自动化"
            onClick={() => onDelete(automation)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </ToolbarIconButton>
        </div>
      </div>

      {automation.executionTargetType === 'ssh' ? (
        <div className="rounded-md border border-border/50 bg-muted/50 p-3 text-sm text-muted-foreground shadow-sm">
          这个 SSH 自动化只会在 Orca 能连上 SSH
          主机时运行。如果重连需要交互式凭据或主机不可用，本次运行会记录为已跳过。
        </div>
      ) : null}

      <div className="grid grid-cols-6 gap-6 rounded-md border border-border/50 bg-muted/30 px-4 py-3 shadow-sm">
        <DetailMetric
          label="下次运行"
          value={
            automation.enabled
              ? formatAutomationDateTimeWithRelative(automation.nextRunAt, now)
              : '已暂停'
          }
        />
        <DetailMetric
          label="上次运行"
          value={formatAutomationDateTimeWithRelative(automation.lastRunAt, now)}
        />
        <DetailMetric
          label="预计花费"
          value={formatAutomationCost(usageSummary.estimatedCostUsd)}
        />
        <DetailMetric label="令牌" value={formatAutomationTokens(usageSummary.totalTokens)} />
        <DetailMetric label="用量覆盖" value={usageCoverage} />
        <DetailMetric label="补跑窗口" value={formatGrace(automation.missedRunGraceMinutes)} />
      </div>

      <div className="rounded-md border border-border/50 bg-muted/20 shadow-sm">
        <div className="border-b border-border/50 px-3 py-2 text-sm font-medium">配置</div>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-6 gap-y-4 px-3 py-3">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase text-muted-foreground">Agent</div>
            <div className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium">
              <AgentIcon agent={automation.agentId} size={16} />
              <span className="truncate">
                {AGENT_CATALOG.find((agent) => agent.id === automation.agentId)?.label ??
                  automation.agentId}
              </span>
            </div>
          </div>
          <DetailMetric label="调度" value={formatAutomationSchedule(automation.rrule)} />
          <DetailMetric
            label={automation.workspaceMode === 'new_per_run' ? '创建自' : '工作区'}
            value={
              automation.workspaceMode === 'new_per_run'
                ? (automation.baseBranch ?? projectDefaultBaseRef ?? '项目默认')
                : workspaceName
            }
          />
          <DetailMetric
            label="会话"
            value={automation.reuseSession ? '复用实时会话' : '每次新建'}
          />
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase text-muted-foreground">提示词</div>
            <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-foreground">
              {automation.prompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
