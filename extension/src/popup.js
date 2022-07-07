const input = document.querySelector('.Form__input')
const button = document.querySelector('.Form__button')

chrome.storage.sync.get(['userToken'], ({ userToken }) => {
  input.value = userToken || ''
})

button.addEventListener('click', async () => {
  await chrome.storage.sync.set({ userToken: input.value })

  window.close()
})
