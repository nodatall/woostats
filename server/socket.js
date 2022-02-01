const db = require('./database')

function initializeSocket(socket) {
  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function () {
      const allStats = db.get()
      socketConnection.emit('send', { allStats })
    })
  })
}

module.exports = { initializeSocket }
