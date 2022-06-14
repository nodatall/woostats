const nomicsRequest = require('../lib/nomics')
const client = require('../database')
const dayjs = require('../lib/dayjs')

module.exports = async function fetchTotalMarketVolumeHistory() {
  const volumeRecords = await client.query('SELECT * FROM total_market_volume ORDER BY date DESC LIMIT 1')

  const start = volumeRecords.length === 0
    ? dayjs.tz('2021-06-25').format('YYYY-MM-DD')
    : dayjs.tz().subtract(5, 'days').format('YYYY-MM-DD')

  const volumeHistory = await nomicsRequest(
    '/volume/history',
    `&start=${start}T00%3A00%3A00Z&end=${dayjs.tz().format('YYYY-MM-DD')}T00%3A00%3A00Z`
  )
  return volumeHistory
}
