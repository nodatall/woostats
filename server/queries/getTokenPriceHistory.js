const { client } = require('../database')

module.exports = async function getTokenPriceHistory({ tokenId }) {
  const records = await client.query(
    `
      SELECT date, price FROM token_price_history
      WHERE token = $1
      ORDER BY date
    `,
    [tokenId]
  )

  return records
}
