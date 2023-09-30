const { TOP_SPOT_EXCHANGE_IDS, TOP_FUTURES_EXCHANGE_IDS } = require('../lib/constants')

const updateExchangeVolumeHistory = require('./updateExchangeVolumeHistory')
const getExchangeVolumeHistory = require('../queries/getExchangeVolumeHistory')

let running = false
module.exports = async function updateTopExchangeVolumeHistories({ memoryCache, socket }) {
  if (running) return
  running = true
  const topSpotExchangeVolumes = []
  for (const exchangeId of TOP_SPOT_EXCHANGE_IDS) {
    await updateExchangeVolumeHistory({ exchangeId })
    const exchangeVolumeHistory = await getExchangeVolumeHistory({ exchangeId })

    topSpotExchangeVolumes.push([exchangeId, exchangeVolumeHistory])
  }

  const topFuturesExchangeVolumes = []
  for (const exchangeId of TOP_FUTURES_EXCHANGE_IDS) {
    await updateExchangeVolumeHistory({ exchangeId, isFutures: true })
    const exchangeVolumeHistory = await getExchangeVolumeHistory({ exchangeId })

    topFuturesExchangeVolumes.push([exchangeId, exchangeVolumeHistory])
  }

  const aggregateSpotMap = {}
  topSpotExchangeVolumes.forEach(([, exchangeVolumeHistory]) => {
    exchangeVolumeHistory.forEach(({ volume, date }) => {
      if (!aggregateSpotMap[date]) aggregateSpotMap[date] = 0
      aggregateSpotMap[date] += +volume
    })
  })
  const aggregateTopSpot = []
  Object.entries(aggregateSpotMap)
    .sort((a,b) => new Date(a[0]) - new Date(b[0]))
    .forEach(([date, volume]) => {
      aggregateTopSpot.push({ volume, date })
    })
  topSpotExchangeVolumes.unshift(['aggregateSpot', aggregateTopSpot])

  const aggregateFuturesMap = {}
  topFuturesExchangeVolumes.forEach(([, exchangeVolumeHistory]) => {
    exchangeVolumeHistory.forEach(({ volume, date }) => {
      if (!aggregateFuturesMap[date]) aggregateFuturesMap[date] = 0
      aggregateFuturesMap[date] += +volume
    })
  })
  const aggregateTopFutures = []
  Object.entries(aggregateFuturesMap)
    .sort((a,b) => new Date(a[0]) - new Date(b[0]))
    .forEach(([date, volume]) => {
      aggregateTopFutures.push({ volume, date })
    })
  topFuturesExchangeVolumes.unshift(['aggregateFutures', aggregateTopFutures])

  await updateExchangeVolumeHistory({ exchangeId: 'woofi' })
  const woofiVolumeHistory = await getExchangeVolumeHistory({ exchangeId: 'woofi' })

  await memoryCache.update({ topSpotExchangeVolumes, topFuturesExchangeVolumes, woofiVolumeHistory })
  socket.emit('send', { topSpotExchangeVolumes, topFuturesExchangeVolumes, woofiVolumeHistory })
  running = false
}
