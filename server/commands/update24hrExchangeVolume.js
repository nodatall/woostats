const knex = require('../database/knex')
const { client } = require('../database')
const memoryCache = require('../lib/memoryCache')
const fetchDailyExchangeStats = require('../queries/fetchDailyExchangeStats')
const fetch24hrWooFuturesVolume = require('../queries/fetch24hrWooFuturesVolume')

module.exports = async function update24hrExchangeVolume({ exchangeId, volume }) {
  if (!volume) {
    if (exchangeId === 'woo_network_futures') {
      volume = await fetch24hrWooFuturesVolume()
    } else {
      const exchangeStatsToday = await fetchDailyExchangeStats({ exchangeId })
      if (!exchangeStatsToday) return

      const { tokenTickers = {} } = await memoryCache.get()
      if (!tokenTickers.BTC) return

      volume = exchangeStatsToday.trade_volume_24h_btc * tokenTickers.BTC.price
    }
  }

  const update = [{
    volume: Math.round(volume),
    exchange: exchangeId,
  }]

  const query = knex.raw(
    `? ON CONFLICT (exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('exchange_volume_24hr').insert(update)],
  )
  await client.query(`${query}`)
}
