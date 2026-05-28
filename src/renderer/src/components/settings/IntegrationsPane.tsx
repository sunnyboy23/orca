/* eslint-disable max-lines -- Why: this pane co-locates source-host and
   Linear integration cards so the preflight-check + status-badge +
   install/auth-prompt scaffolding lives in one place rather than fanning
   out across per-integration files that would each repeat the same
   pattern. Splitting buys nothing while the surface stays this narrow. */
import { useEffect, useState } from 'react'
import {
  Github,
  Gitlab,
  GitPullRequestArrow,
  ExternalLink,
  LoaderCircle,
  Lock,
  Terminal,
  Unlink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { useI18n } from '@/i18n'
export { INTEGRATIONS_PANE_SEARCH_ENTRIES } from './integrations-search'

function LinearIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
    </svg>
  )
}

type GhStatus = 'checking' | 'connected' | 'not-installed' | 'not-authenticated'
// Why: parallel to GhStatus — GitLab uses glab and the same three failure
// modes (probe in-flight / installed-but-unauth / missing entirely).
type GlabStatus = GhStatus
type BitbucketStatus = 'checking' | 'connected' | 'not-configured' | 'not-authenticated'
type AzureDevOpsStatus = 'checking' | 'configured' | 'not-configured' | 'not-authenticated'
type GiteaStatus = 'checking' | 'configured' | 'not-configured' | 'not-authenticated'

type TokenApiPreflightStatus = {
  configured: boolean
  authenticated: boolean
  account: string | null
  baseUrl: string | null
  tokenConfigured: boolean
}

type GiteaPreflightStatus = {
  configured: boolean
  authenticated: boolean
  account: string | null
  baseUrl: string | null
  tokenConfigured: boolean
}

function tokenApiStatusFromPreflight(
  status: TokenApiPreflightStatus | undefined
): AzureDevOpsStatus {
  if (!status?.configured) {
    return 'not-configured'
  }
  if (status.tokenConfigured && !status.baseUrl) {
    return 'configured'
  }
  if (status.tokenConfigured && !status.authenticated) {
    return 'not-authenticated'
  }
  return 'configured'
}

function giteaStatusFromPreflight(status: GiteaPreflightStatus | undefined): GiteaStatus {
  if (!status?.configured) {
    return 'not-configured'
  }
  if (status.tokenConfigured && !status.authenticated) {
    return 'not-authenticated'
  }
  return 'configured'
}

