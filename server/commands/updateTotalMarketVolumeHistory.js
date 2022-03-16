const fetchTotalMarketVolumeHistory = require('../queries/fetchTotalMarketVolumeHistory')
const knex = require('../database/knex')
const client = require('../database')
const dayjs = require('../lib/dayjs')

module.exports = async function updateTotalMarketVolumeHistory() {
  const volumeHistory = await fetchTotalMarketVolumeHistory()
  if (!volumeHistory) return

  const volumeHistoryInsert = volumeHistory.map(({ timestamp, volume }) => ({
    date: dayjs.tz(timestamp).format('YYYY-MM-DD'),
    volume,
  }))

  const query = knex.raw(
    `? ON CONFLICT (date) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('total_market_volume').insert(volumeHistoryInsert)],
  )
  await client.query(`${query}`)
}
