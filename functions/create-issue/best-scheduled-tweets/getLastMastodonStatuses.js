export async function getLastMastodonStatuses (client) {
  const { data: account } = await client.verifyAccountCredentials()
  const { data: posts } = await client.getAccountStatuses(account.id)

  return posts
}
