const UPDATE_INTERVAL = 1000

module.exports.useAccountListUpdater = (list, callback) => {
  const state = {
    list,
    nextIndex: 0,
    intervalId: null,
  }

  const nextIndex = () => {
    state.nextIndex < state.list.length - 1
      ? state.nextIndex++
      : state.nextIndex = 0
  }

  const update = async () => {
    const account = state.list[state.nextIndex]

    await account.update()

    callback && callback(account)

    nextIndex()
  }

  const getAccounts = () => {
    return state.list.filter((account) => account.state.profile)
  }

  const stop = () => clearInterval(state.intervalId)
  const start = async () => {
    stop()

    await Promise.all(state.list.map((account) => account.update()))

    state.intervalId = setInterval(update, UPDATE_INTERVAL)
  }

  return {
    state,
    nextIndex,
    update,
    stop,
    start,
    getAccounts,
  }
}
