const coingeckoRequest = require('../lib/coingecko')
const { TOKENS } = require('../lib/constants')

module.exports = async function fetchTokenTickers({ tokens }) {
  const response = await coingeckoRequest(
    '/simple/price',
    `&ids=${encodeURIComponent(tokens.join(','))}&vs_currencies=usd`
  )

  if (!response) return {}
  const tokenTickers = {}

  for (const tokenId of Object.keys(response)) {
    const symbol = TOKENS[tokenId]
    tokenTickers[symbol] = { price: +response[tokenId].usd }
  }

  return tokenTickers
}
