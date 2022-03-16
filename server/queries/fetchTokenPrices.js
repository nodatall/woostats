const coingeckoRequest = require('../lib/coingecko')

const tokenIdNameMap = {
  'bitcoin': 'btc',
  'woo-network': 'woo',
}

module.exports = async function fetchTokenPricess({ tokens }) {
  const response = await coingeckoRequest(
    '/simple/price',
    `&ids=${encodeURIComponent(tokens.join(','))}&vs_currencies=usd`
  )
  if (!response) return {}
  const tokenPrices = {}
  tokens.forEach(token => {
    tokenPrices[tokenIdNameMap[token]] = response[token].usd
  })

  return tokenPrices
}
