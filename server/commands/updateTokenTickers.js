const knex = require('../database/knex')
const { client } = require('../database')
const fetchTokenTickers = require('../queries/fetchTokenTickers')

module.exports = async function updateTokenTickers({ tokens }) {
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

  return tokenTickers
}
