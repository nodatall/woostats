const knex = require('../database/knex')
const client = require('../database')
const dayjs = require('../lib/dayjs')

const fetchExchangeVolumeHistory = require('../queries/fetchExchangeVolumeHistory')
const fetchTokenHistory = require('../queries/fetchTokenHistory')

module.exports = async function updateExchangeVolumeHistory({ exchangeId }) {
  const bitcoinHistory = await fetchTokenHistory({
    token: 'bitcoin',
    start: dayjs.tz('2021-06-24').unix(),
    end: dayjs.tz().unix(),
  })
  const volumeHistory = await fetchExchangeVolumeHistory({ exchangeId })
  if (!volumeHistory || !bitcoinHistory) return

  const btcPriceMap = {}
  bitcoinHistory.prices.forEach(([date, price]) => {
    btcPriceMap[dayjs.tz(date).format('YYYY-MM-DD')] = price
  })

  const seenDateMap = {}
  const volumeHistoryUpdate = []
  volumeHistory.reverse().forEach(([date, volumeInBTC]) => {
    const formattedDate = dayjs.tz(date).format('YYYY-MM-DD')
    if (seenDateMap[formattedDate]) return
    seenDateMap[formattedDate] = true
    volumeHistoryUpdate.push({
      date: formattedDate,
      exchange: exchangeId,
      volume: Math.round(volumeInBTC * btcPriceMap[formattedDate]),
    })
  })

  const query = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(volumeHistoryUpdate)],
  )
  await client.query(`${query}`)
}
