import type { SshConnectionStatus } from '../../../shared/ssh-types'

export type WorkspaceMessages = {
  create: {
    createWorktree: string
    createWorkspace: string
    createWorkspaceDescription: string
    project: string
    addProject: string
    chooseProject: string
    thisProject: string
    connectProject: (projectName: string) => string
    sshStatus: Record<SshConnectionStatus, string>
    notConnected: string
    connect: string
    reconnect: string
    connecting: string
    nameOrCreateFrom: string
    workspaceName: string
    optional: string
    connectRepoFirst: string
    agent: string
    openAgentSettings: string
    configureAgents: string
    advanced: string
    name: string
    note: string
    writeNote: string
    setupScript: string
    combinedSetupCommand: string
    localSetupCommand: string
    localSettings: string
    runSetupCommand: string
    runSetupNowQuestion: string
    runSetupNow: string
    skipForNow: string
    checkingSetupConfiguration: string
    chooseSetupBeforeCreate: string
    sparseCheckout: string
    sparseCheckoutLocalOnly: string
  }
  delete: {
    deleteWorkspace: string
    deleteWorkspaces: string
    removePrefix: string
    targets: (count: number) => string
    suffix: {
      batchFolder: string
      batchMixed: string
      batchGit: string
      folder: string
      git: string
    }
    mainWorktreeBlocker: {
      folder: string
      git: string
    }
    mainWorktreeNotice: (blocker: string) => string
    dontAskAgain: string
    skipSavedTitle: string
    skipSavedDescription: string
    openSettings: string
    forceDeleteFailed: string
    deleteFailed: string
    close: string
    cancel: string
    forceDeleting: string
    forceDelete: string
    deleting: string
    deleteAll: (count: number) => string
    deleteCount: (count: number) => string
    deleteParentOnly: string
    delete: string
  }
  cleanup: {
    title: string
    description: string
    refresh: string
    close: string
    checkingSafety: string
    checkingSafetyDescription: string
    scanFailed: string
    ignoreFailed: string
    selected: (count: number) => string
    inactive: (count: number) => string
    safeToRemove: (count: number) => string
    needReview: (count: number) => string
    notSuggested: (count: number) => string
    deleteSelected: string
    suggestedCleanup: string
    closerLook: string
    notSuggestedForCleanup: string
    ignoredCleanupSuggestions: string
    restoreIgnoredSuggestions: string
    sortedByOldestActivity: string
    selectAllIn: (label: string) => string
    unselectAllIn: (label: string) => string
    emptyNoInactive: string
    emptyNoInactiveInCheckedRepos: string
    emptyNoRepoMatch: string
    showAllRepos: string
    emptyAllIgnored: string
    reviewIgnoredWorkspaces: string
    emptySet: string
    suggested: string
    needsReview: string
    notSuggestedNav: string
    ignored: string
    view: string
    ignore: string
    remove: string
    selectWorkspace: (name: string) => string
    viewWorkspace: (name: string) => string
    ignoreWorkspace: (name: string) => string
    removeWorkspace: (name: string) => string
    status: {
      ignored: string
      archived: string
      clean: string
      unpushedCommits: string
      dirty: string
      review: string
      notSuggested: string
    }
    blockers: Record<string, string>
    repo: (name: string) => string
    branch: (name: string) => string
    lastActive: (relativeTime: string) => string
    never: string
    justNow: string
    minutesAgo: (minutes: number) => string
    hoursAgo: (hours: number) => string
    daysAgo: (days: number) => string
    git: {
      clean: string
      dirty: string
      unknown: string
      noUnpushedCommits: string
      unpushedCommits: (count: number) => string
      uncommittedChanges: string
      statusUnknown: string
    }
    localContext: {
      terminalTabs: (count: number) => string
      editorTabs: (count: number) => string
      browserTabs: (count: number) => string
      diffNotes: (count: number) => string
      completedAgents: (count: number) => string
    }
    scanNotice: {
      repoFallback: string
      defaultReason: string
      single: (repoName: string, reason: string) => string
      multiple: (count: number, repoNames: string, moreCount: number) => string
    }
    removed: (count: number) => string
    removeFailed: (count: number) => string
    confirmTitle: (count: number) => string
    confirmDescription: string
    toDelete: (count: number) => string
    deleteCount: (count: number) => string
    cancel: string
  }
  visibility: {
    title: string
    shownInSidebar: string
    hiddenFromSidebar: string
    currentlyShown: (count: number) => string
    availableToImport: (count: number) => string
    hide: string
    import: string
  }
  menu: {
    workspaceOptions: string
    workspaceOptionsWithFilters: (activeFilterLabel: string) => string
    activeFilters: (count: number) => string
    groupBy: string
    groupOptions: {
      none: string
      status: string
      pr: string
      project: string
    }
    sortBy: string
    sortFallback: string
    sortOptions: {
      name: string
      smart: string
      smartDescription: string
      recent: string
      repo: string
      manual: string
      manualDescription: string
    }
    showProperties: string
    properties: {
      issue: string
      linearIssue: string
      pr: string
      ci: string
      status: string
      unread: string
      comment: string
      ports: string
      inlineAgents: string
    }
    filters: string
    hideSleeping: string
    hideDefaultBranch: string
    projects: string
    addProject: string
    filterProjects: string
    searchProjects: string
    noUnselectedProjects: string
    noProjects: string
    removeProjectFilter: (projectName: string) => string
    clear: string
    selectAll: string
    resetFilters: string
    editFilters: string
    editFiltersWithCount: (count: number) => string
    filterWorkspaces: string
    view: string
    forceDelete: string
    forceDeleteFallback: string
    forceDeleteFailed: string
    deleteFailed: string
    noDeletableWorkspacesSelected: string
    staleWorkspaceList: string
    deleteChangedFilesHint: string
    deleteOrphanedDirectoryHint: string
    openIn: string
    openInBrowser: string
    copyAddress: (address: string) => string
    stopProcess: string
    openBrowserFailed: string
    copiedAddress: (address: string) => string
    stoppedProcess: (port: number) => string
    refreshPortsFailed: string
    workspaceUnavailable: string
    livePorts: string
    goToWorktree: string
    openInOrca: string
    openInOrcaBrowser: string
    localFilesOnly: string
    viewOnProvider: (provider: string) => string
    editIssue: string
    copyPath: string
    pin: string
    unpin: string
    markRead: string
    markUnread: string
    openParentWorkspace: string
    removeFromParent: string
    moveToStatus: string
    moveStatusesTo: string
    update: string
    sleep: string
    sleepCount: (count: number) => string
    sleepTooltipSingle: string
    sleepTooltipMultiple: string
    delete: string
    deleteSelected: string
    deleteCount: (count: number) => string
    removeFolderFromOrca: string
    deleting: string
    mainWorktreeCannotBeDeleted: string
  }
}
