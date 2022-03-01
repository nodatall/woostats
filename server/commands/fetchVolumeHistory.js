const knex = require('../database/knex')
const coingeckoRequest = require('../lib/coingecko')
const nomicsRequest = require('../lib/nomics')
const dayjs = require('../lib/dayjs')
const client = require('../database')

module.exports = async function fetchVolumeHistory({ btcPrice }) {
  await fetchAndSaveExchangeVolumeHistory({ btcPrice })
  await fetchAndSaveTotalMarketVolumeHistory()
}

async function fetchAndSaveTotalMarketVolumeHistory() {
  const volumeRecords = await client.query('SELECT * FROM total_market_volume')
  const start = volumeRecords.length === 0
    ? dayjs('2021-06-25').format('YYYY-MM-DD')
    : dayjs().subtract(3, 'days').format('YYYY-MM-DD')

  const volumeHistory = await nomicsRequest(
    '/volume/history',
    `&start=${start}T00%3A00%3A00Z&end=${dayjs().format('YYYY-MM-DD')}T00%3A00%3A00Z`
  )
  if (!volumeHistory) return

  const volumeHistoryInsert = volumeHistory.map(({ timestamp, volume }) => ({
    date: dayjs(timestamp).tz('Atlantic/St_Helena').format('YYYY-MM-DD'),
    volume,
  }))

  const query = knex.raw(
    `? ON CONFLICT (date) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('total_market_volume').insert(volumeHistoryInsert)],
  )
  await client.query(`${query}`)
}

async function fetchAndSaveExchangeVolumeHistory({ exchangeId = 'wootrade', btcPrice }) {
  const volumeRecords = await client.query('SELECT * FROM volume_by_exchange WHERE exchange = $1', [exchangeId])
  const days = volumeRecords.length === 0
    ? dayjs().diff('2021-06-24', 'day')
    : 3

  const volumeHistory = await coingeckoRequest(
    `/exchanges/${exchangeId}/volume_chart`,
    `&days=${days}`
  )
  if (!volumeHistory) return

  const exchangeStatsToday = await coingeckoRequest(`/exchanges/${exchangeId}`)
  if (!exchangeStatsToday) return
  const todaysVolume = Math.round(exchangeStatsToday.trade_volume_24h_btc * btcPrice)

  let previousDate
  const volumeHistoryInsert = volumeHistory.map(([date, volumeInBTC], index) => {
    const dateFormat = 'YYYY-MM-DD'
    let formattedDate = dayjs.utc(date).format(dateFormat)
    if (previousDate === formattedDate) formattedDate = dayjs.utc(formattedDate).add(1, 'day').format(dateFormat)
    previousDate = formattedDate
    const volume = index === volumeHistory.length - 1 ? todaysVolume : Math.round(volumeInBTC * btcPrice)
    return {
      date: formattedDate,
      exchange: exchangeId,
      volume,
    }
  })

  const query = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(volumeHistoryInsert)],
  )
  await client.query(`${query}`)
}
