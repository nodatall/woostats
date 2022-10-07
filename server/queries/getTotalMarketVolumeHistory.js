const logger = require('../lib/logger')
const { client } = require('../database')

module.exports = async function getTotalMarketVolumeHistory() {
  const records = await client.query(
    `
      SELECT * FROM total_market_volume ORDER BY date
    `
  )

  logger.log('debug', `getTotalMarketVolumeHistory ${logger.msg(records)}`)
  return records
}
