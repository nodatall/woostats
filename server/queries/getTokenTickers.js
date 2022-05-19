const logger = require('../lib/logger')
const client = require('../database')

module.exports = async function getTokenTickers() {
  logger.log('debug', `getTokenTickers`)

  const records = await client.query(`SELECT * FROM token_tickers`)

  logger.log('debug', `result ${logger.msg(records)}`)

  return records.reduce((acc, {token, price, logo_url}) => {
    acc[token] = { price, logoUrl: logo_url }
    return acc
  }, {})
}
