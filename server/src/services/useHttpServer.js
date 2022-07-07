const express = require('express')
const cors = require('cors')
const _ = require('lodash')

module.exports.useHttpServer = ({
  users,
  updater,
}) => {
  const app = express()

  app.use(cors())
  app.use((req, res, next) => {
    const { userToken } = req.query
    const user = users[userToken]

    if (!user) {
      return res.status(404).send('User not found')
    }

    req.user = user
    return next()
  })

  const transformAccount = (account) => {
    const {
      unreadDialogsCount,
      profile: {
        name,
        email,
        avatar_medium,
      },
      auth: {
        female: id,
      },
    } = account?.state || {}
    const {
    } = account?.state.profile || {}

    return {
      id,
      name,
      email,
      avatarUrl: avatar_medium,
      unreadDialogsCount,
    }
  }
  const getAccountByEmail = (email) => {
    const accounts = updater.getAccounts()

    return _.find(accounts, { state: { credentials: { email } } })
  }

  app.get('/accounts', (req, res) => {
    const userAccounts = req.user.accounts.map(({ email }) => getAccountByEmail(email))

    res.json(userAccounts.map(transformAccount).filter(Boolean))
  })

  app.get('/account-tokens', async (req, res) => {
    const { email } = req.query
    const account = getAccountByEmail(email)

    if (!account) {
      return res.status(404).send('Account not found')
    }

    if (!account.state.auth) {
      await account.login()
    }

    res.json({
      ...account.state.tokens,
      auth: account.state.auth,
    })
  })

  return app
}
