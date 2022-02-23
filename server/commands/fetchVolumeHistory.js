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
    ? dayjs('2021-06-26').utc().format('YYYY-MM-DD')
    : dayjs.utc().subtract(3, 'days').format('YYYY-MM-DD')

  const volumeHistory = await nomicsRequest(
    '/volume/history',
    `&start=${start}T00%3A00%3A00Z&end=${dayjs.utc().format('YYYY-MM-DD')}T00%3A00%3A00Z`
  )
  if (!volumeHistory) return

  const volumeHistoryInsert = volumeHistory.map(({ timestamp, volume }) => {
    return {
      date: dayjs.utc(timestamp).format('YYYY-MM-DD'),
      volume,
    }
  })

  const query = knex.raw(
    `? ON CONFLICT (date) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('total_market_volume').insert(volumeHistoryInsert)],
  )
  await client.query(`${query}`)
}

async function fetchAndSaveExchangeVolumeHistory({ exchangeId = 'wootrade', btcPrice }) {
  const volumeRecords = await client.query('SELECT * FROM volume_by_exchange WHERE exchange = $1', [exchangeId])
  const days = volumeRecords.length === 0
    ? dayjs().utc().diff('2021-06-24', 'day')
    : 3

  const volumeHistory = await coingeckoRequest(
    `/exchanges/${exchangeId}/volume_chart`,
    `&days=${days}`
  )
  if (!volumeHistory) return

  let previousDate
  const volumeHistoryInsert = volumeHistory.map(([date, volumeInBTC]) => {
    const dateFormat = 'YYYY-MM-DD'
    let formattedDate = dayjs.utc(date).format(dateFormat)
    if (previousDate === formattedDate) formattedDate = dayjs.utc(formattedDate).add(1, 'day').format(dateFormat)
    previousDate = formattedDate
    return {
      date: formattedDate,
      exchange: exchangeId,
      volume: Math.round(volumeInBTC * btcPrice),
    }
  })

  const query = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(volumeHistoryInsert)],
  )
  await client.query(`${query}`)
}
