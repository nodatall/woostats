const getExchangeVolume = require('../queries/getExchangeVolume')
const getTotalMarketVolumeHistory = require('../queries/getTotalMarketVolumeHistory')

let statsCache

async function get() {
  if (statsCache) return statsCache
  await update()
  return statsCache
}

async function update() {
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const aggregateVolume = await getTotalMarketVolumeHistory()

  statsCache = {
    wooVolume,
    aggregateVolume,
  }
}

module.exports = { get, update }
