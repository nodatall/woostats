const updateHistoricalWooFiEvents = require('./updateHistoricalWooFiEvents')
const dayjs = require('../lib/dayjs')
const { queueWooFiEventType } = require('../commands/processWooFiEvents')

module.exports = async function updateWooFiEventsForLast({ hours }) {
  const from = dayjs().subtract(hours, 'hour').unix()
  // TODO refactor when multiple chains are supported
  const allEventTypes = [
    'nakji.woofi.0_0_0.WOOPP_WooSwap', // put event types in separate file
  ]
  for (const eventType of allEventTypes) {
    await updateHistoricalWooFiEvents({ stream: eventType, from })
    queueWooFiEventType(eventType)
  }
}
