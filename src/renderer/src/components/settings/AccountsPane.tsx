/* eslint-disable max-lines -- Why: AccountsPane owns all per-provider account UI
   (Claude, Codex, Gemini, OpenCode Go, and future providers). Each provider's
   add/select/reauth/remove flow is tightly coupled to the provider-specific
   error handling and restart prompts below; splitting them into separate files
   would scatter those flows without a meaningful abstraction boundary. */
import { useEffect, useState } from 'react'
import type {
  ClaudeRateLimitAccountsState,
  CodexRateLimitAccountsState,
  GlobalSettings
} from '../../../../shared/types'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store'
import { ClaudeIcon, GeminiIcon, OpenAIIcon, OpenCodeGoIcon } from '../status-bar/icons'
import { toast } from 'sonner'
import {
  ACCOUNTS_PANE_SEARCH_ENTRIES,
  getAccountsClaudeSearchEntries,
  getAccountsCodexSearchEntries,
  getAccountsGeminiSearchEntries,
  getAccountsOpenCodeSearchEntries
} from './accounts-search'
import { SearchableSetting } from './SearchableSetting'
import { matchesSettingsSearch } from './settings-search'
import { markLiveCodexSessionsForRestart } from '@/lib/codex-session-restart'
import { getLocalPreflightContext } from '@/lib/local-preflight-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { useI18n } from '@/i18n'

export { ACCOUNTS_PANE_SEARCH_ENTRIES }

type AccountsPaneProps = {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void
}

function getCodexAccountLabel(
  state: CodexRateLimitAccountsState,
  accountId: string | null | undefined,
  fallback: string
): string {
  if (accountId == null) {
    return fallback
  }
  return state.accounts.find((account) => account.id === accountId)?.email ?? fallback
}

function getClaudeAccountLabel(
  state: ClaudeRateLimitAccountsState,
  accountId: string | null | undefined,
  fallback: string
): string {
  if (accountId == null) {
    return fallback
  }
  return state.accounts.find((account) => account.id === accountId)?.email ?? fallback
}

function getCodexAccountErrorDescription(
  error: unknown,
  copy: ReturnType<typeof useI18n>['messages']['settingsPanes']['accounts']
): string {
  const message = String((error as Error)?.message ?? error)
    .replace(/^Error occurred in handler for 'codexAccounts:[^']+':\s*/i, '')
    .replace(/^Error invoking remote method 'codexAccounts:[^']+':\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .trim()
  const normalizedMessage = message.toLowerCase()

  // Why: Codex account actions cross the Electron IPC boundary, and invoke()
  // failures often include transport-level wrapper text that is useful in
  // devtools but noisy in product UI. Normalize the handful of expected auth
  // failures here so users see actionable sign-in guidance instead of IPC
  // internals or raw upstream wording.
  if (normalizedMessage.includes('timed out waiting for codex login to finish')) {
    return copy.errors.codexSignInTimeout
  }
  if (normalizedMessage.includes('codex sign-in took too long to finish')) {
    return copy.errors.codexSignInTimeout
  }
  if (
    normalizedMessage.includes('auth error 502') ||
    normalizedMessage.includes('gateway') ||
    normalizedMessage.includes('bad gateway')
  ) {
    return copy.errors.codexUnavailable
  }
  if (normalizedMessage.startsWith('codex login failed:')) {
    const loginMessage = message.slice('Codex login failed:'.length).trim()
    return loginMessage || copy.errors.codexSignInFailed
  }

  return message || copy.errors.codexSignInFailed
}

function getClaudeAccountErrorDescription(
  error: unknown,
  fallback: string
): string {
  return (
    String((error as Error)?.message ?? error)
      .replace(/^Error occurred in handler for 'claudeAccounts:[^']+':\s*/i, '')
      .replace(/^Error invoking remote method 'claudeAccounts:[^']+':\s*/i, '')
      .replace(/^Error:\s*/i, '')
      .trim() || fallback
  )
}

