const { client } = require('../database')
const coingeckoRequest = require('../lib/coingecko')
const dayjs = require('../lib/dayjs')
const fetchCoingeckoHistoricalData = require('./fetchCoingeckoHistoricalData')

module.exports = async function fetchExchangeVolumeHistory({ exchangeId, forceUpdate = false, beginning, getAll }) {
  const volumeRecord = await client.query(
    'SELECT * FROM volume_by_exchange WHERE exchange = $1 ORDER BY date DESC LIMIT 1',
    [exchangeId]
  )

  if (volumeRecord.length === 0 || getAll)
    return await fetchCoingeckoHistoricalData({ path: `/exchanges/${exchangeId}/volume_chart/range`, beginning })

  const latestDate = volumeRecord[0].date
  const yesterday = dayjs.utc().subtract(1, 'day').format('YYYY-MM-DD')
  if (
    (latestDate !== yesterday) ||
    forceUpdate
  ) {
    return await coingeckoRequest(
      `/exchanges/${exchangeId}/volume_chart`,
      `&days=30`
    )
  }
}
