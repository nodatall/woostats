const orderlyRequest = require('../lib/orderlyRequest')
const dayjs = require('dayjs')

module.exports = async function fetchWoofiProDailyVolumeHistory() {
  const startDate = '2023-10-23'
  const endDate = dayjs.utc().format('YYYY-MM-DD')
  const pageSize = 500

  const accountIdsAndAddresses = await fetchAllPages('/v1/volume/broker/daily', { start_date: startDate, end_date: endDate, aggregateBy: 'account' }, pageSize)
  if (!accountIdsAndAddresses) return

  const accountAddressMap = {}
  accountIdsAndAddresses.forEach(({ account_id, address }) => {
    accountAddressMap[account_id] = address
  })

  const volumeHistory = await fetchAllPages('/v1/volume/broker/daily', { start_date: startDate, end_date: endDate }, pageSize)
  if (!volumeHistory) return

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
    await delay(1000)
  }

  return allResults
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
