const updateHistoricalWooFiEvents = require('./updateHistoricalWooFiEvents')
const dayjs = require('../lib/dayjs')
const { queueWooFiEventType } = require('../commands/processWooFiEvents')

module.exports = async function updateWooFiEventsForLast({ hours }) {
  const from = dayjs().subtract(hours, 'hour').unix()
  const allEventTypes = [
    'nakji.woofi.0_0_0.WOOPP_WooSwap',
  ]
  for (const eventType of allEventTypes) {
    await updateHistoricalWooFiEvents({ stream: eventType, from })
    queueWooFiEventType(eventType)
  }
}
