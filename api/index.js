require('dotenv').config()
let process = require('process')
const express = require('express')
let exeAddr = process.env.EXECUTIONER_ADDRESS
let axios = require('axios')
// Create express router
const router = express.Router()
const bodyParser = require('body-parser')

// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
var app = express()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

let https = require('https')
let httpCfg = {
  proxy: false,
  headers: {'Content-Type': 'application/json'}
}
if (process.env.EXECUTIONER_SSL_ENABLED === 'true') {
  httpCfg.httpsAgent = new https.Agent({
    rejectUnauthorized: false
  })
}

// Add POST - /api/login
router.post('/login', (req, resp) => {
  let info = JSON.stringify({
    account: req.body.account,
    password: req.body.password
  }) // Do not use req.body directly since JSON has circular structure
  axios.post(exeAddr + '/api/v1/login', info, httpCfg)
    .then((result) => {
      req.session.user = {
        uid: result.data.uid,
        role: result.data.role,
        name: result.data.name
      }
      resp.status(200).json(result.data)
      resp.end()
    })
    .catch((err) => {
      if (err.response) {
        resp
          .status(err.response.status)
          .json(err.message)
      } else if (err.request) {
        resp
          .status(500)
          .json('Internal server error')
        console.error(err.request)
      } else {
        resp
          .status(500)
          .json('Internal server error!')
        console.log('Error', err.message)
      }
      resp.end()
    })
})

// Add POST - /api/logout
router.post('/logout', (req, res) => {
  delete req.session.user
  res.status(200).json({ ok: true })
  res.end()
})

// Export the server middleware
module.exports = {
  path: '/api',
  handler: router
}
