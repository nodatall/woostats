const delay = require('delay')
const { performance } = require('perf_hooks')

const getWooFiStats = require('../queries/getWooFiStats')
const memoryCache = require('../lib/memoryCache')

const recentWooFiEventTypes = new Set()

function queueWooFiEventType(eventType) {
  recentWooFiEventTypes.add(eventType)
}

async function startProcessor(socket) {
  while(true) {
    if (recentWooFiEventTypes.size === 0) {
      await delay(1000)
    } else {
      const startTime = performance.now()

      const eventTypes = [...recentWooFiEventTypes]
      recentWooFiEventTypes.clear()

      const wooFiStats = await getWooFiStats({ eventTypes })
      await memoryCache.update({ ...wooFiStats })
      socket.emit('send', { ...wooFiStats })

      const endTime = performance.now()
      console.log(`Processing WooFi events took ${(endTime - startTime).toFixed(5)} milliseconds`)
    }
  }
}

module.exports = {
  startProcessor,
  queueWooFiEventType,
}
