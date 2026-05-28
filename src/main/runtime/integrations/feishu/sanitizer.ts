export type FeishuSanitizeOptions = {
  localPaths?: string[]
}

const SECRET_REF_RE = /keychain:[^\s,;)\]}]+/g
const LOCAL_PATH_RE =
  /(?:\/Users\/[^\s,;)\]}]+|\/home\/[^\s,;)\]}]+|\/private\/[^\s,;)\]}]+|[A-Za-z]:\\[^\s,;)\]}]+)/g
const SECRET_FIELD_RE =
  /\b(appSecret|app_secret|encryptKey|encrypt_key|verificationToken|verification_token|secret|token)\b(\s*[:=]\s*)["']?([^"',\s}\]]+)/gi

export function sanitizeFeishuText(value: string, options: FeishuSanitizeOptions = {}): string {
  let sanitized = value
  for (const localPath of options.localPaths ?? []) {
    sanitized = replaceAllLiteral(sanitized, localPath, '[local-path]')
  }
  return sanitized
    .replace(SECRET_REF_RE, 'keychain:[redacted]')
    .replace(SECRET_FIELD_RE, '$1$2[redacted]')
    .replace(LOCAL_PATH_RE, '[local-path]')
}

export function sanitizeFeishuValue<T>(value: T, options: FeishuSanitizeOptions = {}): T {
  if (typeof value === 'string') {
    return sanitizeFeishuText(value, options) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFeishuValue(item, options)) as T
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeFeishuValue(item, options)])
    ) as T
  }
  return value
}

function replaceAllLiteral(value: string, search: string, replacement: string): string {
  if (!search) {
    return value
  }
  return value.split(search).join(replacement)
}
