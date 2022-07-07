const { useApi } = require('./useApi.js')

const REFRESH_TTL = 1000 * 60

module.exports.useAccount = ({ email, password }) => {
  const state = {
    credentials: {
      email,
      password,
    },
    tokens: {
      accessToken: null,
      refreshToken: null,
    },
    profile: null,
    auth: null,
    cookies: null,
    refreshIntervalId: null,
    unreadDialogsCount: 0,
  }

  const api = useApi(state.tokens)

  const login = async () => {
    const { accessToken, refreshToken, auth } = await api.login(state.credentials)

    state.tokens.accessToken = accessToken
    state.tokens.refreshToken = refreshToken
    state.auth = auth

    const { personal } = await api.getProfile()

    state.profile = personal
  }

  clearInterval(state.refreshIntervalId)
  state.refreshIntervalId = setInterval(login, REFRESH_TTL)

  const fetchDialogs = async () => {
    if (!state.auth) await login()

    const { dialogs } = await api.getDialogs()

    state.unreadDialogsCount = dialogs
      .filter(({ type, hasNewMessage, isActive, isHidden, isBlocked }) => {
        return type === 'active' && hasNewMessage && isActive && !isHidden && !isBlocked
      })
      .length
  }

  const update = () => fetchDialogs()

  const authorize = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  return {
    state,
    api,
    login,
    fetchDialogs,
    update,
    authorize,
  }
}
