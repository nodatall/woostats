const memoryCache = require('./lib/memoryCache')

function initializeSocket(socket) {
  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function ({ pageName }) {
      const cacheName = pageName || 'network'
      const generalCache = await memoryCache.get('general')
      const pageCache = (await memoryCache.get(cacheName)) || {}
      socketConnection.emit('send', { ...generalCache, ...pageCache })

      const remainingCaches = {}
      const remainingCacheNames = memoryCache.CACHE_NAMES
        .filter(_cacheName => !['general', cacheName].includes(_cacheName))

      for (const _cacheName of remainingCacheNames) {
        const remainingCache = await memoryCache.get(_cacheName)
        Object.assign(remainingCaches, remainingCache)
      }

      socketConnection.emit('send', { ...remainingCaches })
    })
  })
}

module.exports = { initializeSocket }
