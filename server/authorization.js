const HttpStatus = require('http-status')

const AuthorizationKeyHeadername = 'Super-Secret-Authorization-Key'

const authorizedClients = ['mellon']

const isAuthorized = req => req.get(AuthorizationKeyHeadername) && authorizedClients.includes(req.get(AuthorizationKeyHeadername))
const setUnauthorized = res => res.sendStatus(HttpStatus.UNAUTHORIZED)

module.exports = {
  authorizedHandler: handler => (req, res) => {
    if (!isAuthorized(req)) {
      setUnauthorized(res)

      return
    }

    handler(req, res)
  },
}
