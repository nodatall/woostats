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
    tokenTickers[id] = { logoUrl: logo_url, price }
  })

  return tokenTickers
}
