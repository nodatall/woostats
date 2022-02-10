const getExchangeVolume = require('../queries/getExchangeVolume')
const getAggregateExchangeVolume = require('../queries/getAggregateExchangeVolume')

let statsCache

async function get() {
  if (statsCache) return statsCache
  await update()
  return statsCache
}

async function update() {
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const aggregateVolume = await getAggregateExchangeVolume()

  statsCache = {
    wooVolume,
    aggregateVolume,
  }
}

module.exports = { get, update }
