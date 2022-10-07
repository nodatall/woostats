const { client } = require('../database')

module.exports = async function getTokenTickers() {
  const records = await client.query(`SELECT * FROM token_tickers`)
  const tokenTickers = records.reduce((acc, {token, price, logo_url}) => {
    acc[token] = { price: +price, logoUrl: logo_url }
    return acc
  }, {})

  return tokenTickers
}
