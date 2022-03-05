const logger = require('../lib/logger')
const client = require('../database')

module.exports = async function getWooTokenBurns() {
  logger.log('debug', `getWooTokenBurns`)

  const records = await client.query(
    `
      SELECT * FROM woo_token_burns ORDER BY month
    `
  )

  logger.log('debug', `records ${logger.msg(records)}`)
  return records
}
