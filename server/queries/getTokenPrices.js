const logger = require('../lib/logger')
const client = require('../database')

module.exports = async function getTokenPrices() {
  logger.log('debug', `getTokenPrices`)

  const records = await client.query(`SELECT * FROM token_prices`)

  logger.log('debug', `result ${logger.msg(records)}`)

  return records.reduce((acc, {token, price}) => {
    acc[token] = price
    return acc
  }, {})
}
