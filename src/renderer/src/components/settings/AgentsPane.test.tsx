import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDefaultSettings } from '../../../../shared/constants'
import type { GlobalSettings } from '../../../../shared/types'
import { useAppStore } from '../../store'
import { getAgentAwakeDescription } from './agent-awake-copy'
import { AgentsPane, AGENTS_PANE_SEARCH_ENTRIES } from './AgentsPane'
import { getAgentsPaneSearchEntries } from './agents-search'
import { matchesSettingsSearch } from './settings-search'
import { agentsZhCN } from '@/i18n/settings-agents-zh-CN'

function renderPane(settings: GlobalSettings): string {
  return renderToStaticMarkup(
    React.createElement(AgentsPane, {
      settings,
      updateSettings: vi.fn()
    })
  )
}

describe('AgentsPane', () => {
  beforeEach(() => {
    useAppStore.setState({
      settingsSearchQuery: '',
      detectedAgentIds: ['claude'],
      isDetectingAgents: false,
      isRefreshingAgents: false
    })
  })

  it('renders the keep-awake toggle from settings', () => {
    const markup = renderPane(getDefaultSettings('/tmp'))

    expect(markup).toContain('Keep computer awake while agents are working')
    expect(markup).toContain(
      'Keeps this computer and display awake while agents are working. Orca also asks this device to stay awake when the lid is closed, subject to its power policy.'
    )
    expect(markup).toContain('aria-checked="false"')
  })

  it('describes Windows lid behavior according to the device', () => {
    expect(getAgentAwakeDescription(undefined, 'Windows')).toBe(
      "Keeps this computer and display awake while agents are working. Lid-close behavior follows this device's power settings."
    )
  })

  it('reflects the keep-awake switch state and label', () => {
    const updateSettings = vi.fn()
    const markup = renderToStaticMarkup(
      <AgentsPane
        settings={{
          ...getDefaultSettings('/tmp'),
          keepComputerAwakeWhileAgentsRun: true
        }}
        updateSettings={updateSettings}
      />
    )

    expect(markup).toContain('aria-label="Keep computer awake while agents are working"')
    expect(markup).toContain('aria-checked="true"')
    expect(updateSettings).not.toHaveBeenCalled()
  })

  it('includes awake and sleep search metadata for the setting', () => {
    expect(matchesSettingsSearch('awake', AGENTS_PANE_SEARCH_ENTRIES)).toBe(true)
    expect(matchesSettingsSearch('sleep', AGENTS_PANE_SEARCH_ENTRIES)).toBe(true)
    expect(matchesSettingsSearch('lid', AGENTS_PANE_SEARCH_ENTRIES)).toBe(true)
  })

  it('supports Chinese search metadata', () => {
    const entries = getAgentsPaneSearchEntries(agentsZhCN)

    expect(entries.some((entry) => entry.title === '默认 Agent')).toBe(true)
    expect(matchesSettingsSearch('保持电脑唤醒', entries)).toBe(true)
  })
})
