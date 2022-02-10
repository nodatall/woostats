const statsCache = require('./lib/statsCache')

function initializeSocket(socket) {
  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function () {
      const { wooVolume, aggregateVolume } = await statsCache.get()
      socketConnection.emit('send', { wooVolume, aggregateVolume })
    })
  })
}

module.exports = { initializeSocket }
