const knex = require('../database/knex')
const { client } = require('../database')
const dayjs = require('../lib/dayjs')

const fetchTokenPriceHistory = require('../queries/fetchTokenPriceHistory')

module.exports = async function updateTokenPriceHistory({ tokenId }) {
  const tokenPriceHistory = await fetchTokenPriceHistory({ tokenId })
  if (!tokenPriceHistory) return

  const dateSeenMap = {}
  const tokenPriceHistoryUpdate = []
  tokenPriceHistory.forEach(([date, price]) => {
    const formattedDate = dayjs.utc(date).format('YYYY-MM-DD')
    if (dateSeenMap[formattedDate]) return
    tokenPriceHistoryUpdate.push({
      date: formattedDate,
      token: tokenId,
      price,
    })
    dateSeenMap[formattedDate] = true
  })

  const query = knex.raw(
    `? ON CONFLICT (date, token) DO UPDATE SET price = EXCLUDED.price;`,
    [knex('token_price_history').insert(tokenPriceHistoryUpdate)],
  )
  await client.query(`${query}`)
}
