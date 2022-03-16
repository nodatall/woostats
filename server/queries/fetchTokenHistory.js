const coingeckoRequest = require('../lib/coingecko')

module.exports = async function fetchTokenHistory({ token, start, end }) {
  return await coingeckoRequest(
    `/coins/${token}/market_chart/range`,
    `&vs_currency=usd&from=${start}&to=${end}`
  )
}
