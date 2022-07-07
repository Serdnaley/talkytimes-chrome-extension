import { useAccounts } from './services/useAccounts.js'
import { authorize } from './utils/authorize.js'

const checkIsMutated = async (tabId) => {
  const { result } = await chrome.scripting.executeScript({
    func: () => window.isExtensionMutationInserted,
    target: { tabId },
  })

  return result
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return
  if (new URL(tab.url).hostname !== 'talkytimes.com') return
  if (await checkIsMutated(tabId).catch(console.error)) return

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['/src/content/main.js'],
  })

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['/src/content/main.css'],
  })
})

const onUpdated = (accounts) => accounts && chrome.storage.sync.set({ accounts })
const { update } = useAccounts({ onUpdated })

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'DO_ACCOUNT_AUTH') {
    await authorize(request.account.email)
    sendResponse({ success: true })
  }

  if (request.type === 'UPDATE_ACCOUNTS') {
    await update()
    sendResponse({ success: true })
  }
})
