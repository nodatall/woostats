const statsCache = require('./lib/statsCache')

function initializeSocket(socket) {
  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function () {
      const { wooVolume, aggregateVolume, wooPrice } = await statsCache.get()
      socketConnection.emit('send', { wooVolume, aggregateVolume, wooPrice })
    })
  })
}

module.exports = { initializeSocket }
