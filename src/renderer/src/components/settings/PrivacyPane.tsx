import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import type { GlobalSettings } from '../../../../shared/types'
import type { TelemetryConsentState } from '../../../../shared/telemetry-consent-types'
import { Label } from '../ui/label'
import { PRIVACY_URL, getConsentState, setOptIn as telemetrySetOptIn } from '../../lib/telemetry'
import { useAppStore } from '../../store'
import { PrivacyDiagnosticsSection } from './PrivacyDiagnosticsSection'
import { useI18n } from '@/i18n'
import { privacyEn } from '@/i18n/settings-core-panes-en'
import type { PrivacyMessages } from '@/i18n/settings-core-panes-types'

export type EnvBlockedReason = 'do_not_track' | 'orca_disabled' | 'ci'
export type BlockedReason = { kind: 'env'; reason: EnvBlockedReason }

type PrivacyPaneProps = {
  settings: GlobalSettings
}

const PRIVACY_PANE_BLOCKED_HELPER_ID = 'privacy-pane-blocked-helper'

export function isEnvBlocked(consent: TelemetryConsentState | null): consent is {
  effective: 'disabled'
  reason: EnvBlockedReason
} {
  return (
    consent?.effective === 'disabled' &&
    (consent.reason === 'do_not_track' ||
      consent.reason === 'orca_disabled' ||
      consent.reason === 'ci')
  )
}

export function envVarNameForReason(reason: EnvBlockedReason): string {
  if (reason === 'do_not_track') {
    return 'DO_NOT_TRACK'
  }
  if (reason === 'orca_disabled') {
    return 'ORCA_TELEMETRY_DISABLED'
  }
  return 'CI'
}

export function computeBlockedReason(consent: TelemetryConsentState | null): BlockedReason | null {
  if (isEnvBlocked(consent)) {
    return { kind: 'env', reason: consent.reason }
  }
  return null
}

export function PrivacyPane({ settings }: PrivacyPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.privacy
  const [consent, setConsent] = useState<TelemetryConsentState | null>(null)
  const [inFlight, setInFlight] = useState(false)
  const fetchSettings = useAppStore((s) => s.fetchSettings)

  useEffect(() => {
    let stale = false
    void getConsentState().then((state) => {
      if (!stale) {
        setConsent(state)
      }
    })
    return () => {
      stale = true
    }
  }, [settings.telemetry?.optedIn])

  const blocked = computeBlockedReason(consent)
  const toggleChecked = settings.telemetry?.optedIn === true

  const handleToggle = async (): Promise<void> => {
    if (blocked || inFlight) {
      return
    }
    setInFlight(true)
    try {
      await telemetrySetOptIn(!toggleChecked)
      await fetchSettings()
    } finally {
      setInFlight(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            <Label>{copy.telemetry.title}</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {copy.telemetry.description}{' '}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground"
              onClick={() => void window.api.shell.openUrl(PRIVACY_URL)}
            >
              {copy.telemetry.policyLink}
            </button>
            .
          </p>
        </div>
        <button
          role="switch"
          aria-checked={toggleChecked}
          aria-label={copy.telemetry.ariaLabel}
          aria-describedby={blocked ? PRIVACY_PANE_BLOCKED_HELPER_ID : undefined}
          disabled={blocked !== null || inFlight}
          onClick={handleToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors ${
            toggleChecked ? 'bg-foreground' : 'bg-muted-foreground/30'
          } ${blocked !== null || inFlight ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
              toggleChecked ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {blocked ? (
        <BlockedHelper blocked={blocked} id={PRIVACY_PANE_BLOCKED_HELPER_ID} copy={copy} />
      ) : null}
      <PrivacyDiagnosticsSection copy={copy} />
    </div>
  )
}

function BlockedHelper({
  blocked,
  id,
  copy = privacyEn
}: {
  blocked: BlockedReason
  id: string
  copy?: PrivacyMessages
}): React.JSX.Element {
  return (
    <div id={id} className="pb-2 text-xs text-muted-foreground">
      {blocked.reason === 'ci' ? (
        <p>{copy.blocked.ci}</p>
      ) : (
        <p>{renderEnvBlockedMessage(copy, envVarNameForReason(blocked.reason))}</p>
      )}
    </div>
  )
}

function renderEnvBlockedMessage(copy: PrivacyMessages, envName: string): React.ReactNode {
  const message = copy.blocked.env(envName)
  const [before, ...after] = message.split(envName)
  return (
    <>
      {before}
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{envName}</code>
      {after.join(envName)}
    </>
  )
}
