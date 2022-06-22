const nomicsRequest = require('../lib/nomics')

module.exports = async function fetchTokenTickers({ tokens }) {
  const response = await nomicsRequest(
    '/currencies/ticker',
    `&ids=${encodeURIComponent(tokens.join(','))}`
  )
  if (!response) return {}
  const tokenTickers = {}
  response.forEach(ticker => {
    const { id, logo_url, price } = ticker
    tokenTickers[id] = { logoUrl: logo_url, price: +price }
    if (ticker.symbol === 'REF')
      tokenTickers[id].logoUrl = 'https://assets.coingecko.com/coins/images/18279/small/ref.png?1631238807'
  })

  return tokenTickers
}
