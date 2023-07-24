export const autoRetrieveAccessToken = (fbApp) => {
  const api = fbApp.api
  /* eslint no-param-reassign: 0 */
  fbApp.api = (...args) => {
    if (fbApp.getAccessToken() === null) {
      const accessTokenOptions = {
        client_id: fbApp.options().appId,
        client_secret: fbApp.options().appSecret,
        grant_type: 'client_credentials'
      }
      return api('oauth/access_token', accessTokenOptions, (res) => {
        if (!res || res.error) {
          return args[args.length - 1](res.error)
        }

        fbApp.setAccessToken(res.access_token)
        return api(...args)
      })
    }

    return api(...args)
  }

  return fbApp
}

export default autoRetrieveAccessToken
