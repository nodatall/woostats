const db = require('./database')

module.exports = function startSocket(server) {
  const socket = require('socket.io')(server)

  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function () {

      const allStats = db.get()

      socketConnection.emit('send', { allStats })
    })
  })
}

