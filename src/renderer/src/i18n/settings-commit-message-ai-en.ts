import type { CommitMessageAiMessages } from './settings-panes-types'

export const commitMessageAiEn: CommitMessageAiMessages = {
  header: {
    title: 'AI Commit Messages',
    description: 'Generate commit messages from staged changes using a local agent CLI.'
  },
  enable: {
    title: 'Enable AI commit messages',
    description: 'Adds a Generate button to the Source Control panel.',
    rowDescription:
      'Adds a Generate button to the Source Control panel that drafts a commit message from your staged changes. Runs the agent CLI locally, or on the SSH host when working remotely, and waits for the response.',
    keywords: [
      'ai',
      'commit',
      'message',
      'generate',
      'agent',
      'claude',
      'codex',
      'source control',
      'enabled'
    ]
  },
  agent: {
    title: 'Agent',
    description: 'Which agent to invoke when generating a commit message.',
    rowDescription:
      'Which agent drafts your commit messages. Orca invokes its CLI in the background, so the agent must be installed on the machine that hosts the worktree: your computer for local worktrees, or the SSH host for remote ones.',
    keywords: ['agent', 'claude', 'codex', 'opencode', 'gemini', 'cursor'],
    notConfigured: 'Not configured',
    comingSoon: 'Coming soon',
    custom: 'Custom',
    unsupportedDefault: (agent) =>
      `Your default agent is ${agent}, which does not support commit message generation yet.`,
    unsupportedSelectedComingSoon: (agent) =>
      `${agent} commit message generation is coming soon.`,
    unsupportedSelected: (agent) =>
      `${agent} does not support commit message generation yet.`,
    chooseSupported: 'Choose a supported agent or Custom.'
  },
  customCommand: {
    title: 'Custom command',
    label: 'Custom command',
    description: 'Command line Orca runs to generate the commit message.',
    keywords: ['custom', 'command', 'cli', 'binary', 'prompt', 'placeholder', 'ollama'],
    help: {
      beforePlaceholder: 'Use',
      afterPlaceholder:
        'where the prompt should be substituted (passed as a single argument).',
      stdin: 'Omit it and the prompt is piped via stdin instead - useful for CLIs like',
      quoting:
        'Quoting is for grouping arguments only; we never invoke a shell, so $VAR and backticks are not expanded.'
    },
    placeholder: (placeholder) => `e.g. ollama run llama3.1 ${placeholder}`
  },
  model: {
    title: 'Model',
    description: 'Which model the selected agent uses to generate the message.',
    keywords: ['model', 'haiku', 'sonnet', 'opus', 'gpt'],
    dynamicDescription: 'Refreshes from the selected CLI when the CLI exposes model discovery.',
    staticDescription: 'This agent does not expose model discovery, so Orca uses a manual catalog.',
    refresh: 'Refresh models',
    discoveryFailed: 'Failed to discover models'
  },
  thinking: {
    title: 'Thinking effort',
    description: 'Reasoning effort level for the selected model. Higher levels are slower.',
    rowDescription:
      'Higher effort produces more careful messages but takes longer and costs more tokens.',
    keywords: ['thinking', 'effort', 'reasoning'],
    levels: {
      off: 'Off',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      xhigh: 'Extra High',
      max: 'Max'
    }
  },
  customPrompt: {
    title: 'Custom prompt',
    description:
      'Optional instructions appended to the base prompt (e.g. Conventional Commits style).',
    rowDescription:
      'Appended verbatim to the base prompt. Use it to enforce Conventional Commits, gitmoji, ticket prefixes, or any other style your team prefers.',
    keywords: ['prompt', 'conventional commits', 'gitmoji', 'style'],
    placeholder:
      'Use Conventional Commits format (feat:, fix:, ...). Reference the ticket key when present.',
    unsavedChanges: 'Unsaved changes',
    saved: 'Saved',
    discard: 'Discard',
    saving: 'Saving...',
    save: 'Save'
  }
}
