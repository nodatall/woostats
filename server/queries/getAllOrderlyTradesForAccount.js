const orderlyRequest = require('../lib/orderlyRequest')
const dayjs = require('dayjs')
const fs = require('fs')
const { Parser } = require('json2csv')

module.exports = async function fetchTradesHistory() {
  const startDate = dayjs.utc('2023-11-01').startOf('day').valueOf()
  const endDate = dayjs.utc('2024-02-15').startOf('day').valueOf()
  const pageSize = 500
  const requestPath = '/v1/trades'
  const params = { start_t: startDate, end_t: endDate }

  const tradesHistory = await fetchAllPages(requestPath, params, pageSize)
  if (!tradesHistory) return {}
  const liquidations = [
    {
      time: '2023-12-27 06:50:24',
      instrument: 'PERP_ETH_USDC',
      price: 1,
      quantity: -2,
      liquidationFee: 2
    },
    {
      time: '2024-01-03 04:09:28',
      instrument: 'PERP_BTC_USDC',
      price: 1,
      quantity: 1,
      liquidationFee: 1
    }
  ]
  liquidations.forEach(liquidation => {
    tradesHistory.push({
      executed_timestamp: dayjs(liquidation.time, 'YYYY-MM-DD HH:mm:ss').valueOf(),
      symbol: liquidation.instrument,
      side: liquidation.quantity > 0 ? 'SELL' : 'BUY',
      executed_quantity: Math.abs(liquidation.quantity),
      fee: liquidation.liquidationFee,
      executed_price: liquidation.price,
    })
  })

  const consolidatedByMonth = consolidateTradesByMonth(tradesHistory);

  // For CSV conversion
  const json2csvParser = new Parser()
  const csv = json2csvParser.parse(consolidatedByMonth)
  fs.writeFileSync('./monthly_trades_summary.csv', csv)

  return {
    tradesHistory,
    startDate,
    endDate
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
    await delay(300)
  }

  return allResults
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function consolidateTradesByMonth(tradesHistory) {
  const monthlySummary = {}

  tradesHistory.forEach(trade => {
    const month = dayjs(trade.executed_timestamp).format('YYYY-MM')
    if (!monthlySummary[month]) {
      monthlySummary[month] = { profitLoss: 0, fees: 0 }
    }

    const quantity = parseFloat(trade.executed_quantity)
    const fee = parseFloat(trade.fee)
    const executedPrice = parseFloat(trade.executed_price)
    const totalValue = (executedPrice * quantity) - fee

    if (trade.side.toUpperCase() === 'SELL') {
      monthlySummary[month].profitLoss += totalValue
    } else {
      monthlySummary[month].profitLoss -= totalValue
    }
    monthlySummary[month].fees += fee
  })

  return Object.entries(monthlySummary).map(([month, { profitLoss, fees }]) => ({
    Month: month,
    'Profit/Loss': profitLoss.toFixed(2),
    'Total Fees': fees.toFixed(2)
  }))
}
