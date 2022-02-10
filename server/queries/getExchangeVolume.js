const logger = require('../lib/logger')
const client = require('../database')

module.exports = async function getExchangeVolumes({ exchangeId }) {
  logger.log('debug', `getExchangeVolumes ${exchangeId}`)

  const records = await client.query(
    `
      SELECT date, volume FROM volume_by_exchange
      WHERE exchange = $1
      ORDER BY date
    `,
    [exchangeId]
  )

  logger.log('debug', `result ${logger.msg(records)}`)
  return records
}
