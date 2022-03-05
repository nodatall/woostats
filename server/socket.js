const statsCache = require('./lib/statsCache')

function initializeSocket(socket) {
  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function () {
      socketConnection.emit('send', await statsCache.get())
    })
  })
}

module.exports = { initializeSocket }
