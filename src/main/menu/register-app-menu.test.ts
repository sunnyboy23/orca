import { beforeEach, describe, expect, it, vi } from 'vitest'

const { buildFromTemplateMock, setApplicationMenuMock, getFocusedWindowMock } = vi.hoisted(() => ({
  buildFromTemplateMock: vi.fn(),
  setApplicationMenuMock: vi.fn(),
  getFocusedWindowMock: vi.fn()
}))

vi.mock('electron', () => ({
  BrowserWindow: {
    getFocusedWindow: getFocusedWindowMock
  },
  Menu: {
    buildFromTemplate: buildFromTemplateMock,
    setApplicationMenu: setApplicationMenuMock
  },
  app: {
    name: 'Orca',
    getLocale: () => 'en-US'
  }
}))

import {
  getNextDefaultOnAppearanceSettingValue,
  registerAppMenu,
  type RegisterAppMenuOptions
} from './register-app-menu'

const isMac = process.platform === 'darwin'

function buildMenuOptions(): RegisterAppMenuOptions & {
  onCheckForUpdates: ReturnType<typeof vi.fn<RegisterAppMenuOptions['onCheckForUpdates']>>
  onOpenSettings: ReturnType<typeof vi.fn<RegisterAppMenuOptions['onOpenSettings']>>
  onOpenFeatureTour: ReturnType<typeof vi.fn<RegisterAppMenuOptions['onOpenFeatureTour']>>
  onOpenCrashReport: ReturnType<typeof vi.fn<RegisterAppMenuOptions['onOpenCrashReport']>>
  onBeforeReload: ReturnType<typeof vi.fn<NonNullable<RegisterAppMenuOptions['onBeforeReload']>>>
  onToggleAppearance: ReturnType<typeof vi.fn<RegisterAppMenuOptions['onToggleAppearance']>>
  getAppearanceState: ReturnType<typeof vi.fn<RegisterAppMenuOptions['getAppearanceState']>>
} {
  return {
    onCheckForUpdates: vi.fn<RegisterAppMenuOptions['onCheckForUpdates']>(),
    onOpenSettings: vi.fn<RegisterAppMenuOptions['onOpenSettings']>(),
    onOpenFeatureTour: vi.fn<RegisterAppMenuOptions['onOpenFeatureTour']>(),
    onOpenCrashReport: vi.fn<RegisterAppMenuOptions['onOpenCrashReport']>(),
    onBeforeReload: vi.fn<NonNullable<RegisterAppMenuOptions['onBeforeReload']>>(),
    onZoomIn: vi.fn<RegisterAppMenuOptions['onZoomIn']>(),
    onZoomOut: vi.fn<RegisterAppMenuOptions['onZoomOut']>(),
    onZoomReset: vi.fn<RegisterAppMenuOptions['onZoomReset']>(),
    onToggleLeftSidebar: vi.fn<RegisterAppMenuOptions['onToggleLeftSidebar']>(),
    onToggleRightSidebar: vi.fn<RegisterAppMenuOptions['onToggleRightSidebar']>(),
    onToggleAppearance: vi.fn<RegisterAppMenuOptions['onToggleAppearance']>(),
    getAppearanceState: vi.fn<RegisterAppMenuOptions['getAppearanceState']>(() => ({
      showTasksButton: true,
      showMobileButton: true,
      showTitlebarAppName: true,
      statusBarVisible: true
    }))
  }
}

function getTemplate(): Electron.MenuItemConstructorOptions[] {
  return buildFromTemplateMock.mock.calls[0][0] as Electron.MenuItemConstructorOptions[]
}

function getSubmenu(
  template: Electron.MenuItemConstructorOptions[],
  label: string
): Electron.MenuItemConstructorOptions[] {
  const item = template.find((entry) => entry.label === label)
  return (item?.submenu ?? []) as Electron.MenuItemConstructorOptions[]
}

function englishLabels() {
  return {
    checkForUpdates: 'Check for Updates...',
    settings: `Settings\t${isMac ? '⌘,' : 'Ctrl+,'}`,
    exploreOrca: 'Explore Orca',
    reportCrash: 'Report Crash...',
    exportPdf: `Export as PDF...\t${isMac ? '⌘⇧E' : 'Ctrl+Shift+E'}`,
    file: 'File',
    exit: 'Exit',
    appearance: 'Appearance',
    showTasksButton: 'Show Tasks Button',
    showMobileButton: 'Show Orca Mobile Button',
    showTitlebarAppName: 'Show Titlebar App Name',
    showStatusBar: 'Show Status Bar',
    view: 'View',
    reload: 'Reload',
    forceReload: `Force Reload\t${isMac ? '⌘⇧R' : 'Ctrl+Shift+R'}`,
    toggleLeftSidebar: `Toggle Left Sidebar\t${isMac ? '⌘B' : 'Ctrl+B'}`,
    toggleRightSidebar: `Toggle Right Sidebar\t${isMac ? '⌘L' : 'Ctrl+L'}`,
    openWorktreePalette: `Open Worktree Palette\t${isMac ? '⌘J' : 'Ctrl+Shift+J'}`,
    help: 'Help'
  }
}

