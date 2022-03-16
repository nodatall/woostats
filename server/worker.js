const cron = require('./lib/cron')
const statsCache = require('./lib/statsCache')
const updateTokenPrices = require('./commands/updateTokenPrices')
const updateTotalMarketVolumeHistory = require('./commands/updateTotalMarketVolumeHistory')
const updateDailyExchangeVolume = require('./commands/updateDailyExchangeVolume')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWooTokenBurns = require('./commands/updateWooTokenBurns')
const getExchangeVolume = require('./queries/getExchangeVolume')
const getTotalMarketVolumeHistory = require('./queries/getTotalMarketVolumeHistory')

function start(socket){
  if (process.env.initializeAllData) intializeAllData(socket)

  cron.schedule('* * * * *', async () => { // once a minute
    const tokenPrices = await updateTokenPrices({ tokens: ['bitcoin', 'woo-network'] })
    statsCache.update({ tokenPrices })

    await updateDailyExchangeVolume({ exchangeId: 'wootrade' })
    await updateTotalMarketVolumeHistory()

    const aggregateVolume = await getTotalMarketVolumeHistory()
    const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })

    statsCache.update({ aggregateVolume, wooVolume })
    socket.emit('send', { tokenPrices, aggregateVolume, wooVolume })
  })

  cron.schedule('0 * * * *', async () => { // once an hour
    await updateWooTokenBurns()
    const wooTokenBurns = await getWooTokenBurns()
    statsCache.update({ wooTokenBurns })
    socket.emit('send', { wooTokenBurns })
  })

  cron.schedule('0 0 * * *', async () => { // once a day
    await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
    const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    statsCache.update({ wooVolume })
    socket.emit('send', { wooVolume })
  })
}

async function intializeAllData(socket) {
  const tokenPrices = await updateTokenPrices({ tokens: ['bitcoin', 'woo-network'] })
  statsCache.update({ tokenPrices })

  await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
  await updateDailyExchangeVolume({ exchangeId: 'wootrade' })
  await updateTotalMarketVolumeHistory()
  await updateWooTokenBurns()

  const aggregateVolume = await getTotalMarketVolumeHistory()
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const wooTokenBurns = await getWooTokenBurns()

  statsCache.update({ aggregateVolume, wooVolume })
  socket.emit('send', { tokenPrices, aggregateVolume, wooVolume, wooTokenBurns })

}

module.exports = { start }
