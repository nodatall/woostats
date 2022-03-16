const knex = require('../database/knex')
const client = require('../database')
const fetchTokenPrices = require('../queries/fetchTokenPrices')

module.exports = async function updateTokenPrices({ tokens }) {
  const tokenPrices = await fetchTokenPrices({ tokens })

  const update = Object.entries(tokenPrices).map(
    ([key, value]) => {
      return {
        token: key,
        price: value,
      }
    }
  )

  const query = knex.raw(
    `? ON CONFLICT (token) DO UPDATE SET price = EXCLUDED.price;`,
    [knex('token_prices').insert(update)],
  )
  await client.query(`${query}`)

  return tokenPrices
}
