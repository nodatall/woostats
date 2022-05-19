const getExchangeVolume = require('../queries/getExchangeVolume')
const getTotalMarketVolumeHistory = require('../queries/getTotalMarketVolumeHistory')
const getWooTokenBurns = require('../queries/getWooTokenBurns')
const getTokenTickers = require('../queries/getTokenTickers')
const getWooDaoTreasuryBalance = require('../queries/getWooDaoTreasuryBalance')

const statsCache = {}

async function get() {
  if (Object.keys(statsCache).length >= 5) return statsCache
  await initialize()
  return statsCache
}

async function initialize() {
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const aggregateVolume = await getTotalMarketVolumeHistory()
  const wooTokenBurns = await getWooTokenBurns()
  const tokenTickers = await getTokenTickers()
  const wooDaoTreasuryBalance = await getWooDaoTreasuryBalance()
  update({ wooVolume, aggregateVolume, wooTokenBurns, tokenTickers, wooDaoTreasuryBalance })
}

function update(changes) {
  for (const key in changes) {
    if (changes[key] === undefined) delete changes[key]
  }
  Object.assign(statsCache, changes)
}

module.exports = { get, update }

