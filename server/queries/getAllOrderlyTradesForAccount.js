const orderlyRequest = require('../lib/orderlyRequest')
const fs = require('fs')
const dayjs = require('../lib/dayjs')
const { Parser } = require('json2csv')

module.exports = async function fetchTradesHistory() {
  const startDate = '2024-08-01'
  const endDate = '2024-12-31'
  const startDateUnix = dayjs.utc(startDate).startOf('day').valueOf()
  const endDateUnix = dayjs.utc(endDate).startOf('day').valueOf()

  // const dailyAccountStatistics = await fetchAllPages(
  //   '/v1/client/statistics/daily',
  //   { start_date: startDate, end_date: endDate }
  // )
  // if (!dailyAccountStatistics) throw new Error('failed to fetch dailyAccountStatistics')

  // const fundingStats = await fetchAllPages(
  //   '/v1/funding_fee/history',
  //   { start_t: startDateUnix, end_t: endDateUnix },
  //   500
  // )
  // if (!fundingStats) throw new Error('failed to fetch fundingStats')
  // const dailyFunding = getDailyFundingTotals(fundingStats)

  const tradesHistory = await fetchAllPages(
    '/v1/trades',
    { start_t: startDateUnix, end_t: endDateUnix },
    500
  )

  const dailyFees = consolidateFeesByDay(tradesHistory)


  console.log(`-:: writing orderly trades csv ::-`)
  // For CSV conversion
  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(dailyFees)
  fs.writeFileSync('./orderly_trades.csv', csv)
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
    await delay(300)
  }

  return allResults
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getDailyFundingTotals(dailyFunding) {
  const fundingTotals = {}

  dailyFunding.forEach(entry => {
    const date = dayjs(entry.created_time).format('YYYY-MM-DD')
    const fundingFee = entry.payment_type.toLowerCase() === 'pay' ? -entry.funding_fee : entry.funding_fee

    if (!fundingTotals[date]) {
      fundingTotals[date] = 0
    }

    fundingTotals[date] += fundingFee
  })

  return Object.entries(fundingTotals).map(([date, totalFunding]) => ({
    date,
    totalFunding
  }))
}

function consolidateFeesByDay(tradesHistory) {
  const dailySummary = {}

  tradesHistory.forEach(trade => {
    const day = dayjs(trade.executed_timestamp).format('YYYY-MM-DD')
    if (!dailySummary[day]) {
      dailySummary[day] = { fees: 0 }
    }

    const fee = parseFloat(trade.fee)
    dailySummary[day].fees += fee
  })

  return Object.entries(dailySummary).map(([day, { fees }]) => ({
    Day: day,
    'Total Fees': fees.toFixed(2)
  }))
}
