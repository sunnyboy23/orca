import type { AccountsMessages } from './settings-accounts-types'

export const accountsEn: AccountsMessages = {
  search: {
    claude: {
      title: 'Claude Accounts',
      description: 'Optional account switching for Claude while preserving shared chat context.',
      keywords: ['claude', 'account', 'switch', 'active', 'status bar', 'quota', 'optional']
    },
    codex: {
      title: 'Codex Accounts',
      description: 'Optional account switching for Codex and live rate limit fetching.',
      keywords: ['codex', 'account', 'rate limit', 'status bar', 'quota', 'optional']
    },
    activeCodex: {
      title: 'Active Codex Account',
      description: 'Choose which optional saved Codex account powers live quota reads.',
      keywords: ['codex', 'account', 'switch', 'active', 'status bar', 'optional']
    },
    gemini: {
      title: 'Use Gemini CLI credentials',
      description:
        'Extracts OAuth credentials from your local Gemini CLI installation to authenticate with Google.',
      keywords: ['gemini', 'cli', 'oauth', 'credentials', 'experimental', 'rate limit', 'status bar']
    },
    opencodeCookie: {
      title: 'OpenCode Go Session Cookie',
      description: 'Paste your opencode.ai session cookie for rate limit fetching.',
      keywords: ['opencode', 'cookie', 'session', 'rate limit', 'status bar']
    },
    opencodeWorkspace: {
      title: 'OpenCode Go Workspace ID',
      description: 'Optional workspace ID override if the automatic lookup fails.',
      keywords: ['opencode', 'workspace', 'id', 'wrk', 'rate limit', 'status bar']
    }
  },
  common: {
    accounts: 'Accounts',
    addAccount: 'Add Account',
    active: 'Active',
    systemDefault: 'System default',
    codexAccount: 'Codex account',
    claudeAccount: 'Claude account',
    reauthenticate: 'Re-authenticate',
    remove: 'Remove',
    removeAccount: 'Remove Account',
    cancel: 'Cancel',
    clear: 'Clear'
  },
  toasts: {
    codexLoadFailed: 'Could not load Codex accounts.',
    claudeLoadFailed: 'Could not load Claude accounts.',
    codexUpdateFailed: 'Codex account update failed.',
    claudeUpdated: 'Claude account updated.',
    claudeUpdateFailed: 'Claude account update failed.',
    claudeRestartDescription: (previous, next) =>
      `${previous} → ${next}. Restart live Claude terminals before continuing old sessions.`
  },
  errors: {
    codexSignInTimeout: 'Codex sign-in took too long to finish. Please try again.',
    codexUnavailable: 'Codex sign-in is temporarily unavailable. Please try again in a minute.',
    codexSignInFailed: 'Codex sign-in failed. Please try again.',
    claudeSignInFailed: 'Claude sign-in failed. Please try again.'
  },
  claude: {
    sectionDescription:
      'Optional. Orca can use your normal Claude login; add accounts only if you want quick switching without moving chat sessions.',
    settingDescription: 'Optional account switcher for the shared Claude auth files.',
    rowDescription:
      'Orca swaps Claude auth only; config and chat history stay in the shared Claude root.',
    systemDefaultDescription: 'Use your current system Claude login.',
    empty:
      'No managed Claude accounts yet. Orca will use your system default Claude login until you add one here.',
    removeDialogTitle: 'Remove Claude Account?',
    removeDialogDescription:
      'Orca will delete the managed Claude auth for this saved account. If it is currently active, Orca falls back to the system default Claude login.'
  },
  codex: {
    sectionDescription:
      'Optional. Orca can use your normal Codex login; add accounts only if you want quick switching in Orca.',
    wslDescription: (distro) =>
      `WSL terminals use the Codex login inside ${distro}. Managed Codex account switching applies to host terminals.`,
    localAuthDescription:
      'Each account keeps its own local sign-in context in Orca. Account auth stays on this device.',
    settingDescription: 'Manage which Codex account Orca uses for live rate limit fetching.',
    rowDescription: (distro) =>
      distro
        ? `Use codex login in ${distro} to change the WSL Codex account.`
        : 'Add a Codex account to use it in Orca.',
    empty: (distro) =>
      distro
        ? `No managed host Codex accounts yet. WSL terminals will use the Codex login in ${distro}.`
        : 'No managed Codex accounts yet. Orca will use your system default Codex login until you add one here.',
    systemDefaultDescription: 'Use your current system Codex login.',
    removeDialogTitle: 'Remove Codex Account?',
    removeDialogDescription:
      'Orca will delete the managed Codex home for this saved account. If it is currently active, Orca falls back to the system default Codex login.'
  },
  gemini: {
    sectionDescription: 'Configure Gemini provider settings.',
    title: 'Use Gemini CLI credentials',
    titleWithExperiment: 'Use Gemini CLI credentials (experimental)',
    description:
      'Extracts OAuth credentials from your local Gemini CLI installation to authenticate with Google. This uses credentials issued to the Gemini CLI app, not Orca. May break if Google updates the CLI. Use at your own risk.'
  },
  opencode: {
    sectionDescription: 'Configure OpenCode Go provider settings.',
    cookieTitle: 'OpenCode Go Session Cookie',
    cookieLabel: 'OpenCode Go session cookie',
    cookieDescription: 'Paste your opencode.ai session cookie for rate limit fetching.',
    cookieHelp:
      "Paste either the raw token value (e.g. Fe26.2**...) or the full cookie header (e.g. auth=Fe26.2**...). Find it in your browser's DevTools → Network → any opencode.ai request → Cookie header.",
    workspaceTitle: 'OpenCode Go Workspace ID',
    workspaceLabel: 'Workspace ID override',
    workspaceDescription: 'Optional workspace ID override if the automatic lookup fails.',
    workspaceHelp:
      'Find this in the URL after logging into opencode.ai (e.g. opencode.ai/workspace/wrk_.../go).',
    cookiePlaceholder: 'Fe26.2**... token or auth=Fe26.2**... header',
    workspacePlaceholder: 'wrk_...  (leave blank for automatic lookup)'
  }
}
