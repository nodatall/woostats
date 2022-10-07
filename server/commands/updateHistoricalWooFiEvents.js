const fetchHistoricalEventsForNakjiStream = require('../queries/fetchHistoricalEventsForNakjiStream')
const createWooFiEvents = require('./createWooFiEvents')
const dayjs = require('../lib/dayjs')

module.exports = async function updateHistoricalWooFiEvents({ stream, from = 0 }) {
  let to = Infinity
  while (to > from) {
    const events = await fetchHistoricalEventsForNakjiStream({ stream, to: to === Infinity ? undefined : to })
    await createWooFiEvents({ events })
    to = dayjs(events[events.length - 1].Data.ts).unix()
    if (events.length < 1000) break
  }
}
