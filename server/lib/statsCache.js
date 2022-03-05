const getExchangeVolume = require('../queries/getExchangeVolume')
const getTotalMarketVolumeHistory = require('../queries/getTotalMarketVolumeHistory')
const getWooTokenBurns = require('../queries/getWooTokenBurns')

let statsCache

async function get() {
  if (statsCache) return statsCache
  await update()
  return statsCache
}

async function update(more = {}) {
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const aggregateVolume = await getTotalMarketVolumeHistory()
  const wooTokenBurns = await getWooTokenBurns()

  newCache = {
    wooVolume,
    aggregateVolume,
    wooTokenBurns,
    ...more
  }

  statsCache = newCache
}

module.exports = { get, update }
