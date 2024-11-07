const orderlyRequest = require('../lib/orderlyRequest')
const dayjs = require('dayjs')
const fs = require('fs')
const { Parser } = require('json2csv')

module.exports = async function fetchTradesHistory() {
  const startDate = dayjs.utc('2024-08-01').startOf('day').valueOf()
  const endDate = dayjs.utc('2024-10-24').startOf('day').valueOf()
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
      price: 41479,
      quantity: 4.93,
      liquidationFee: 4517.55
    },
    {
      time: '2024-06-17 18:45:04',
      instrument: 'PERP_WOO_USDC',
      price: 0.2,
      quantity: 202834,
      liquidationFee: 1474.43,
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
  const positions = {}  // To track positions per symbol

  tradesHistory.forEach(trade => {
    const month = dayjs(trade.executed_timestamp).format('YYYY-MM')
    if (!monthlySummary[month]) {
      monthlySummary[month] = { profitLoss: 0, fees: 0 }
    }

    const symbol = trade.symbol
    const quantity = parseFloat(trade.executed_quantity)
    const fee = parseFloat(trade.fee)
    const executedPrice = parseFloat(trade.executed_price)
    const tradeValue = executedPrice * quantity

    if (!positions[symbol]) {
      positions[symbol] = { position: 0, avgPrice: 0 }
    }

    const positionData = positions[symbol]

    if (trade.side.toUpperCase() === 'BUY') {
      // Adjust position and average price when buying
      const newPosition = positionData.position + quantity
      positionData.avgPrice =
        (positionData.position * positionData.avgPrice + tradeValue) / newPosition
      positionData.position = newPosition
    } else {
      // Handle sell - close long or open short
      let realizedPnl = 0
      if (positionData.position > 0) {
        const sellQuantity = Math.min(quantity, positionData.position)
        realizedPnl += sellQuantity * (executedPrice - positionData.avgPrice)
        positionData.position -= sellQuantity

        // If there is excess sell quantity, this opens a short
        if (quantity > sellQuantity) {
          positionData.position = -(quantity - sellQuantity)
          positionData.avgPrice = executedPrice
        }
      } else {
        // If selling when already in short, increase short position
        positionData.position -= quantity
        positionData.avgPrice = executedPrice
      }

      monthlySummary[month].profitLoss += realizedPnl
    }

    monthlySummary[month].fees += fee
  })

  return Object.entries(monthlySummary).map(([month, { profitLoss, fees }]) => ({
    Month: month,
    'Profit/Loss': profitLoss.toFixed(2),
    'Total Fees': fees.toFixed(2)
  }))
}

