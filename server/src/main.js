const _ = require('lodash')
const users = require('../users')
const { useAccount } = require('./services/useAccount')
const { useAccountListUpdater } = require('./services/useAccountListUpdater')
const { useHttpServer } = require('./services/useHttpServer')

const credentials = _.uniqBy(_.flatMap(users, 'accounts'), 'email')
const accounts = credentials.map(useAccount)

const updater = useAccountListUpdater(accounts, (account) => {
  console.log('Account', account.state.credentials.email, 'updated')
})

updater.start().then(() => {
  const app = useHttpServer({ users, updater })

  const SERVER_PORT = 3000
  app.listen(SERVER_PORT, () => console.log(`Server started at port ${SERVER_PORT}`))
})
