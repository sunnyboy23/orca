const DIRECT_RUN_PREFIXES = ['转为任务', '创建任务', '开发任务', 'run', '/run']

const CASUAL_PATTERNS = [
  /^你?好[啊呀]?[。.!！?？]*$/i,
  /^hi[。.!！?？]*$/i,
  /^hello[。.!！?？]*$/i,
  /^在吗[。.!！?？]*$/i,
  /^收到[。.!！?？]*$/i,
  /^ok[。.!！?？]*$/i,
  /^好的[。.!！?？]*$/i,
  /^谢谢[。.!！?？]*$/i,
  /^辛苦了[。.!！?？]*$/i
]

export type FeishuDevelopmentTaskIntent =
  | { shouldCreate: true; spec: string }
  | { shouldCreate: false; reason: 'empty' | 'casual' | 'unclear' }

export function classifyFeishuDevelopmentTaskIntent(text: string): FeishuDevelopmentTaskIntent {
  const normalized = normalizeIntentText(text)
  if (!normalized) {
    return { shouldCreate: false, reason: 'empty' }
  }
  if (CASUAL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return { shouldCreate: false, reason: 'casual' }
  }

  const directSpec = stripDirectRunPrefix(normalized)
  if (directSpec) {
    return { shouldCreate: true, spec: directSpec }
  }

  return { shouldCreate: false, reason: 'unclear' }
}

function normalizeIntentText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()
}

function stripDirectRunPrefix(text: string): string | null {
  for (const prefix of DIRECT_RUN_PREFIXES) {
    const pattern = new RegExp(`^${escapeRegExp(prefix)}(?:\\s+|[:：])(.+)$`, 'i')
    const match = pattern.exec(text)
    const spec = match?.[1]?.trim()
    if (spec) {
      return spec
    }
  }
  return null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
