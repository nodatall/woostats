const coingeckoRequest = require('../lib/coingecko')

module.exports = async function fetchVolumeHistory({ token }) {
  const btcPriceResponse = await coingeckoRequest(
    '/simple/price',
    `&ids=${token}&vs_currencies=usd`
  )
  if (!btcPriceResponse) return
  return btcPriceResponse[token].usd
}
