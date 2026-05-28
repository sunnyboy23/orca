import { agentsEn } from '@/i18n/settings-agents-en'
import type { AgentsMessages } from '@/i18n/settings-agents-types'

export const AGENT_AWAKE_TITLE = agentsEn.awake.title

export function getAgentAwakeDescription(
  messages: AgentsMessages = agentsEn,
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
): string {
  if (userAgent.includes('Windows')) {
    return messages.awake.windowsDescription
  }

  return messages.awake.description
}

export function getAgentAwakeSearchKeywords(
  messages: AgentsMessages = agentsEn,
  userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent
): string[] {
  const keywords = messages.search.awake.keywords
  return userAgent.includes('Linux') ? [...keywords, 'linux'] : keywords
}
