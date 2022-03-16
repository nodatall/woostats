const client = require('../database')
const coingeckoRequest = require('../lib/coingecko')
const dayjs = require('../lib/dayjs')

module.exports = async function fetchExchangeVolumeHistory({ exchangeId }) {
  const volumeRecords = await client.query(
    'SELECT * FROM volume_by_exchange WHERE exchange = $1 ORDER BY date DESC LIMIT 1',
    [exchangeId]
  )

  const days = volumeRecords.length === 0
    ? dayjs.tz().diff('2021-06-24', 'day')
    : 7

  return await coingeckoRequest(
    `/exchanges/${exchangeId}/volume_chart`,
    `&days=${days}`
  )
}
