let Client = require('node-rest-client').Client
let c = new Client()

function findByToken (accessToken) {
  c.get(`${process.env.OAUTH_HOST}/user.whoami?access_token=${accessToken}`, (data, response) => {

  })
}

module.exports.findByToken = findByToken
