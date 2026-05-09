require('../environment')

const express = require('express')
const compression = require('compression')
const path = require('path')

function requireHttps(req, res, next) {
  const forwardedProto = req.headers['x-forwarded-proto']
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto

  if (process.env.NODE_ENV === 'production' && proto && proto.split(',')[0].trim() !== 'https') {
    return res.redirect(302, `https://${req.get('host') || req.hostname}${req.originalUrl}`)
  }

  next()
}

const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')(server)

app.use(compression())
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))
app.use(requireHttps)
app.use(express.static('client/dist'))

app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  next()
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../client/dist/index.html'))
})

app.use(function (err, req, res) {
  res.status(500).json({ error: err.message })
})

require('./socket').initializeSocket(socket)
require('./worker').start(socket)
require('./lib/wooWebsocket')(socket)
require('./lib/orderlyWebsocket')(socket)

module.exports = { server }
