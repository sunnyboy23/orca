import type { AutomationSchedulePreset } from '../../../../shared/automations-types'
import type { TuiAgent } from '../../../../shared/types'

export type AutomationTemplate = {
  id: string
  category: string
  label: string
  description: string
  name: string
  prompt: string
  preset: AutomationSchedulePreset
  time?: string
  dayOfWeek?: string
  agentId?: TuiAgent
  missedRunGraceMinutes?: string
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'repo-health-weekday',
    category: '仓库健康',
    label: '工作日仓库巡检',
    description: '每个工作日检查依赖、失败测试和有风险的未合入变更。',
    name: '工作日仓库巡检',
    prompt:
      '检查仓库健康状况，包括依赖更新、失败测试、lint/typecheck 状态和有风险的未合入变更。总结发现并建议下一步行动。',
    preset: 'weekdays',
    time: '09:00',
    missedRunGraceMinutes: '720'
  },
  {
    id: 'release-prep-weekly',
    category: '发布准备',
    label: '发布就绪检查',
    description: '根据当前项目状态生成每周发布风险摘要。',
    name: '发布就绪检查',
    prompt:
      '准备一份发布就绪摘要，检查阻塞项、未合入的高风险变更、缺失验证和文档缺口。最后给出简短的发布/暂不发布建议。',
    preset: 'weekly',
    time: '14:00',
    dayOfWeek: '4',
    missedRunGraceMinutes: '1440'
  },
  {
    id: 'recurring-review-daily',
    category: '定期审阅',
    label: '每日变更审阅',
    description: '扫描近期工作，指出正确性、体验和测试覆盖风险。',
    name: '每日变更审阅',
    prompt:
      '审阅当前工作区的近期变更，重点关注正确性风险、体验回归、缺失测试和后续任务。报告保持简短并可执行。',
    preset: 'daily',
    time: '16:30',
    missedRunGraceMinutes: '180'
  },
  {
    id: 'maintenance-hourly',
    category: '维护',
    label: '每小时队列检查',
    description: '检查卡住的工作、过期生成文件和失败的本地验证。',
    name: '每小时维护检查',
    prompt:
      '检查卡住的工作、过期生成文件、失败验证以及需要人工关注的问题。只报告可执行的问题。',
    preset: 'hourly',
    time: '00:15',
    missedRunGraceMinutes: '30'
  }
]
