import type {
  ExperimentalMessages,
  InputMessages,
  PrivacyMessages,
  TasksMessages
} from './settings-core-panes-types'

export const inputEn: InputMessages = {
  middleClickPaste: {
    title: 'Middle-click Paste from Selection',
    description:
      'Enabled by default on Linux and macOS. Linux uses the system selection clipboard; other platforms use a private buffer.',
    keywords: [
      'input',
      'editing',
      'selection',
      'primary selection',
      'middle click',
      'middle mouse',
      'paste',
      'clipboard',
      'x11',
      'linux',
      'macos'
    ]
  }
}

export const tasksEn: TasksMessages = {
  header: {
    title: 'Task Sources',
    description:
      'Choose which task providers appear in the Tasks page source picker and sidebar shortcuts. At least one provider must stay visible.'
  },
  providersSearch: {
    title: 'Task Providers',
    description: 'Choose which task providers appear in the Tasks page and sidebar shortcuts.',
    keywords: ['tasks', 'provider', 'source', 'github', 'gitlab', 'linear', 'display', 'hide']
  },
  providerDescriptions: {
    github: 'Show GitHub in the Tasks source picker and sidebar shortcuts.',
    gitlab: 'Show GitLab in the Tasks source picker and sidebar shortcuts.',
    linear: 'Show Linear in the Tasks source picker and sidebar shortcuts.'
  }
}

export const experimentalEn: ExperimentalMessages = {
  pet: {
    title: 'Pet',
    description:
      'Shows a small animated pet pinned to the bottom-right corner. Pick a character (Claudino, OpenCode, Gremlin) or upload your own PNG, APNG, GIF, WebP, JPG, or SVG from the status-bar pet menu. Hide it any time from the same menu without disabling this setting.',
    keywords: [
      'experimental',
      'pet',
      'sidekick',
      'mascot',
      'overlay',
      'animated',
      'corner',
      'character'
    ]
  },
  agentsView: {
    title: 'Agents View',
    description:
      'Adds an Agents entry to the left sidebar with a threaded worktree feed for completed agents, blocking questions, unread state, and worktree creation events. Experimental — the event model and UI may change.',
    keywords: [
      'experimental',
      'agents',
      'agents view',
      'activity',
      'notifications',
      'worktrees',
      'timeline',
      'unread',
      'bell',
      'sidebar'
    ]
  },
  symlinks: {
    title: 'Symlinks on worktrees',
    description:
      'Automatically symlink configured files or folders into newly created worktrees so shared state (envs, caches, installs) stays connected.',
    keywords: [
      'experimental',
      'worktree',
      'worktrees',
      'symlink',
      'symlinks',
      'link',
      'links',
      'shared',
      'env',
      'node_modules'
    ]
  },
  missingSearchEntry: (title) => `Missing experimental-pane search entry: "${title}"`
}

export const privacyEn: PrivacyMessages = {
  telemetry: {
    title: 'Share anonymous usage data',
    description:
      'Help us figure out what to build next. Orca sends anonymous counts of which features you use and where things break.',
    keywords: ['telemetry', 'usage', 'anonymous', 'opt in', 'opt out', 'share'],
    policyLink: 'Privacy policy',
    ariaLabel: 'Share anonymous usage data'
  },
  blocked: {
    ci: 'Telemetry is disabled because a CI environment variable is set. Unset it and restart.',
    env: (envName) =>
      `Telemetry is disabled by the ${envName} environment variable. Unset it and restart to re-enable.`
  },
  diagnostics: {
    search: {
      pane: {
        title: 'Privacy & Telemetry',
        description: 'Anonymous product usage data, diagnostics, and telemetry controls.',
        keywords: [
          'privacy',
          'telemetry',
          'analytics',
          'usage',
          'anonymous',
          'data',
          'posthog',
          'opt out',
          'opt in'
        ]
      },
      bundle: {
        title: 'Diagnostics',
        description: 'Trace files and OTLP export controls.',
        keywords: ['diagnostics', 'trace', 'logs', 'otlp', 'opentelemetry', 'support']
      },
      environment: {
        title: 'Telemetry environment variables',
        description: 'Environment variables that disable telemetry transmission.',
        keywords: [
          'do not track',
          'do_not_track',
          'orca_telemetry_disabled',
          'ci',
          'continuous integration',
          'env',
          'environment variable',
          'disable'
        ]
      }
    },
    toasts: {
      openTraceFolderFailed: 'Could not open trace folder',
      localTracesCleared: 'Local trace files cleared',
      clearTraceFilesFailed: 'Could not clear trace files',
      previewCreated: 'Diagnostic bundle preview created',
      previewCreateFailed: 'Could not create diagnostic bundle',
      previewOpened: 'Diagnostic bundle preview opened',
      previewOpenFailed: 'Could not open diagnostic bundle preview',
      bundleUploaded: 'Diagnostic bundle uploaded',
      bundleUploadFailed: 'Could not upload diagnostic bundle',
      previewDiscarded: 'Diagnostic bundle preview discarded',
      previewDiscardFailed: 'Could not discard diagnostic bundle preview',
      ticketCopied: 'Diagnostic ticket copied',
      ticketCopyFailed: 'Could not copy diagnostic ticket',
      uploadedBundleDeleted: 'Uploaded diagnostic bundle deleted',
      bundleDeleteFailed: 'Could not delete diagnostic bundle'
    },
    bundle: {
      title: 'Diagnostic bundle',
      uploadedTicket: (ticketId) => `Uploaded ticket ${ticketId}.`,
      readyToUpload: 'Ready to upload.',
      openPreviewBeforeUpload: 'Open the preview before uploading.',
      spanSummary: (spanCount, bytes, previewState) =>
        `${spanCount} span(s), ${bytes}. ${previewState}`,
      redactedPreview: 'Creates a redacted NDJSON preview for support upload.',
      copyTicket: 'Copy ticket',
      deleteBundle: 'Delete bundle',
      done: 'Done',
      openPreview: 'Open preview',
      upload: 'Upload',
      discard: 'Discard',
      createPreview: 'Create preview'
    },
    traceFolder: {
      title: 'Open trace folder',
      fallbackPath: 'the trace folder',
      description: (path) => `Reveals ${path} in your file manager.`,
      action: 'Open trace folder'
    },
    clearTraces: {
      title: 'Clear local traces',
      description: 'Deletes every rotated trace file on this machine.',
      action: 'Clear local traces'
    },
    otlp: {
      title: 'OTLP export',
      description: 'Set ORCA_OTLP_TRACES_URL to point Orca at your own OpenTelemetry collector.',
      enabled: 'Enabled',
      disabled: 'Disabled'
    },
    disabledNote: {
      doNotTrack:
        'DO_NOT_TRACK=1 is set — network-bound diagnostics are disabled. The local trace file is still active.',
      telemetryDisabled:
        'ORCA_TELEMETRY_DISABLED=1 is set — network-bound diagnostics are disabled. The local trace file is still active.',
      diagnosticsDisabled:
        'ORCA_DIAGNOSTICS_DISABLED=1 is set — every diagnostics surface is off, including local trace writes.',
      ci: 'Running in CI — diagnostics are off.',
      fallback: 'Diagnostics are disabled by an environment variable.'
    }
  }
}
