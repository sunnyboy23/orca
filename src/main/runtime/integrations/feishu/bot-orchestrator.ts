import type { FeishuReceivedMessage } from './message'
import type { FeishuMessageClient } from './im-client'
import { sendFeishuTextMessage } from './im-client'
import { parseFeishuBotCommand, type FeishuBotCommand } from './bot-command'
import type { OrchestrationDb } from '../../orchestration/db'
import type { CoordinatorRuntime } from '../../orchestration/coordinator'
import { startCoordinatorRun, stopActiveCoordinatorRun } from '../../orchestration/run-service'
import { resolveFeishuDecisionGate } from './gate-resolver'
import { classifyFeishuDevelopmentTaskIntent } from './development-task-intent'

export type FeishuBotOrchestrator = {
  receiveMessage(message: FeishuReceivedMessage): Promise<{ runId?: string; handled: boolean }>
  createRunFromText(params: {
    chatId?: string
    text: string
  }): Promise<{ runId: string } | { error: string }>
}

export type FeishuMessageDedupeStore = {
  has(messageId: string): boolean
  add(messageId: string): void
}

export class MemoryFeishuMessageDedupeStore implements FeishuMessageDedupeStore {
  private readonly seen = new Set<string>()

  has(messageId: string): boolean {
    return this.seen.has(messageId)
  }

  add(messageId: string): void {
    this.seen.add(messageId)
  }
}

export function createFeishuBotOrchestrator({
  db,
  runtime,
  messageClient,
  dedupe = new MemoryFeishuMessageDedupeStore()
}: {
  db: OrchestrationDb
  runtime: CoordinatorRuntime
  messageClient: FeishuMessageClient
  dedupe?: FeishuMessageDedupeStore
}): FeishuBotOrchestrator {
  return {
    async receiveMessage(message) {
      if (message.messageId && dedupe.has(message.messageId)) {
        return { handled: true }
      }
      if (message.messageId) {
        dedupe.add(message.messageId)
      }

      const command = parseFeishuBotCommand(message.text)
      return handleCommand({ command, message, db, runtime, messageClient })
    },
    async createRunFromText(params) {
      try {
        const result = await startRunFromFeishuMessage({
          spec: params.text,
          message: {
            text: params.text,
            chatId: params.chatId,
            eventType: 'orca.client'
          },
          db,
          runtime,
          messageClient
        })
        return result.runId ? { runId: result.runId } : { error: '未能创建飞书任务。' }
      } catch (error) {
        return { error: error instanceof Error ? error.message : '未能创建飞书任务。' }
      }
    }
  }
}

async function handleCommand({
  command,
  message,
  db,
  runtime,
  messageClient
}: {
  command: FeishuBotCommand
  message: FeishuReceivedMessage
  db: OrchestrationDb
  runtime: CoordinatorRuntime
  messageClient: FeishuMessageClient
}): Promise<{ runId?: string; handled: boolean }> {
  if (command.type === 'empty') {
    await reply(messageClient, message.chatId, '没有收到有效任务内容。发送“帮助”查看可用指令。')
    return { handled: true }
  }
  if (command.type === 'help') {
    await reply(messageClient, message.chatId, buildHelpText())
    return { handled: true }
  }
  if (command.type === 'status') {
    await reply(messageClient, message.chatId, buildStatusText(db))
    return { handled: true }
  }
  if (command.type === 'stop') {
    const result = stopActiveRunIfAny(db)
    await reply(messageClient, message.chatId, result)
    return { handled: true }
  }
  if (command.type === 'continue') {
    const resolved = resolvePendingGate(db, command.body)
    await reply(messageClient, message.chatId, resolved)
    return { handled: true }
  }
  const intent = classifyFeishuDevelopmentTaskIntent(command.spec)
  if (!intent.shouldCreate) {
    await reply(messageClient, message.chatId, buildIgnoredMessageText(intent.reason))
    return { handled: false }
  }
  return startRunFromFeishuMessage({ spec: intent.spec, message, db, runtime, messageClient })
}

async function startRunFromFeishuMessage({
  spec,
  message,
  db,
  runtime,
  messageClient
}: {
  spec: string
  message: FeishuReceivedMessage
  db: OrchestrationDb
  runtime: CoordinatorRuntime
  messageClient: FeishuMessageClient
}): Promise<{ runId?: string; handled: boolean }> {
  const existing = db.getActiveCoordinatorRun()
  if (existing) {
    await reply(
      messageClient,
      message.chatId,
      `当前已有任务在执行：${existing.id}。发送“状态”查看进度，或发送“停止”中止当前任务。`
    )
    return { runId: existing.id, handled: true }
  }

  const run = startCoordinatorRun(db, runtime, {
    spec,
    from: 'feishu',
    mode: 'r2',
    source: 'feishu'
  })
  await reply(messageClient, message.chatId, `已收到任务，Orca 已创建 run：${run.runId}`)
  return { runId: run.runId, handled: true }
}

function stopActiveRunIfAny(db: OrchestrationDb): string {
  try {
    const result = stopActiveCoordinatorRun(db)
    return `已停止当前任务：${result.runId}`
  } catch {
    return '当前没有正在执行的任务。'
  }
}

function resolvePendingGate(db: OrchestrationDb, resolution: string): string {
  const run = db.getActiveCoordinatorRun()
  if (!run) {
    return '当前没有正在执行的任务。'
  }
  const tasks = db.listTasks({ runId: run.id })
  const pendingGate = tasks
    .flatMap((task) => db.listGates({ taskId: task.id, status: 'pending' }))
    .at(0)
  if (!pendingGate) {
    return '当前没有等待确认的问题。'
  }
  const result = resolveFeishuDecisionGate(db, {
    runId: run.id,
    gateId: pendingGate.id,
    resolution
  })
  return result.ok ? `已确认：${resolution}` : `确认失败：${result.reason}`
}

function buildStatusText(db: OrchestrationDb): string {
  const run = db.getActiveCoordinatorRun()
  if (!run) {
    return '当前没有正在执行的任务。'
  }
  const tasks = db.listTasks({ runId: run.id })
  const summary = countTasksByStatus(tasks.map((task) => task.status))
  return [`当前任务：${run.id}`, `状态：${run.status}`, `任务：${summary}`].join('\n')
}

function countTasksByStatus(statuses: string[]): string {
  const counts = new Map<string, number>()
  for (const status of statuses) {
    counts.set(status, (counts.get(status) ?? 0) + 1)
  }
  return (
    [...counts.entries()].map(([status, count]) => `${status} ${count}`).join('，') || '暂无任务'
  )
}

function buildHelpText(): string {
  return [
    '可以直接发送开发任务给 Orca。',
    '如果只是聊天，Orca 会先记录消息，不会自动创建任务。',
    '常用指令：',
    '- 任务 <内容>：明确创建开发任务',
    '- 状态：查看当前任务',
    '- 停止：中止当前任务',
    '- 继续 <内容>：回复等待确认的问题'
  ].join('\n')
}

function buildIgnoredMessageText(reason: 'empty' | 'casual' | 'unclear'): string {
  if (reason === 'casual') {
    return '收到。看起来这不是开发任务，我先只记录消息。要创建任务可以发送“任务 <需求内容>”。'
  }
  return '这条消息还不像明确的开发任务，我先只记录消息。要创建任务可以发送“任务 <需求内容>”，或描述要修复/实现/优化的功能。'
}

async function reply(
  client: FeishuMessageClient,
  chatId: string | undefined,
  text: string
): Promise<void> {
  await sendFeishuTextMessage({ client, chatId, text })
}
