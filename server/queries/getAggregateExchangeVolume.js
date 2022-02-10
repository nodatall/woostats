const logger = require('../lib/logger')
const client = require('../database')

module.exports = async function getAggregateExchangeVolume() {
  logger.log('debug', `getAggregateExchangeVolume`)

  const records = await client.query(
    `
      SELECT date, SUM(volume) FROM volume_by_exchange
      GROUP BY date
    `
  )

  logger.log('debug', `result ${logger.msg(records)}`)
  return records
}