describe('registerAppMenu', () => {
  it('toggles missing default-on appearance settings from visible to hidden', () => {
    expect(getNextDefaultOnAppearanceSettingValue(undefined)).toBe(false)
    expect(getNextDefaultOnAppearanceSettingValue(true)).toBe(false)
    expect(getNextDefaultOnAppearanceSettingValue(false)).toBe(true)
  })

  beforeEach(() => {
    buildFromTemplateMock.mockReset()
    setApplicationMenuMock.mockReset()
    getFocusedWindowMock.mockReset()
    buildFromTemplateMock.mockImplementation((template) => ({ template }))
  })

  it('shows reload shortcuts as policy-routed menu hints', () => {
    registerAppMenu(buildMenuOptions())

    expect(buildFromTemplateMock).toHaveBeenCalledTimes(1)
    const viewSubmenu = getSubmenu(getTemplate(), englishLabels().view)

    expect(viewSubmenu).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: englishLabels().reload })])
    )

    const reloadItem = viewSubmenu.find((item) => item.label === englishLabels().reload)
    expect(reloadItem?.accelerator).toBeUndefined()
    const forceReloadItem = viewSubmenu.find((item) => item.label === englishLabels().forceReload)
    expect(forceReloadItem).toBeDefined()
    expect(forceReloadItem?.accelerator).toBeUndefined()
  })

  it('reloads the focused window from the view menu', () => {
    const reloadMock = vi.fn()
    const reloadIgnoringCacheMock = vi.fn()
    const options = buildMenuOptions()
    options.onBeforeReload = vi.fn()
    getFocusedWindowMock.mockReturnValue({
      webContents: {
        id: 101,
        reload: reloadMock,
        reloadIgnoringCache: reloadIgnoringCacheMock
      }
    })

    registerAppMenu(options)

    const reloadItem = getSubmenu(getTemplate(), englishLabels().view).find(
      (item) => item.label === englishLabels().reload
    )
    reloadItem?.click?.({} as never, {} as never, {} as never)

    expect(reloadMock).toHaveBeenCalledTimes(1)
    expect(reloadIgnoringCacheMock).not.toHaveBeenCalled()
    expect(options.onBeforeReload).toHaveBeenCalledWith({ ignoreCache: false, webContentsId: 101 })
  })

  it('force reloads the focused window from the view menu', () => {
    const reloadMock = vi.fn()
    const reloadIgnoringCacheMock = vi.fn()
    const options = buildMenuOptions()
    options.onBeforeReload = vi.fn()
    getFocusedWindowMock.mockReturnValue({
      webContents: {
        id: 102,
        reload: reloadMock,
        reloadIgnoringCache: reloadIgnoringCacheMock
      }
    })

    registerAppMenu(options)

    const forceReloadItem = getSubmenu(getTemplate(), englishLabels().view).find(
      (item) => item.label === englishLabels().forceReload
    )
    forceReloadItem?.click?.({} as never, {} as never, {} as never)

    expect(reloadIgnoringCacheMock).toHaveBeenCalledTimes(1)
    expect(reloadMock).not.toHaveBeenCalled()
    expect(options.onBeforeReload).toHaveBeenCalledWith({ ignoreCache: true, webContentsId: 102 })
  })

  it('includes prereleases when Check for Updates is clicked with shift held', () => {
    const options = buildMenuOptions()
    registerAppMenu(options)

    // Why: Check for Updates lives under the app-name menu on macOS and
    // under Help on Windows/Linux. The click behavior must be identical
    // either way.
    const parentLabel = isMac ? 'Orca' : 'Help'
    const item = getSubmenu(getTemplate(), parentLabel).find(
      (entry) => entry.label === englishLabels().checkForUpdates
    )

    item?.click?.({} as never, undefined as never, { shiftKey: true } as Electron.KeyboardEvent)
    item?.click?.(
      {} as never,
      undefined as never,
      { metaKey: true, shiftKey: true } as Electron.KeyboardEvent
    )
    item?.click?.({} as never, undefined as never, {} as Electron.KeyboardEvent)
    item?.click?.({} as never, undefined as never, { metaKey: true } as Electron.KeyboardEvent)

    expect(options.onCheckForUpdates.mock.calls).toEqual([
      [{ includePrerelease: true }],
      [{ includePrerelease: true }],
      [{ includePrerelease: false }],
      [{ includePrerelease: false }]
    ])
  })

  it('shows the worktree palette shortcut as a display-only menu hint', () => {
    registerAppMenu(buildMenuOptions())

    const viewSubmenu = getSubmenu(getTemplate(), englishLabels().view)
    const paletteItem = viewSubmenu.find(
      (item) => item.label === englishLabels().openWorktreePalette
    )

    expect(paletteItem).toBeDefined()
    expect(paletteItem?.accelerator).toBeUndefined()
  })

  it.runIf(!isMac)('puts Settings and Exit under File on Windows/Linux', () => {
    registerAppMenu(buildMenuOptions())

    const template = getTemplate()
    // Why: no redundant app-named "Orca" menu should exist on non-mac — the
    // app-menu contents (Settings, Exit, Check for Updates, About) have been
    // redistributed so users see them in File / Help instead.
    expect(template.find((item) => item.label === 'Orca')).toBeUndefined()

    const fileLabels = getSubmenu(template, englishLabels().file).map((item) => item.label)
    expect(fileLabels).toEqual(
      expect.arrayContaining([
        englishLabels().exportPdf,
        englishLabels().settings,
        englishLabels().exit
      ])
    )

    const helpLabels = getSubmenu(template, englishLabels().help).map((item) => item.label)
    expect(helpLabels).toEqual(
      expect.arrayContaining([
        englishLabels().reportCrash,
        englishLabels().exploreOrca,
        englishLabels().checkForUpdates
      ])
    )
  })

  it('uses Chinese labels when the app language is Chinese', () => {
    const options = buildMenuOptions()
    options.getAppLanguage = vi.fn<NonNullable<RegisterAppMenuOptions['getAppLanguage']>>(
      () => 'zh-CN'
    )
    registerAppMenu(options)

    const template = getTemplate()
    const fileLabels = getSubmenu(template, '文件').map((item) => item.label)
    const viewLabels = getSubmenu(template, '视图').map((item) => item.label)
    const helpLabels = getSubmenu(template, '帮助').map((item) => item.label)
    const appearanceSubmenu = (getSubmenu(template, '视图').find((item) => item.label === '外观')
      ?.submenu ?? []) as Electron.MenuItemConstructorOptions[]

    expect(fileLabels).toContain(`导出为 PDF...\t${isMac ? '⌘⇧E' : 'Ctrl+Shift+E'}`)
    expect(viewLabels).toEqual(expect.arrayContaining(['重新加载', '外观']))
    expect(appearanceSubmenu.map((item) => item.label)).toEqual(
      expect.arrayContaining(['显示状态栏', '显示任务按钮', '显示 Orca Mobile 按钮'])
    )
    expect(helpLabels).toEqual(expect.arrayContaining(['报告崩溃...', '了解 Orca']))
  })

  it.runIf(isMac)('keeps the macOS app-named menu with Settings and quit roles', () => {
    registerAppMenu(buildMenuOptions())

    const template = getTemplate()
    const appSubmenu = getSubmenu(template, 'Orca')
    const appLabels = appSubmenu.map((item) => item.label)
    expect(appLabels).toEqual(
      expect.arrayContaining([englishLabels().checkForUpdates, englishLabels().settings])
    )
    // Why: on macOS File should NOT duplicate Settings/Exit — those live in
    // the system app menu, so only Export belongs under File.
    const fileLabels = getSubmenu(template, englishLabels().file).map((item) => item.label)
    expect(fileLabels).not.toContain(englishLabels().settings)
    expect(fileLabels).not.toContain(englishLabels().exit)
    const helpLabels = getSubmenu(template, englishLabels().help).map((item) => item.label)
    expect(helpLabels).toEqual([
      englishLabels().reportCrash,
      undefined,
      englishLabels().exploreOrca
    ])
  })

  it('routes Feature tour through its callback', () => {
    const options = buildMenuOptions()
    registerAppMenu(options)

    const featureTourItem = getSubmenu(getTemplate(), englishLabels().help).find(
      (entry) => entry.label === englishLabels().exploreOrca
    )
    expect(featureTourItem?.accelerator).toBeUndefined()

    const targetWindow = {} as Electron.BaseWindow
    featureTourItem?.click?.({} as never, targetWindow, {} as Electron.KeyboardEvent)

    expect(options.onOpenFeatureTour).toHaveBeenCalledTimes(1)
    expect(options.onOpenFeatureTour).toHaveBeenCalledWith(targetWindow)
  })

  it('routes Report Crash through its callback', () => {
    const options = buildMenuOptions()
    registerAppMenu(options)

    const crashReportItem = getSubmenu(getTemplate(), englishLabels().help).find(
      (entry) => entry.label === englishLabels().reportCrash
    )

    const targetWindow = {} as Electron.BaseWindow
    crashReportItem?.click?.({} as never, targetWindow, {} as Electron.KeyboardEvent)

    expect(options.onOpenCrashReport).toHaveBeenCalledTimes(1)
    expect(options.onOpenCrashReport).toHaveBeenCalledWith(targetWindow)
  })

  it('exposes an Appearance submenu under View with checkbox items reflecting state', () => {
    const options = buildMenuOptions()
    options.getAppearanceState.mockReturnValue({
      showTasksButton: false,
      showMobileButton: true,
      showTitlebarAppName: true,
      statusBarVisible: true
    })
    registerAppMenu(options)

    const viewSubmenu = getSubmenu(getTemplate(), englishLabels().view)
    const appearanceEntry = viewSubmenu.find((item) => item.label === englishLabels().appearance)
    expect(appearanceEntry).toBeDefined()

    const appearanceSubmenu = (appearanceEntry?.submenu ??
      []) as Electron.MenuItemConstructorOptions[]
    const tasksItem = appearanceSubmenu.find(
      (item) => item.label === englishLabels().showTasksButton
    )
    expect(tasksItem?.type).toBe('checkbox')
    expect(tasksItem?.checked).toBe(false)

    const mobileItem = appearanceSubmenu.find(
      (item) => item.label === englishLabels().showMobileButton
    )
    expect(mobileItem?.type).toBe('checkbox')
    expect(mobileItem?.checked).toBe(true)

    const titlebarItem = appearanceSubmenu.find(
      (item) => item.label === englishLabels().showTitlebarAppName
    )
    expect(titlebarItem?.checked).toBe(true)

    const statusBarItem = appearanceSubmenu.find(
      (item) => item.label === englishLabels().showStatusBar
    )
    expect(statusBarItem?.checked).toBe(true)
  })

  it('routes Appearance checkbox clicks through onToggleAppearance', () => {
    const options = buildMenuOptions()
    registerAppMenu(options)

    const viewSubmenu = getSubmenu(getTemplate(), englishLabels().view)
    const appearanceSubmenu = (viewSubmenu.find((item) => item.label === englishLabels().appearance)
      ?.submenu ?? []) as Electron.MenuItemConstructorOptions[]

    appearanceSubmenu
      .find((item) => item.label === englishLabels().showTasksButton)
      ?.click?.({} as never, {} as never, {} as never)
    appearanceSubmenu
      .find((item) => item.label === englishLabels().showMobileButton)
      ?.click?.({} as never, {} as never, {} as never)
    appearanceSubmenu
      .find((item) => item.label === englishLabels().showTitlebarAppName)
      ?.click?.({} as never, {} as never, {} as never)

    expect(options.onToggleAppearance).toHaveBeenCalledWith('showTasksButton')
    expect(options.onToggleAppearance).toHaveBeenCalledWith('showMobileButton')
    expect(options.onToggleAppearance).toHaveBeenCalledWith('showTitlebarAppName')
  })

  it('routes sidebar toggle items through their callbacks', () => {
    const options = buildMenuOptions()
    registerAppMenu(options)

    const viewSubmenu = getSubmenu(getTemplate(), englishLabels().view)
    const appearanceSubmenu = (viewSubmenu.find((item) => item.label === englishLabels().appearance)
      ?.submenu ?? []) as Electron.MenuItemConstructorOptions[]

    const leftLabel = englishLabels().toggleLeftSidebar
    const rightLabel = englishLabels().toggleRightSidebar

    appearanceSubmenu
      .find((item) => item.label === leftLabel)
      ?.click?.({} as never, {} as never, {} as never)
    appearanceSubmenu
      .find((item) => item.label === rightLabel)
      ?.click?.({} as never, {} as never, {} as never)

    expect(options.onToggleLeftSidebar).toHaveBeenCalledTimes(1)
    expect(options.onToggleRightSidebar).toHaveBeenCalledTimes(1)
    // Why: these entries must not bind Cmd/Ctrl+B as real accelerators
    // because before-input-event carries a TipTap-bold carve-out that the
    // menu accelerator would bypass.
    expect(appearanceSubmenu.find((item) => item.label === leftLabel)?.accelerator).toBeUndefined()
    expect(appearanceSubmenu.find((item) => item.label === rightLabel)?.accelerator).toBeUndefined()
  })
})
