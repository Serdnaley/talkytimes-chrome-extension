import { deleteDomainCookies } from './deleteDomainCookies.js'
import { getAccountAuthTokens } from '../services/useApi.js'

export const authorize = async (email) => {
  const {
    data: {
      accessToken,
      auth,
    },
  } = await getAccountAuthTokens(email)

  await deleteDomainCookies('talkytimes.com')
  await deleteDomainCookies('api.talkytimes.com')

  await chrome.cookies.set({
    url: 'https://api.talkytimes.com/',
    domain: 'api.talkytimes.com',
    expirationDate: Date.now() + 1000 * 60 * 60 * 24, // day
    name: 'token',
    path: '/',
    value: accessToken,
  })

  await chrome.cookies.set({
    url: 'https://talkytimes.com/',
    domain: 'talkytimes.com',
    expirationDate: Date.now() + 1000 * 60 * 60 * 24, // day
    name: 'tu_auth',
    path: '/',
    value: JSON.stringify(auth),
  })
}
