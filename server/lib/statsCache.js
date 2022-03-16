const getExchangeVolume = require('../queries/getExchangeVolume')
const getTotalMarketVolumeHistory = require('../queries/getTotalMarketVolumeHistory')
const getWooTokenBurns = require('../queries/getWooTokenBurns')
const getTokenPrices = require('../queries/getTokenPrices')

const statsCache = {}

async function get() {
  if (Object.keys(statsCache).length > 0) return statsCache
  await initialize()
  return statsCache
}

async function initialize() {
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const aggregateVolume = await getTotalMarketVolumeHistory()
  const wooTokenBurns = await getWooTokenBurns()
  const tokenPrices = await getTokenPrices()

  update({ wooVolume, aggregateVolume, wooTokenBurns, tokenPrices })
}

function update(changes) {
  for (const key in changes) {
    if (changes[key] === undefined) delete changes[key]
  }
  Object.assign(statsCache, changes)
}

module.exports = { get, update }

