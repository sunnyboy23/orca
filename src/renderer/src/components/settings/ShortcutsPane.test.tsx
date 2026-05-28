import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDefaultSettings } from '../../../../shared/constants'
import { useAppStore } from '../../store'
import { zhCNMessages } from '@/i18n/zh-CN'
import { TooltipProvider } from '../ui/tooltip'
import { getShortcutsPaneSearchEntries } from './shortcuts-search'
import { ShortcutsPane } from './ShortcutsPane'
import { matchesSettingsSearch } from './settings-search'

describe('ShortcutsPane', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      language: 'zh-CN',
      userAgent: globalThis.navigator?.userAgent ?? 'Macintosh'
    })
    useAppStore.setState({
      settings: {
        ...getDefaultSettings('/tmp'),
        appLanguage: 'zh-CN'
      },
      settingsSearchQuery: '',
      keybindings: {},
      keybindingSnapshot: {
        path: '/tmp/keybindings.json',
        platform: 'darwin',
        exists: true,
        overrides: {},
        commonOverrides: {},
        platformOverrides: {},
        diagnostics: []
      },
      updateSettings: vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders high-impact shortcut configuration copy in Chinese', () => {
    useAppStore.setState({
      settings: {
        ...getDefaultSettings('/tmp'),
        appLanguage: 'zh-CN'
      }
    })

    const markup = renderToStaticMarkup(
      <TooltipProvider>
        <ShortcutsPane />
      </TooltipProvider>
    )

    expect(markup).toContain('键盘快捷键')
    expect(markup).toContain('终端里的快捷键')
    expect(markup).toContain('最近标签页顺序')
    expect(markup).toContain('在 Orca 中编辑')
    expect(markup).toContain('全局')
    expect(markup).toContain('跳转到文件')
    expect(markup).toContain('修改快捷键')
    expect(markup).toContain('未设置')
  })

  it('supports Chinese shortcut search metadata', () => {
    const entries = getShortcutsPaneSearchEntries(zhCNMessages.settingsPanes.shortcuts)

    expect(entries.some((entry) => entry.title === '跳转到文件')).toBe(true)
    expect(entries.some((entry) => entry.title === '终端里的快捷键')).toBe(true)
    expect(matchesSettingsSearch('浮动终端', entries)).toBe(true)
  })
})
