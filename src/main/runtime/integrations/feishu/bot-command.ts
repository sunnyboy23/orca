export type FeishuBotCommand =
  | { type: 'help' }
  | { type: 'status' }
  | { type: 'stop' }
  | { type: 'continue'; body: string }
  | { type: 'run'; spec: string }
  | { type: 'empty' }

const HELP_COMMANDS = new Set(['帮助', 'help', '/help'])
const STATUS_COMMANDS = new Set(['状态', '进度', 'status', '/status'])
const STOP_COMMANDS = new Set(['停止', '中止', '取消', 'stop', '/stop', 'cancel'])
const CONTINUE_PREFIXES = ['继续', 'continue', '/continue']

export function parseFeishuBotCommand(text: string): FeishuBotCommand {
  const normalized = normalizeCommandText(text)
  if (!normalized) {
    return { type: 'empty' }
  }

  const lowered = normalized.toLowerCase()
  if (HELP_COMMANDS.has(lowered) || HELP_COMMANDS.has(normalized)) {
    return { type: 'help' }
  }
  if (STATUS_COMMANDS.has(lowered) || STATUS_COMMANDS.has(normalized)) {
    return { type: 'status' }
  }
  if (STOP_COMMANDS.has(lowered) || STOP_COMMANDS.has(normalized)) {
    return { type: 'stop' }
  }

  const continuation = parseContinuation(normalized)
  if (continuation) {
    return continuation
  }

  return { type: 'run', spec: normalized }
}

function parseContinuation(text: string): Extract<FeishuBotCommand, { type: 'continue' }> | null {
  for (const prefix of CONTINUE_PREFIXES) {
    const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:\\s+|[:：])(.+)$`, 'i')
    const match = pattern.exec(text)
    const body = match?.[1]?.trim()
    if (body) {
      return { type: 'continue', body }
    }
  }
  return null
}

function normalizeCommandText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
