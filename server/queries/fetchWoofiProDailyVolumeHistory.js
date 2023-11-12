const orderlyRequest = require('../lib/orderlyRequest')
const dayjs = require('dayjs')

module.exports = async function fetchWoofiProDailyVolumeHistory() {
  const startDate = '2023-10-23'
  const endDate = dayjs.utc().format('YYYY-MM-DD')
  const page = 1
  const size = 500

  const volumeHistory = await orderlyRequest({
    path: '/v1/volume/broker/daily',
    params: { start_date: startDate, end_date: endDate, page, size }
  })
  if (!volumeHistory) return
  return volumeHistory.data.rows
}
