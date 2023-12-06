const orderlyRequest = require('../lib/orderlyRequest')
const dayjs = require('dayjs')
const { client } = require('../database')

module.exports = async function fetchWoofiProDailyVolumeHistory() {
  let startDate = '2023-10-23'
  const endDate = dayjs.utc().format('YYYY-MM-DD')
  const pageSize = 500

  const accountIdsAndAddresses = await fetchAllPages('/v1/volume/broker/daily', { start_date: startDate, end_date: endDate, aggregateBy: 'account' }, pageSize)
  if (!accountIdsAndAddresses) return {}

  const accountAddressMap = {}
  accountIdsAndAddresses.forEach(({ account_id, address }) => {
    accountAddressMap[account_id] = address
  })

  const latest = await client.one(`SELECT date FROM woofi_pro_daily_volume_by_account ORDER BY date DESC LIMIT 1;`)
  if (latest && latest.date) startDate = latest.date

  const volumeHistory = await fetchAllPages('/v1/volume/broker/daily', { start_date: startDate, end_date: endDate }, pageSize)
  if (!volumeHistory) return {}

  return {
    volumeHistory,
    accountAddressMap,
  }
}

async function fetchAllPages(requestPath, params, pageSize) {
  let page = 1
  let allResults = []
  let hasMore = true

  while (hasMore) {
    const response = await orderlyRequest({
      path: requestPath,
      params: { ...params, page, size: pageSize }
    })

    if (!response || !response.data || !response.data.rows) return

    allResults = allResults.concat(response.data.rows)

    hasMore = response.data.rows.length === pageSize
    page++
    await delay(3400)
  }

  return allResults
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