export function IntegrationsPane(): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.integrations
  const linearStatus = useAppStore((s) => s.linearStatus)
  const preflightStatus = useAppStore((s) => s.preflightStatus)
  const connectLinear = useAppStore((s) => s.connectLinear)
  const disconnectLinear = useAppStore((s) => s.disconnectLinear)
  const disconnectLinearWorkspace = useAppStore((s) => s.disconnectLinearWorkspace)
  const checkLinearConnection = useAppStore((s) => s.checkLinearConnection)
  const refreshPreflightStatus = useAppStore((s) => s.refreshPreflightStatus)
  const testLinearConnection = useAppStore((s) => s.testLinearConnection)
  const linearWorkspaces = linearStatus.workspaces ?? []

  const [ghStatus, setGhStatus] = useState<GhStatus>('checking')
  const [glabStatus, setGlabStatus] = useState<GlabStatus>('checking')
  const [bitbucketStatus, setBitbucketStatus] = useState<BitbucketStatus>('checking')
  const [bitbucketAccount, setBitbucketAccount] = useState<string | null>(null)
  const [azureDevOpsStatus, setAzureDevOpsStatus] = useState<AzureDevOpsStatus>('checking')
  const [azureDevOpsAccount, setAzureDevOpsAccount] = useState<string | null>(null)
  const [azureDevOpsBaseUrl, setAzureDevOpsBaseUrl] = useState<string | null>(null)
  const [giteaStatus, setGiteaStatus] = useState<GiteaStatus>('checking')
  const [giteaAccount, setGiteaAccount] = useState<string | null>(null)
  const [giteaBaseUrl, setGiteaBaseUrl] = useState<string | null>(null)
  const [linearDialogOpen, setLinearDialogOpen] = useState(false)
  const [linearApiKeyDraft, setLinearApiKeyDraft] = useState('')
  const [linearConnectState, setLinearConnectState] = useState<'idle' | 'connecting' | 'error'>(
    'idle'
  )
  const [linearConnectError, setLinearConnectError] = useState<string | null>(null)
  const [linearTestingWorkspaceId, setLinearTestingWorkspaceId] = useState<string | null>(null)
  const [linearTestResultByWorkspace, setLinearTestResultByWorkspace] = useState<
    Record<string, { state: 'ok' | 'error'; error?: string }>
  >({})

  useEffect(() => {
    void checkLinearConnection()
    void refreshPreflightStatus()
  }, [checkLinearConnection, refreshPreflightStatus])

  useEffect(() => {
    if (!preflightStatus) {
      return
    }
    if (!preflightStatus.gh.installed) {
      setGhStatus('not-installed')
    } else if (!preflightStatus.gh.authenticated) {
      setGhStatus('not-authenticated')
    } else {
      setGhStatus('connected')
    }
    const glab = preflightStatus.glab
    if (!glab || !glab.installed) {
      setGlabStatus('not-installed')
    } else if (!glab.authenticated) {
      setGlabStatus('not-authenticated')
    } else {
      setGlabStatus('connected')
    }
    const bitbucket = preflightStatus.bitbucket
    setBitbucketAccount(bitbucket?.account ?? null)
    if (!bitbucket?.configured) {
      setBitbucketStatus('not-configured')
    } else if (!bitbucket.authenticated) {
      setBitbucketStatus('not-authenticated')
    } else {
      setBitbucketStatus('connected')
    }
    const azureDevOps = preflightStatus.azureDevOps
    setAzureDevOpsAccount(azureDevOps?.account ?? null)
    setAzureDevOpsBaseUrl(azureDevOps?.baseUrl ?? null)
    setAzureDevOpsStatus(tokenApiStatusFromPreflight(azureDevOps))
    const gitea = preflightStatus.gitea
    setGiteaAccount(gitea?.account ?? null)
    setGiteaBaseUrl(gitea?.baseUrl ?? null)
    setGiteaStatus(giteaStatusFromPreflight(gitea))
  }, [preflightStatus])

  const handleLinearConnect = async (): Promise<void> => {
    if (!linearApiKeyDraft.trim()) {
      return
    }
    setLinearConnectState('connecting')
    setLinearConnectError(null)
    try {
      const result = await connectLinear(linearApiKeyDraft.trim())
      if (result.ok) {
        setLinearApiKeyDraft('')
        setLinearConnectState('idle')
        setLinearDialogOpen(false)
        setLinearTestResultByWorkspace({})
      } else {
        setLinearConnectState('error')
        setLinearConnectError(result.error)
      }
    } catch (error) {
      setLinearConnectState('error')
      setLinearConnectError(error instanceof Error ? error.message : copy.errors.connectionFailed)
    }
  }

  const handleLinearDisconnect = async (workspaceId?: string): Promise<void> => {
    await (workspaceId ? disconnectLinearWorkspace(workspaceId) : disconnectLinear())
    setLinearConnectState('idle')
    setLinearConnectError(null)
    setLinearTestResultByWorkspace({})
  }

  // Why: explicit user-triggered verification. This is the *only* path in
  // settings that decrypts the stored API key, so the macOS Keychain prompt
  // (if the app signature has changed since the item was stored) only
  // appears when the user clicks Test — not just for opening Settings.
  const handleLinearTest = async (workspaceId: string): Promise<void> => {
    setLinearTestingWorkspaceId(workspaceId)
    setLinearTestResultByWorkspace((prev) => {
      const next = { ...prev }
      delete next[workspaceId]
      return next
    })
    const result = await testLinearConnection(workspaceId)
    if (result.ok) {
      setLinearTestResultByWorkspace((prev) => ({
        ...prev,
        [workspaceId]: { state: 'ok' }
      }))
    } else {
      setLinearTestResultByWorkspace((prev) => ({
        ...prev,
        [workspaceId]: { state: 'error', error: result.error }
      }))
    }
    setLinearTestingWorkspaceId(null)
  }

  const handleRefreshGlab = (): void => {
    setGlabStatus('checking')
    void refreshPreflightStatus({ force: true })
  }

  const handleRefreshGh = (): void => {
    setGhStatus('checking')
    void refreshPreflightStatus({ force: true })
  }

  const handleRefreshBitbucket = (): void => {
    setBitbucketStatus('checking')
    void refreshPreflightStatus({ force: true })
  }

  const handleRefreshAzureDevOps = (): void => {
    setAzureDevOpsStatus('checking')
    void refreshPreflightStatus({ force: true })
  }

  const handleRefreshGitea = (): void => {
    setGiteaStatus('checking')
    void refreshPreflightStatus({ force: true })
  }

  return (
    <div className="space-y-3">
      {/* GitHub */}
      <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Github className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">GitHub</p>
            <p className="text-xs text-muted-foreground">
              {copy.github.description}
            </p>
          </div>
          {ghStatus === 'checking' ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : ghStatus === 'connected' ? (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {copy.status.connected}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              {ghStatus === 'not-installed' ? copy.status.notInstalled : copy.status.notAuthenticated}
            </span>
          )}
        </div>

        {ghStatus !== 'checking' && ghStatus !== 'connected' && (
          <div className="mt-3 rounded-md border border-border/30 bg-background/50 px-3 py-2.5 space-y-2">
            {ghStatus === 'not-installed' ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.github.installHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.api.shell.openUrl('https://cli.github.com')}
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.installGitHubCli}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshGh}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.github.authHelp}
                </p>
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 font-mono text-xs">
                  <Terminal className="size-3.5 shrink-0 text-muted-foreground" />
                  gh auth login
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl('https://cli.github.com/manual/gh_auth_login')
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshGh}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* GitLab */}
      <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <Gitlab className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">GitLab</p>
            <p className="text-xs text-muted-foreground">
              {copy.gitlab.description}
            </p>
          </div>
          {glabStatus === 'checking' ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : glabStatus === 'connected' ? (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {copy.status.connected}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              {glabStatus === 'not-installed'
                ? copy.status.notInstalled
                : copy.status.notAuthenticated}
            </span>
          )}
        </div>

        {glabStatus !== 'checking' && glabStatus !== 'connected' && (
          <div className="mt-3 rounded-md border border-border/30 bg-background/50 px-3 py-2.5 space-y-2">
            {glabStatus === 'not-installed' ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.gitlab.installHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl('https://gitlab.com/gitlab-org/cli#installation')
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.installGitLabCli}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshGlab}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.gitlab.authHelp}
                </p>
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 font-mono text-xs">
                  <Terminal className="size-3.5 shrink-0 text-muted-foreground" />
                  glab auth login
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl(
                        'https://gitlab.com/gitlab-org/cli/-/blob/main/docs/source/auth/login.md'
                      )
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshGlab}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bitbucket */}
      <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <GitPullRequestArrow className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">Bitbucket</p>
            <p className="text-xs text-muted-foreground">
              {bitbucketStatus === 'connected'
                ? copy.bitbucket.connectedDescription(bitbucketAccount)
                : copy.bitbucket.setupDescription}
            </p>
          </div>
          {bitbucketStatus === 'checking' ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : bitbucketStatus === 'connected' ? (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {copy.status.connected}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              {bitbucketStatus === 'not-configured'
                ? copy.status.notConfigured
                : copy.status.authFailed}
            </span>
          )}
        </div>

        {bitbucketStatus !== 'checking' && bitbucketStatus !== 'connected' && (
          <div className="mt-3 rounded-md border border-border/30 bg-background/50 px-3 py-2.5 space-y-2">
            {bitbucketStatus === 'not-configured' ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.bitbucket.configureHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl(
                        'https://support.atlassian.com/bitbucket-cloud/docs/using-api-tokens/'
                      )
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshBitbucket}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.bitbucket.authFailedHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl(
                        'https://support.atlassian.com/bitbucket-cloud/docs/using-api-tokens/'
                      )
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshBitbucket}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Azure DevOps */}
      <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <GitPullRequestArrow className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">Azure DevOps</p>
            <p className="text-xs text-muted-foreground">
              {azureDevOpsStatus === 'configured'
                ? copy.azureDevOps.configuredDescription(azureDevOpsAccount, azureDevOpsBaseUrl)
                : copy.azureDevOps.setupDescription}
            </p>
          </div>
          {azureDevOpsStatus === 'checking' ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : azureDevOpsStatus === 'configured' ? (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {azureDevOpsAccount ? copy.status.connected : copy.status.configured}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              {azureDevOpsStatus === 'not-configured'
                ? copy.status.notConfigured
                : copy.status.authFailed}
            </span>
          )}
        </div>

        {azureDevOpsStatus !== 'checking' && azureDevOpsStatus !== 'configured' && (
          <div className="mt-3 rounded-md border border-border/30 bg-background/50 px-3 py-2.5 space-y-2">
            {azureDevOpsStatus === 'not-configured' ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.azureDevOps.configureHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl(
                        'https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate'
                      )
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshAzureDevOps}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.azureDevOps.authFailedHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl(
                        'https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-requests'
                      )
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshAzureDevOps}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Gitea */}
      <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <GitPullRequestArrow className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">Gitea</p>
            <p className="text-xs text-muted-foreground">
              {giteaStatus === 'configured'
                ? copy.gitea.configuredDescription(giteaAccount, giteaBaseUrl)
                : copy.gitea.setupDescription}
            </p>
          </div>
          {giteaStatus === 'checking' ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : giteaStatus === 'configured' ? (
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              {giteaAccount ? copy.status.connected : copy.status.configured}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              {giteaStatus === 'not-configured'
                ? copy.status.optionalSetup
                : copy.status.authFailed}
            </span>
          )}
        </div>

        {giteaStatus !== 'checking' && giteaStatus !== 'configured' && (
          <div className="mt-3 rounded-md border border-border/30 bg-background/50 px-3 py-2.5 space-y-2">
            {giteaStatus === 'not-configured' ? (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.gitea.configureHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl('https://docs.gitea.com/next/development/api-usage')
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshGitea}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {copy.gitea.authFailedHelp}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.api.shell.openUrl('https://docs.gitea.com/next/development/api-usage')
                    }
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    {copy.actions.learnMore}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRefreshGitea}>
                    {copy.actions.recheck}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Linear */}
      <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <LinearIcon className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium">Linear</p>
            <p className="text-xs text-muted-foreground">
              {linearStatus.connected
                ? copy.linear.connectedDescription(linearWorkspaces.length)
                : copy.linear.description}
            </p>
          </div>
          {linearStatus.connected ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setLinearDialogOpen(true)}>
                {copy.actions.addWorkspace}
              </Button>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                {copy.status.connected}
              </span>
            </div>
          ) : (
            <button
              className="shrink-0 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setLinearDialogOpen(true)}
            >
              {copy.actions.connect}
            </button>
          )}
        </div>

        {linearStatus.connected && (
          <div className="mt-3 space-y-2">
            {linearWorkspaces.map((workspace) => {
              const testResult = linearTestResultByWorkspace[workspace.id]
              const testing = linearTestingWorkspaceId === workspace.id
              return (
                <div
                  key={workspace.id}
                  className="flex items-center gap-3 rounded-md border border-border/50 bg-background/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {workspace.organizationName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {workspace.displayName}
                      {workspace.email ? ` · ${workspace.email}` : ''}
                    </p>
                  </div>
                  {testResult?.state === 'ok' ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      {copy.linear.verified}
                    </span>
                  ) : null}
                  {testResult?.state === 'error' ? (
                    <span className="flex min-w-0 max-w-[220px] shrink items-center gap-1 truncate text-xs text-destructive">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span className="truncate">{testResult.error}</span>
                    </span>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleLinearTest(workspace.id)}
                    disabled={testing}
                  >
                    {testing ? (
                      <>
                        <LoaderCircle className="size-3.5 mr-1.5 animate-spin" />
                        {copy.actions.testing}
                      </>
                    ) : (
                      copy.actions.test
                    )}
                  </Button>
                  <button
                    onClick={() => void handleLinearDisconnect(workspace.id)}
                    aria-label={copy.linear.disconnectWorkspace(workspace.organizationName)}
                    className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
                  >
                    <Unlink className="size-3.5" />
                  </button>
                </div>
              )
            })}
            <p className="text-[11px] text-muted-foreground/70">
              {copy.linear.workspaceKeyHint}
            </p>
          </div>
        )}
      </div>

      {/* Linear Connect Dialog */}
      <Dialog
        open={linearDialogOpen}
        onOpenChange={(open) => {
          if (linearConnectState !== 'connecting') {
            setLinearDialogOpen(open)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              linearApiKeyDraft.trim() &&
              linearConnectState !== 'connecting'
            ) {
              e.preventDefault()
              void handleLinearConnect()
            }
          }}
        >
          <DialogHeader className="gap-3">
            <DialogTitle className="leading-tight">{copy.linear.dialogTitle}</DialogTitle>
            <DialogDescription>
              {copy.linear.dialogDescriptionBeforeKey}{' '}
              <strong className="font-semibold text-foreground">
                {copy.linear.personalApiKey}
              </strong>{' '}
              {copy.linear.dialogDescriptionAfterKey}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              autoFocus
              type="password"
              placeholder="lin_api_..."
              value={linearApiKeyDraft}
              onChange={(e) => {
                setLinearApiKeyDraft(e.target.value)
                if (linearConnectState === 'error') {
                  setLinearConnectState('idle')
                  setLinearConnectError(null)
                }
              }}
              disabled={linearConnectState === 'connecting'}
            />
            {linearConnectState === 'error' && linearConnectError && (
              <p className="text-xs text-destructive">{linearConnectError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {copy.linear.createOneIn}{' '}
              <button
                className="text-primary underline-offset-2 hover:underline"
                onClick={() =>
                  window.api.shell.openUrl('https://linear.app/settings/account/security')
                }
              >
                {copy.linear.settingsSecurity}
              </button>{' '}
              → <strong className="font-semibold text-foreground">{copy.linear.newApiKey}</strong>{' '}
              ({copy.linear.not} <span className="text-foreground">{copy.linear.newPasskey}</span>
              ).
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
              <Lock className="size-3 shrink-0" />
              {copy.linear.keychainHint}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLinearDialogOpen(false)}
              disabled={linearConnectState === 'connecting'}
            >
              {copy.actions.cancel}
            </Button>
            <Button
              onClick={() => void handleLinearConnect()}
              disabled={!linearApiKeyDraft.trim() || linearConnectState === 'connecting'}
            >
              {linearConnectState === 'connecting' ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {copy.actions.verifying}
                </>
              ) : (
                copy.actions.connect
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
