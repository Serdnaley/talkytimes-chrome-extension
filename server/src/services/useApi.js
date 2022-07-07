const axios = require('axios')

module.exports.useApi = (tokens) => {
  const domain = 'api.talkytimes.com'

  axios.defaults.baseURL = 'https://' + domain

  const extractTokens = (response) => {
    if (response?.status !== 200) return null

    const cookie = response.headers['set-cookie'].find((text) => text.includes('token='))
    const [, accessToken] = cookie?.match(/token=([^;]+);/) || []
    const refreshToken = response.data.data?.refresh_token

    return { accessToken, refreshToken }
  }

  const errorHandler = (error) => {
    console.error(error)
    throw error
  }

  const request = async (method, url, data = {}) => {
    return axios({
      url,
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'cookie': tokens.accessToken ? `token=${tokens.accessToken};` : 'null',
      },
      data,
    }).catch(errorHandler)
  }
  const post = (...args) => request('POST', ...args)
  const get = (...args) => request('GET', ...args)

  const login = async ({ email, password }) => {
    const res = await post('/auth/login', {
      captcha: '',
      email,
      password,
    })

    return {
      auth: res.data.data,
      ...extractTokens(res),
    }
  }

  const refresh = async (refreshToken) => {
    const res = await post('/auth/refresh-token', { refreshToken })

    return extractTokens(res)
  }

  const getDialogs = async () => {
    const res = await post('/chat/dialogs/by-criteria', {
      criteria: [],
      cursor: "",
      limit: 15,
    })

    return res.data
  }

  const getProfile = async () => {
    const res = await get('/private/personal-profile')

    return res.data
  }

  return {
    login,
    refresh,
    getDialogs,
    getProfile,
  }
}
