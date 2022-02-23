const logger = require('../lib/logger')
const client = require('../database')

module.exports = async function getTotalMarketVolumeHistory() {
  logger.log('debug', `getTotalMarketVolumeHistory`)

  const records = await client.query(
    `
      SELECT * FROM total_market_volume ORDER BY date
    `
  )

  logger.log('debug', `result ${logger.msg(records)}`)
  return records
}
