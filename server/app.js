require('../environment')

const sslRedirect = require('heroku-ssl-redirect').default
const express = require('express')
const compression = require('compression')
const path = require('path')

const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')(server)

app.use(compression())
app.use(sslRedirect())
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

module.exports = { server }

