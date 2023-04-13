const updateHistoricalWooFiEvents = require('./updateHistoricalWooFiEvents')
const dayjs = require('../lib/dayjs')
const { NAJKJI_BSC_WOOFI_WOOSWAPS } = require('../lib/constants')
const { queueWooFiEventType } = require('../commands/processWooFiEvents')

module.exports = async function updateWooFiEventsForLast({ hours }) {
  const from = dayjs().subtract(hours, 'hour').unix()
  // TODO refactor when multiple chains are supported
  const allEventTypes = [
    ...NAJKJI_BSC_WOOFI_WOOSWAPS,
  ]
  for (const eventType of allEventTypes) {
    await updateHistoricalWooFiEvents({ stream: eventType, from })
    queueWooFiEventType(eventType)
  }
}
