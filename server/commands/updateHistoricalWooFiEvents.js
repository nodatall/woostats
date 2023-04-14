const fetchHistoricalEventsForNakjiStream = require('../queries/fetchHistoricalEventsForNakjiStream')
const { createWooFiEvents } = require('./createWooFiEvents')
const dayjs = require('../lib/dayjs')

module.exports = async function updateHistoricalWooFiEvents({ stream, from = 0 }) {
  let to = Infinity
  while (to > from) {
    const events = await fetchHistoricalEventsForNakjiStream({ stream, to: to === Infinity ? undefined : to })
    if (events.length === 0) return
    console.log(`events.length ==>`, events.length)
    await createWooFiEvents({ events })
    const nextTo = dayjs(events[events.length - 1].Data.ts).unix()
    if (nextTo === to) break
    to = nextTo
    if (events.length < 1000) break
  }
}
