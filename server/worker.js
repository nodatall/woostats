const cron = require('./lib/cron')
const statsCache = require('./lib/statsCache')
const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTotalMarketVolumeHistory = require('./commands/updateTotalMarketVolumeHistory')
const updateDailyExchangeVolume = require('./commands/updateDailyExchangeVolume')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWooTokenBurns = require('./commands/updateWooTokenBurns')
const updateWooDaoTreasuryBalance = require('./commands/updateWooDaoTreasuryBalance')
const getExchangeVolume = require('./queries/getExchangeVolume')
const getWooTokenBurns = require('./queries/getWooTokenBurns')
const getWooDaoTreasuryBalance = require('./queries/getWooDaoTreasuryBalance')
const getTotalMarketVolumeHistory = require('./queries/getTotalMarketVolumeHistory')

function start(socket){
  if (process.env.INITIALIZE_ALL) intializeAllData(socket)

  cron.schedule('* * * * *', async () => { // once a minute
    const tokenTickers = await updateTokenTickers({ tokens: ['BTC', 'NEAR', 'AVAX', 'REF', 'WOO', 'BNB'] })
    statsCache.update({ tokenTickers })

    await updateDailyExchangeVolume({ exchangeId: 'wootrade' })
    await updateDailyExchangeVolume({ exchangeId: 'woo_network_futures' })
    await updateTotalMarketVolumeHistory()

    const aggregateVolume = await getTotalMarketVolumeHistory()
    const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })

    statsCache.update({ aggregateVolume, wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { tokenTickers, aggregateVolume, wooSpotVolume, wooFuturesVolume })
  })

  cron.schedule('0 * * * *', async () => { // once an hour
    await updateWooTokenBurns()
    const wooTokenBurns = await getWooTokenBurns()
    statsCache.update({ wooTokenBurns })
    socket.emit('send', { wooTokenBurns })
  })

  cron.schedule('*/5 * * * *', async () => { // every 5 minutes
    await updateWooDaoTreasuryBalance()
    const wooDaoTreasuryBalance = await getWooDaoTreasuryBalance()
    statsCache.update({ wooDaoTreasuryBalance })
    socket.emit('send', { wooDaoTreasuryBalance })
  })


  cron.schedule('0 0 * * *', async () => { // once a day
    await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
    await updateExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })
    const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })
    statsCache.update({ wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { wooSpotVolume, wooFuturesVolume })
  })
}

async function intializeAllData(socket) {
  const tokenTickers = await updateTokenTickers({ tokens: ['BTC', 'NEAR', 'AVAX', 'REF', 'WOO', 'BNB'] })
  statsCache.update({ tokenTickers })

  await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
  await updateDailyExchangeVolume({ exchangeId: 'wootrade' })
  await updateExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })
  await updateDailyExchangeVolume({ exchangeId: 'woo_network_futures' })
  await updateTotalMarketVolumeHistory()
  await updateWooTokenBurns()

  const aggregateVolume = await getTotalMarketVolumeHistory()
  const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })
  const wooTokenBurns = await getWooTokenBurns()

  statsCache.update({ aggregateVolume, wooSpotVolume, wooFuturesVolume })
  socket.emit('send', { tokenTickers, aggregateVolume, wooSpotVolume, wooTokenBurns, wooFuturesVolume })

}

module.exports = { start }
