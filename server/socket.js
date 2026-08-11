const memoryCache = require('./lib/memoryCache')
const logger = require('./lib/logger')

function initializeSocket(socket) {
  socket.on('connection', function (socketConnection) {
    socketConnection.on('get', async function ({ pageName }) {
      try {
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
      } catch (error) {
        logger.error('socket cache fetch failed', {
          message: error.message,
          stack: error.stack,
        })
        socketConnection.emit('send', {})
      }
    })
  })
}

module.exports = { initializeSocket }
