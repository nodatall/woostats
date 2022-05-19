const knex = require('../database/knex')
const client = require('../database')
const dayjs = require('../lib/dayjs')
const statsCache = require('../lib/statsCache')
const fetchDailyExchangeStats = require('../queries/fetchDailyExchangeStats')

module.exports = async function updateDailyExchangeVolume({ exchangeId }) {
  const exchangeStatsToday = await fetchDailyExchangeStats({ exchangeId })
  if (!exchangeStatsToday) return

  const { tokenTickers = {} } = await statsCache.get()
  if (!tokenTickers.btc) return

  const volume = Math.round(exchangeStatsToday.trade_volume_24h_btc * tokenTickers.btc.price)
  const update = [{
    date: dayjs.tz().format('YYYY-MM-DD'),
    volume,
    exchange: exchangeId,
  }]

  const query = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(update)],
  )
  await client.query(`${query}`)
}


