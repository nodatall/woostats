const coingeckoRequest = require('../lib/coingecko')

module.exports = async function getTokenPricess(tokens) {
  const response = await coingeckoRequest(
    '/simple/price',
    `&ids=${encodeURIComponent(tokens.join(','))}&vs_currencies=usd`
  )
  if (!response) return {}
  const result = {}
  tokens.forEach(token => {
    result[token] = response[token].usd
  })
  return result
}
