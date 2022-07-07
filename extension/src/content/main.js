window.isExtensionMutationInserted = true

const sidebar = document.createElement('div')

sidebar.classList.add('ExtSidebar')

document.body.prepend(sidebar)

const createSidebarItem = (account = {}) => {
  const state = {
    account,
    lastRenderedToken: null,
    lisLoading: false,
  }

  const el = document.createElement('div')

  el.classList.add('ExtSidebarItem')
  el.addEventListener('click', async () => {
    el.classList.add('ExtSidebarItem--loading')

    await chrome.runtime.sendMessage({
      type: 'DO_ACCOUNT_AUTH',
      account: state.account,
    })
      .then(() => document.location.reload())
      .catch(() => alert('Failed to authorize'))

    el.classList.remove('ExtSidebarItem--loading')
  })

  const mount = () => sidebar.appendChild(el)
  const unmount = () => sidebar.removeChild(el)

  const updateActiveStatus = async () => {
    const [, authCookie] = document.cookie.match(/tu_auth=([^;]+)(;|$)/) || []
    const currentAccountId = JSON.parse(authCookie || '{}').female

    currentAccountId === state.account.id
      ? el.classList.add('ExtSidebarItem--active')
      : el.classList.remove('ExtSidebarItem--active')
  }

  const update = () => {
    if (JSON.stringify(state.account) === state.lastRenderedToken) return

    updateActiveStatus().catch(console.error)

    const {
      name,
      email,
      avatarUrl,
      unreadDialogsCount,
    } = state.account

    el.innerHTML = `
      <img class="ExtSidebarItem__avatar" src="${avatarUrl}">
      <div class="ExtSidebarItem__info">
        <div class="ExtSidebarItem__name">${name}</div>
        <div class="ExtSidebarItem__email">${email}</div>
      </div>
      <div class="ExtSidebarItem__unreads ${(unreadDialogsCount > 0 ? 'ExtSidebarItem__unreads--active' : '')}">
        ${unreadDialogsCount}
      </div>
    `

    state.lastRenderedToken = JSON.stringify(state.account)
  }

  update()

  return {
    state,
    el,
    mount,
    unmount,
    update,
  }
}

const sidebarItems = []

const addSidebarItem = (account) => {
  const sidebarItem = createSidebarItem(account)

  sidebarItems.push(sidebarItem)
  sidebarItem.mount()
}
const updateSidebarItem = (sidebarItem, account) => {
  sidebarItem.state.account = account
  sidebarItem.update()
}
const removeSidebarItem = (sidebarItem) => {
  sidebarItem.unmount()
  sidebarItems.splice(sidebarItems.indexOf(sidebarItem), 1)
}

const handleAccountsUpdate = async () => {
  const { accounts } = await chrome.storage.sync.get(['accounts'])

  if (!Array.isArray(accounts)) return

  const newAccounts = accounts.filter((account) => !sidebarItems.find((sidebarItem) => sidebarItem.state.account.email === account.email))
  const removedItems = sidebarItems.filter((sidebarItem) => !accounts.find((account) => account.email === sidebarItem.state.account.email))
  const updatedItems = sidebarItems.filter((sidebarItem) => accounts.find((account) => account.email === sidebarItem.state.account.email))

  newAccounts.map((account) => addSidebarItem(account))
  removedItems.map((sidebarItem) => removeSidebarItem(sidebarItem))
  updatedItems.map((sidebarItem) => updateSidebarItem(sidebarItem, accounts.find((account) => account.email === sidebarItem.state.account.email)))
}

const loop = async () => {
  await chrome.runtime.sendMessage({ type: 'UPDATE_ACCOUNTS' })
  await handleAccountsUpdate()

  setTimeout(loop, 1000)
}
loop()
