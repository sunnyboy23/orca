import type { AgentsMessages } from './settings-agents-types'

const awakeKeywords = ['awake', 'sleep', 'power', 'agent', 'running', 'working', 'lid', 'display']

export const agentsEn: AgentsMessages = {
  search: {
    agents: {
      title: 'Agents',
      description: 'Configure AI coding agents, default agent, and command overrides.',
      keywords: [
        'agent',
        'default',
        'claude',
        'codex',
        'opencode',
        'pi',
        'gemini',
        'aider',
        'goose',
        'amp',
        'kilocode',
        'kiro',
        'charm',
        'auggie',
        'cline',
        'codebuff',
        'continue',
        'cursor',
        'droid',
        'kimi',
        'mistral',
        'qwen',
        'rovo',
        'hermes',
        'openclaw',
        'copilot',
        'grok',
        'github',
        'github copilot',
        'command',
        'override',
        'install',
        'detected'
      ]
    },
    defaultAgent: {
      title: 'Default Agent',
      description: 'Pre-select an AI coding agent in the new-workspace composer.',
      keywords: [
        'agent',
        'default',
        'claude',
        'codex',
        'opencode',
        'pi',
        'gemini',
        'aider',
        'copilot',
        'grok'
      ]
    },
    awake: {
      title: 'Keep computer awake while agents are working',
      description:
        'Keeps this computer and display awake while agents are working. Orca also asks this device to stay awake when the lid is closed, subject to its power policy.',
      windowsDescription:
        "Keeps this computer and display awake while agents are working. Lid-close behavior follows this device's power settings.",
      keywords: awakeKeywords
    }
  },
  defaultAgent: {
    title: 'Default Agent',
    description: 'Pre-selected agent when opening a new workspace.',
    auto: 'Auto',
    blank: 'No agent (blank terminal)'
  },
  awake: {
    title: 'Keep computer awake while agents are working',
    description:
      'Keeps this computer and display awake while agents are working. Orca also asks this device to stay awake when the lid is closed, subject to its power policy.',
    windowsDescription:
      "Keeps this computer and display awake while agents are working. Lid-close behavior follows this device's power settings."
  },
  row: {
    command: 'Command',
    reset: 'Reset',
    detected: 'Detected',
    notInstalled: 'Not installed',
    defaultAgent: 'Default agent',
    setDefault: 'Set as default',
    default: 'Default',
    customizeCommand: 'Customize command',
    docs: 'Docs',
    install: 'Install',
    collapseCommand: 'Collapse command override',
    expandCommand: 'Expand command override',
    overrideHelp: 'Override the binary path or name used to launch this agent.'
  },
  sections: {
    installed: 'Installed',
    detectedCount: (count) => `${count} detected`,
    availableToInstall: 'Available to install',
    agentsCount: (count) => `${count} agents`,
    refreshTitle: 'Re-read your shell PATH and re-detect installed agents',
    refreshing: 'Refreshing...',
    refresh: 'Refresh',
    detecting: 'Detecting installed agents...'
  }
}
