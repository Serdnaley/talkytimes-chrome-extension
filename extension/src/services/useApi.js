const baseUrl = 'http://localhost:3000'

const get = async (url) => {
  const { userToken } = await chrome.storage.sync.get(['userToken'])
  const endpoint = new URL(baseUrl + url)

  endpoint.searchParams.set('userToken', userToken)

  const res = await fetch(endpoint.toString(), {
    method: 'GET',
  }).catch(console.error)

  if (!res) return null

  const data = res.status === 200 ? await res.json() : {}

  return {
    data,
  }
}

export const getAccountAuthTokens = async (email) => get('/account-tokens?email=' + encodeURIComponent(email))

export const getAccounts = async () => get('/accounts')
