const knex = require('../database/knex')
const { client } = require('../database')
const memoryCache = require('../lib/memoryCache')
const fetchTokenTickers = require('../queries/fetchTokenTickers')

const TOKEN_TICKER_REFRESH_INTERVAL_MS = 5 * 60 * 1000

function hasFreshTickerCache({ tokenTickers, tokenTickersUpdatedAt }) {
  if (!tokenTickers || !Object.keys(tokenTickers).length || !tokenTickersUpdatedAt) return false

  return Date.now() - new Date(tokenTickersUpdatedAt).getTime() < TOKEN_TICKER_REFRESH_INTERVAL_MS
}

module.exports = async function updateTokenTickers({ tokens, force = false }) {
  const { tokenTickers: cachedTokenTickers, tokenTickersUpdatedAt } = await memoryCache.get('general')

  if (!force && hasFreshTickerCache({ tokenTickers: cachedTokenTickers, tokenTickersUpdatedAt })) {
    return cachedTokenTickers
  }

  const tokenTickers = await fetchTokenTickers({ tokens })

  const update = Object.entries(tokenTickers).map(
    ([key, { price, logoUrl }]) => {
      return {
        token: key,
        price,
        logo_url: logoUrl,
      }
    }
  )

  const query = knex.raw(
    `? ON CONFLICT (token) DO UPDATE SET price = EXCLUDED.price, logo_url = EXCLUDED.logo_url;`,
    [knex('token_tickers').insert(update)],
  )
  await client.query(`${query}`)
  await memoryCache.update({
    tokenTickers,
    tokenTickersUpdatedAt: new Date().toISOString(),
  })

  return tokenTickers
}