export function AccountsPane({ settings, updateSettings }: AccountsPaneProps): React.JSX.Element {
  const { messages } = useI18n()
  const copy = messages.settingsPanes.accounts
  const searchQuery = useAppStore((s) => s.settingsSearchQuery)
  const fetchSettings = useAppStore((s) => s.fetchSettings)
  const localPreflightContext = useAppStore(getLocalPreflightContext)
  const activeWslDistro = localPreflightContext?.wslDistro?.trim() || null

  const [codexAccounts, setCodexAccounts] = useState<CodexRateLimitAccountsState>({
    accounts: [],
    activeAccountId: null
  })
  const [codexAction, setCodexAction] = useState<
    'idle' | 'adding' | `reauth:${string}` | `remove:${string}` | `select:${string | 'system'}`
  >('idle')
  const [claudeAccounts, setClaudeAccounts] = useState<ClaudeRateLimitAccountsState>({
    accounts: [],
    activeAccountId: null
  })
  const [claudeAction, setClaudeAction] = useState<
    'idle' | 'adding' | `reauth:${string}` | `remove:${string}` | `select:${string | 'system'}`
  >('idle')
  const [removeAccountId, setRemoveAccountId] = useState<string | null>(null)
  const [removeClaudeAccountId, setRemoveClaudeAccountId] = useState<string | null>(null)
  const claudeSearchEntries = getAccountsClaudeSearchEntries(copy)
  const codexSearchEntries = getAccountsCodexSearchEntries(copy)
  const geminiSearchEntries = getAccountsGeminiSearchEntries(copy)
  const openCodeSearchEntries = getAccountsOpenCodeSearchEntries(copy)

  useEffect(() => {
    let stale = false

    const loadCodexAccounts = async (): Promise<void> => {
      try {
        const nextCodex = await window.api.codexAccounts.list()
        if (!stale) {
          setCodexAccounts(nextCodex)
        }
      } catch (error) {
        if (!stale) {
          toast.error(copy.toasts.codexLoadFailed, {
            description: String((error as Error)?.message ?? error)
          })
        }
      }
    }

    const loadClaudeAccounts = async (): Promise<void> => {
      try {
        const nextClaude = await window.api.claudeAccounts.list()
        if (!stale) {
          setClaudeAccounts(nextClaude)
        }
      } catch (error) {
        if (!stale) {
          toast.error(copy.toasts.claudeLoadFailed, {
            description: String((error as Error)?.message ?? error)
          })
        }
      }
    }

    void loadCodexAccounts()
    void loadClaudeAccounts()

    return () => {
      stale = true
    }
  }, [copy.toasts.claudeLoadFailed, copy.toasts.codexLoadFailed])

  const syncCodexAccounts = async (next: CodexRateLimitAccountsState): Promise<void> => {
    setCodexAccounts(next)
    await fetchSettings()
  }

  const syncClaudeAccounts = async (next: ClaudeRateLimitAccountsState): Promise<void> => {
    setClaudeAccounts(next)
    await fetchSettings()
  }

  const formatAccountTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const runCodexAccountAction = async (
    action: typeof codexAction,
    operation: () => Promise<CodexRateLimitAccountsState>
  ): Promise<void> => {
    const previousActiveAccountId = codexAccounts.activeAccountId
    setCodexAction(action)
    try {
      const next = await operation()
      await syncCodexAccounts(next)
      const shouldPromptRestart =
        action === 'adding' ||
        (action.startsWith('select:') && previousActiveAccountId !== next.activeAccountId) ||
        (action.startsWith('reauth:') &&
          next.activeAccountId !== null &&
          action === `reauth:${next.activeAccountId}`) ||
        (action.startsWith('remove:') && previousActiveAccountId !== next.activeAccountId)
      if (shouldPromptRestart) {
        void markLiveCodexSessionsForRestart({
          previousAccountLabel: getCodexAccountLabel(
            codexAccounts,
            previousActiveAccountId,
            copy.common.systemDefault
          ),
          nextAccountLabel: getCodexAccountLabel(
            next,
            next.activeAccountId,
            copy.common.codexAccount
          )
        })
      }
    } catch (error) {
      toast.error(copy.toasts.codexUpdateFailed, {
        description: getCodexAccountErrorDescription(error, copy)
      })
    } finally {
      setCodexAction('idle')
    }
  }

  const runClaudeAccountAction = async (
    action: typeof claudeAction,
    operation: () => Promise<ClaudeRateLimitAccountsState>
  ): Promise<void> => {
    const previousActiveAccountId = claudeAccounts.activeAccountId
    setClaudeAction(action)
    try {
      const next = await operation()
      await syncClaudeAccounts(next)
      if (previousActiveAccountId !== next.activeAccountId || action === 'adding') {
        toast.info(copy.toasts.claudeUpdated, {
          description: copy.toasts.claudeRestartDescription(
            getClaudeAccountLabel(claudeAccounts, previousActiveAccountId, copy.common.systemDefault),
            getClaudeAccountLabel(next, next.activeAccountId, copy.common.claudeAccount)
          )
        })
      }
    } catch (error) {
      toast.error(copy.toasts.claudeUpdateFailed, {
        description: getClaudeAccountErrorDescription(error, copy.errors.claudeSignInFailed)
      })
    } finally {
      setClaudeAction('idle')
    }
  }

  const visibleSections = [
    matchesSettingsSearch(searchQuery, claudeSearchEntries) ? (
      <section key="claude-accounts" id="accounts-claude" className="space-y-4 scroll-mt-6">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ClaudeIcon size={16} />
            Claude
          </h3>
          <p className="text-xs text-muted-foreground">
            {copy.claude.sectionDescription}
          </p>
        </div>

        <SearchableSetting
          title={copy.search.claude.title}
          description={copy.claude.settingDescription}
          keywords={copy.search.claude.keywords}
          className="space-y-3 py-2"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label>{copy.common.accounts}</Label>
              <p className="text-xs text-muted-foreground">{copy.claude.rowDescription}</p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() =>
                void runClaudeAccountAction('adding', () => window.api.claudeAccounts.add())
              }
              disabled={claudeAction !== 'idle'}
              className="gap-1.5"
            >
              {claudeAction === 'adding' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Plus className="size-3" />
              )}
              {copy.common.addAccount}
            </Button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                void runClaudeAccountAction('select:system', () =>
                  window.api.claudeAccounts.select({ accountId: null })
                )
              }
              disabled={claudeAction !== 'idle'}
              className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                claudeAccounts.activeAccountId === null
                  ? 'border-foreground/20 bg-accent/15'
                  : 'border-border/70 hover:border-border hover:bg-accent/8'
              }`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium">{copy.common.systemDefault}</span>
                  {claudeAccounts.activeAccountId === null ? (
                    <Badge
                      variant="outline"
                      className="h-4 shrink-0 rounded px-1.5 text-[10px] font-medium leading-none text-foreground/80"
                    >
                      {copy.common.active}
                    </Badge>
                  ) : null}
                </div>
                <span className="truncate text-[11px] text-muted-foreground">
                  {copy.claude.systemDefaultDescription}
                </span>
              </div>
            </button>
            {claudeAccounts.accounts.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/70 px-3 py-4 text-xs text-muted-foreground">
                {copy.claude.empty}
              </div>
            ) : (
              claudeAccounts.accounts.map((account) => {
                const isActive = claudeAccounts.activeAccountId === account.id
                const isReauthing = claudeAction === `reauth:${account.id}`
                const isBusy = claudeAction !== 'idle'

                return (
                  <div
                    key={account.id}
                    className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'border-foreground/20 bg-accent/15'
                        : 'border-border/70 hover:border-border hover:bg-accent/8'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-3 max-md:flex-col max-md:items-start">
                      <button
                        type="button"
                        onClick={() =>
                          void runClaudeAccountAction(`select:${account.id}`, () =>
                            window.api.claudeAccounts.select({ accountId: account.id })
                          )
                        }
                        disabled={isBusy}
                        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left disabled:cursor-default"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium">{account.email}</span>
                          {isActive ? (
                            <Badge
                              variant="outline"
                              className="h-4 shrink-0 rounded px-1.5 text-[10px] font-medium leading-none text-foreground/80"
                            >
                              {copy.common.active}
                            </Badge>
                          ) : null}
                        </div>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {account.organizationName
                            ? `${account.organizationName} · ${formatAccountTimestamp(account.lastAuthenticatedAt)}`
                            : formatAccountTimestamp(account.lastAuthenticatedAt)}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center justify-end gap-1 max-md:w-full max-md:flex-wrap">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(event) => {
                            event.stopPropagation()
                            void runClaudeAccountAction(`reauth:${account.id}`, () =>
                              window.api.claudeAccounts.reauthenticate({ accountId: account.id })
                            )
                          }}
                          disabled={isBusy}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                        >
                          {isReauthing ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <RefreshCw className="size-3" />
                          )}
                          {copy.common.reauthenticate}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(event) => {
                            event.stopPropagation()
                            setRemoveClaudeAccountId(account.id)
                          }}
                          disabled={isBusy}
                          className="h-6 px-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3" />
                          {copy.common.remove}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SearchableSetting>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, codexSearchEntries) ? (
      <section key="codex-accounts" id="accounts-codex" className="space-y-4 scroll-mt-6">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <OpenAIIcon size={16} />
            Codex
          </h3>
          <p className="text-xs text-muted-foreground">
            {copy.codex.sectionDescription}
          </p>
          {activeWslDistro ? (
            <p className="text-xs text-muted-foreground">
              {copy.codex.wslDescription(activeWslDistro)}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {copy.codex.localAuthDescription}
          </p>
        </div>

        <SearchableSetting
          title={copy.search.codex.title}
          description={copy.codex.settingDescription}
          // Why: this single SearchableSetting backs the whole Codex section,
          // including the "Active Codex Account" sub-control (account picker
          // below). Roll every Codex search entry's title/description/keywords
          // into one haystack so a search for "Active Codex Account" doesn't
          // render the section header with no body underneath it.
          keywords={codexSearchEntries.flatMap((entry) => [
            entry.title,
            entry.description ?? '',
            ...(entry.keywords ?? [])
          ])}
          className="space-y-3 py-2"
        >
          {/* Why: Settings deep-links can target this subsection directly from
          the status-bar account switcher. Keeping a stable DOM anchor here
          avoids dumping the user at the top of Accounts and making them hunt
          for the actual Codex account controls. */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label>{copy.common.accounts}</Label>
              <p className="text-xs text-muted-foreground">
                {copy.codex.rowDescription(activeWslDistro)}
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() =>
                void runCodexAccountAction('adding', () => window.api.codexAccounts.add())
              }
              disabled={codexAction !== 'idle'}
              className="gap-1.5"
            >
              {codexAction === 'adding' ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Plus className="size-3" />
              )}
              {copy.common.addAccount}
            </Button>
          </div>

          {codexAccounts.accounts.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/70 px-3 py-4 text-xs text-muted-foreground">
              {copy.codex.empty(activeWslDistro)}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  void runCodexAccountAction('select:system', () =>
                    window.api.codexAccounts.select({ accountId: null })
                  )
                }
                disabled={codexAction !== 'idle'}
                className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                  codexAccounts.activeAccountId === null
                    ? 'border-foreground/20 bg-accent/15'
                    : 'border-border/70 hover:border-border hover:bg-accent/8'
                } disabled:cursor-default disabled:opacity-100`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium">{copy.common.systemDefault}</span>
                    {codexAccounts.activeAccountId === null ? (
                      <Badge
                        variant="outline"
                        className="h-4 shrink-0 rounded px-1.5 text-[10px] font-medium leading-none text-foreground/80"
                      >
                        {copy.common.active}
                      </Badge>
                    ) : null}
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {copy.codex.systemDefaultDescription}
                  </span>
                </div>
              </button>
              {codexAccounts.accounts.map((account) => {
                const isActive = codexAccounts.activeAccountId === account.id
                const isReauthing = codexAction === `reauth:${account.id}`
                const isRemoving = codexAction === `remove:${account.id}`
                const isBusy = codexAction !== 'idle'

                return (
                  <div
                    key={account.id}
                    className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'border-foreground/20 bg-accent/15'
                        : 'border-border/70 hover:border-border hover:bg-accent/8'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-3 max-md:flex-col max-md:items-start">
                      <button
                        type="button"
                        onClick={() =>
                          void runCodexAccountAction(`select:${account.id}`, () =>
                            window.api.codexAccounts.select({ accountId: account.id })
                          )
                        }
                        disabled={isBusy}
                        className="flex min-w-0 flex-1 flex-col gap-0.5 text-left disabled:cursor-default"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium">{account.email}</span>
                          {isActive ? (
                            <Badge
                              variant="outline"
                              className="h-4 shrink-0 rounded px-1.5 text-[10px] font-medium leading-none text-foreground/80"
                            >
                              {copy.common.active}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground max-sm:flex-wrap">
                          {account.workspaceLabel ? (
                            <span className="truncate">{account.workspaceLabel}</span>
                          ) : null}
                          {account.workspaceLabel ? (
                            <span className="shrink-0 opacity-50">•</span>
                          ) : null}
                          <span className="shrink-0">
                            {formatAccountTimestamp(account.lastAuthenticatedAt)}
                          </span>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center justify-end gap-1 max-md:w-full max-md:flex-wrap">
                        {/* Why: selecting an account is the primary action in this row.
                        Keeping maintenance actions visually lighter prevents re-auth/remove
                        controls from overpowering the selection affordance in a dense list. */}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(event) => {
                            event.stopPropagation()
                            void runCodexAccountAction(`reauth:${account.id}`, () =>
                              window.api.codexAccounts.reauthenticate({ accountId: account.id })
                            )
                          }}
                          disabled={isBusy}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                        >
                          {isReauthing ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <RefreshCw className="size-3" />
                          )}
                          {copy.common.reauthenticate}
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(event) => {
                            event.stopPropagation()
                            setRemoveAccountId(account.id)
                          }}
                          disabled={isBusy}
                          className="h-6 px-2 text-muted-foreground hover:text-destructive"
                        >
                          {isRemoving ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          {copy.common.remove}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </SearchableSetting>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, geminiSearchEntries) ? (
      <section key="gemini" id="accounts-gemini" className="space-y-4 scroll-mt-6">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <GeminiIcon size={16} />
            Gemini
          </h3>
          <p className="text-xs text-muted-foreground">{copy.gemini.sectionDescription}</p>
        </div>

        <SearchableSetting
          title={copy.gemini.title}
          description={copy.gemini.description}
          keywords={copy.search.gemini.keywords}
          className="flex items-center justify-between gap-4 py-2"
        >
          <div className="space-y-0.5">
            <Label>{copy.gemini.titleWithExperiment}</Label>
            <p className="text-xs text-muted-foreground">{copy.gemini.description}</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.geminiCliOAuthEnabled}
            onClick={() =>
              updateSettings({
                geminiCliOAuthEnabled: !settings.geminiCliOAuthEnabled
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors ${
              settings.geminiCliOAuthEnabled ? 'bg-foreground' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`pointer-events-none block size-3.5 rounded-full bg-background shadow-sm transition-transform ${
                settings.geminiCliOAuthEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </SearchableSetting>
      </section>
    ) : null,
    matchesSettingsSearch(searchQuery, openCodeSearchEntries) ? (
      <section key="opencode-go" id="accounts-opencode-go" className="space-y-4 scroll-mt-6">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <OpenCodeGoIcon size={16} />
            OpenCode Go
          </h3>
          <p className="text-xs text-muted-foreground">{copy.opencode.sectionDescription}</p>
        </div>

        <SearchableSetting
          title={copy.opencode.cookieTitle}
          description={copy.opencode.cookieDescription}
          keywords={copy.search.opencodeCookie.keywords}
          className="space-y-2"
        >
          <Label>{copy.opencode.cookieLabel}</Label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={settings.opencodeSessionCookie}
              onChange={(e) => updateSettings({ opencodeSessionCookie: e.target.value })}
              placeholder={copy.opencode.cookiePlaceholder}
              spellCheck={false}
              className="flex-1 text-xs"
            />
            {settings.opencodeSessionCookie && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => updateSettings({ opencodeSessionCookie: '' })}
                className="h-7 shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {copy.common.clear}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {copy.opencode.cookieHelp}
          </p>
        </SearchableSetting>

        <SearchableSetting
          title={copy.opencode.workspaceTitle}
          description={copy.opencode.workspaceDescription}
          keywords={copy.search.opencodeWorkspace.keywords}
          className="space-y-2"
        >
          <Label>{copy.opencode.workspaceLabel}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={settings.opencodeWorkspaceId}
              onChange={(e) => updateSettings({ opencodeWorkspaceId: e.target.value })}
              placeholder={copy.opencode.workspacePlaceholder}
              spellCheck={false}
              className="flex-1 text-xs"
            />
            {settings.opencodeWorkspaceId && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => updateSettings({ opencodeWorkspaceId: '' })}
                className="h-7 shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {copy.common.clear}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {copy.opencode.workspaceHelp}
          </p>
        </SearchableSetting>
      </section>
    ) : null
  ].filter(Boolean)

  return (
    <div className="space-y-8">
      <Dialog
        open={removeAccountId !== null}
        onOpenChange={(open) => !open && setRemoveAccountId(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{copy.codex.removeDialogTitle}</DialogTitle>
            <DialogDescription>
              {copy.codex.removeDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveAccountId(null)}>
              {copy.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const accountId = removeAccountId
                if (!accountId) {
                  return
                }
                setRemoveAccountId(null)
                void runCodexAccountAction(`remove:${accountId}`, () =>
                  window.api.codexAccounts.remove({ accountId })
                )
              }}
            >
              {copy.common.removeAccount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={removeClaudeAccountId !== null}
        onOpenChange={(open) => !open && setRemoveClaudeAccountId(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{copy.claude.removeDialogTitle}</DialogTitle>
            <DialogDescription>
              {copy.claude.removeDialogDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveClaudeAccountId(null)}>
              {copy.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const accountId = removeClaudeAccountId
                if (!accountId) {
                  return
                }
                setRemoveClaudeAccountId(null)
                void runClaudeAccountAction(`remove:${accountId}`, () =>
                  window.api.claudeAccounts.remove({ accountId })
                )
              }}
            >
              {copy.common.removeAccount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {visibleSections.map((section, index) => (
        <div key={index} className="space-y-8">
          {index > 0 ? <Separator /> : null}
          {section}
        </div>
      ))}
    </div>
  )
}
