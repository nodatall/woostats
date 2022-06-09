const wooXRequest = require('../lib/wooX')

module.exports = async function fetch24hrWooFuturesVolume() {
  const response = await wooXRequest(`/v1/public/futures`)
  if (!response.success) return

  return response.rows.reduce((acc, cur) => {
    const indexPriceVolume = cur['24h_volumn'] * cur.index_price
    return acc += indexPriceVolume
  }, 0)
}
