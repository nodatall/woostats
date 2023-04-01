const coingeckoRequest = require('../lib/coingecko')
const dayjs = require('../lib/dayjs')
const fetchCoingeckoHistoricalData = require('./fetchCoingeckoHistoricalData')
const { client } = require('../database')

const fetchingMap = {}

module.exports = async function fetchTokenPriceHistory({ tokenId }) {
  const volumeRecord = await client.query(
    'SELECT * FROM token_price_history WHERE token = $1 ORDER BY date DESC LIMIT 1',
    [tokenId]
  )

  if (volumeRecord.length === 0)
    return await fetchCoingeckoHistoricalData({
      path: `/coins/${tokenId}/market_chart/range`,
      params: `&vs_currency=usd`,
    })

  const latestDate = volumeRecord[0].date
  const yesterday = dayjs.tz().subtract(1, 'day').format('YYYY-MM-DD')
  if (latestDate !== yesterday) {
    return (await coingeckoRequest(
      `/coins/${tokenId}/market_chart`,
      `&vs_currency=usd&days=91`
    )).prices
  }
}
