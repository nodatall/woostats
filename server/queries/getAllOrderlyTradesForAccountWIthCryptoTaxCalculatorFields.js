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

  const consolidatedTrades = consolidateTrades(tradesHistory)
  const json2csvParser = new Parser({
    fields: [
      'Timestamp (UTC)',
      'Type',
      'Base Currency',
      'Base Amount',
      'Quote Currency (Optional)',
      'Quote Amount (Optional)',
      'Fee Currency (Optional)',
      'Fee Amount (Optional)',
      'From',
      'To',
      'Blockchain (Optional)',
      'Reference Price Per Unit (Optional)',
    ]
  })

  const processedTrades = consolidatedTrades.map(trade => {
    return {
      'Timestamp (UTC)': dayjs(trade.executed_timestamp).format('YYYY-MM-DD HH:mm:ss'),
      'Type': trade.side.toLowerCase() === 'sell' ? 'sell' : 'buy',
      'Base Currency': trade.symbol,
      'Base Amount': trade.executed_quantity,
      'Quote Currency (Optional)': 'USDC',
      'Quote Amount (Optional)': trade.totalValue,
      'Fee Currency (Optional)': 'USDC',
      'Fee Amount (Optional)': trade.fee,
      'From': 'woofipro',
      'To': 'woofipro',
      'Blockchain (Optional)': 'Arbitrum',
      'Reference Price Per Unit (Optional)': trade.totalValue / trade.executed_quantity,
    }
  })

  const csv = json2csvParser.parse(processedTrades)
  fs.writeFileSync('./trades_history.csv', csv)

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

function consolidateTrades(tradesHistory) {
  const tradesBySymbolAndDayAndType = {}

  tradesHistory.forEach(trade => {
    const date = dayjs(parseInt(trade.executed_timestamp)).format('YYYY-MM-DD')
    const symbolDateTypeKey = `${trade.symbol}_${date}_${trade.side}`

    if (!tradesBySymbolAndDayAndType[symbolDateTypeKey]) {
      tradesBySymbolAndDayAndType[symbolDateTypeKey] = {
        symbol: trade.symbol,
        date: date,
        side: trade.side,
        executed_quantity: 0,
        fee: 0,
        totalValue: 0,
      }
    }

    const quantity = parseFloat(trade.executed_quantity)
    const fee = parseFloat(trade.fee)
    const executedPrice = parseFloat(trade.executed_price)

    tradesBySymbolAndDayAndType[symbolDateTypeKey].executed_quantity += quantity
    tradesBySymbolAndDayAndType[symbolDateTypeKey].fee += fee
    tradesBySymbolAndDayAndType[symbolDateTypeKey].totalValue += (executedPrice * quantity) - fee
  })

  return Object.values(tradesBySymbolAndDayAndType)
}
