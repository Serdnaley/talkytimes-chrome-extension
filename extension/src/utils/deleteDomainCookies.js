export async function deleteDomainCookies (domain) {
  let cookiesDeleted = 0
  try {
    const cookies = await chrome.cookies.getAll({ domain })

    if (cookies.length === 0) {
      return 'No cookies found'
    }

    let pending = cookies.map(deleteCookie)
    await Promise.all(pending)

    cookiesDeleted = pending.length
  } catch (error) {
    return `Unexpected error: ${error.message}`
  }

  return `Deleted ${cookiesDeleted} cookie(s).`
}

function deleteCookie (cookie) {
  const protocol = cookie.secure ? 'https:' : 'http:'
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`

  return chrome.cookies.remove({
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId,
  })
}
