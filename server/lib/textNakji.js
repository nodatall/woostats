const fetchHistoricalEventsForNakjiStream = require('../queries/fetchHistoricalEventsForNakjiStream')
const dayjs = require('./dayjs')

async function blob({ stream, from = 0 }) {
  let to = Infinity
  while (to > from) {
    const results = await fetchHistoricalEventsForNakjiStream({ stream, to: to === Infinity ? undefined : to })
    to = dayjs(results[results.length - 1].Data.ts).unix()
    if (results.length < 1000) break
  }
}

blob({ stream: 'nakji.woofi.0_0_0.WOOPP_WooSwap' })
