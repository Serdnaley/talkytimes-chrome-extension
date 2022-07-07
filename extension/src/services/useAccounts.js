import { getAccounts } from './useApi.js'

const REFRESH_TTL = 1000

export const useAccounts = ({ onUpdated }) => {
  const state = {
    accounts: [],
    lastRefresh: null,
  }

  const fetchData = async () => {
    const { data } = await getAccounts()

    if (!data) return

    state.lastRefresh = Date.now()
    state.accounts = data
    onUpdated && onUpdated(state.accounts)
  }

  const update = async () => {
    if (state.lastRefresh && Date.now() - state.lastRefresh < REFRESH_TTL) {
      return state.accounts
    }

    await fetchData()
  }

  return {
    state,
    update,
  }
}
