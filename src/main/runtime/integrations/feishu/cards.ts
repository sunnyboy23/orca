import { sanitizeFeishuText, sanitizeFeishuValue, type FeishuSanitizeOptions } from './sanitizer'

export type FeishuRunCardStatus = 'waiting' | 'running' | 'completed' | 'failed' | 'blocked'

export type FeishuRunStatusCardInput = {
  status: FeishuRunCardStatus
  runId: string
  title?: string
  summary?: string
  gateId?: string
  options?: string[]
  tasks?: {
    id: string
    title: string
    status: string
  }[]
  artifacts?: string[]
  sanitize?: FeishuSanitizeOptions
}

export type FeishuInteractiveCard = {
  msg_type: 'interactive'
  card: {
    config: { wide_screen_mode: true }
    header: {
      template: string
      title: { tag: 'plain_text'; content: string }
    }
    elements: unknown[]
  }
}

const statusLabels: Record<FeishuRunCardStatus, string> = {
  waiting: 'Waiting for input',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  blocked: 'Blocked'
}

const statusTemplates: Record<FeishuRunCardStatus, string> = {
  waiting: 'yellow',
  running: 'blue',
  completed: 'green',
  failed: 'red',
  blocked: 'orange'
}

export function buildFeishuRunStatusCard(input: FeishuRunStatusCardInput): FeishuInteractiveCard {
  const sanitize = input.sanitize ?? {}
  const elements: unknown[] = [
    markdownElement(
      [
        `**Run**: ${sanitizeFeishuText(input.runId, sanitize)}`,
        `**Status**: ${statusLabels[input.status]}`,
        input.summary ? `**Summary**: ${sanitizeFeishuText(input.summary, sanitize)}` : ''
      ]
        .filter(Boolean)
        .join('\n')
    )
  ]

  if (input.tasks && input.tasks.length > 0) {
    elements.push(
      markdownElement(
        input.tasks
          .map((task) => `- ${sanitizeFeishuText(task.title, sanitize)} · ${task.status}`)
          .join('\n')
      )
    )
  }

  if (input.artifacts && input.artifacts.length > 0) {
    elements.push(
      markdownElement(
        input.artifacts
          .map((artifact) => `- ${sanitizeFeishuText(artifact, sanitize)}`)
          .join('\n')
      )
    )
  }

  if (input.gateId && input.options && input.options.length > 0) {
    elements.push(buildGateActions(input.runId, input.gateId, input.options, sanitize))
  }

  return sanitizeFeishuValue({
    msg_type: 'interactive',
    card: {
      config: { wide_screen_mode: true },
      header: {
        template: statusTemplates[input.status],
        title: {
          tag: 'plain_text',
          content: input.title ?? `Orca ${statusLabels[input.status]}`
        }
      },
      elements
    }
  } satisfies FeishuInteractiveCard, sanitize)
}

function markdownElement(content: string): unknown {
  return {
    tag: 'div',
    text: {
      tag: 'lark_md',
      content
    }
  }
}

function buildGateActions(
  runId: string,
  gateId: string,
  options: string[],
  sanitize: FeishuSanitizeOptions
): unknown {
  return {
    tag: 'action',
    actions: options.map((option) => ({
      tag: 'button',
      text: {
        tag: 'plain_text',
        content: sanitizeFeishuText(option, sanitize)
      },
      type: 'primary',
      value: {
        action: 'resolve_gate',
        run_id: sanitizeFeishuText(runId, sanitize),
        gate_id: sanitizeFeishuText(gateId, sanitize),
        resolution: sanitizeFeishuText(option, sanitize)
      }
    }))
  }
}
