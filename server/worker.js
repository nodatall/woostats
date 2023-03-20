const cron = require('./lib/cron')
const memoryCache = require('./lib/memoryCache')
const { TOKEN_IDS } = require('./lib/constants.js')

const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTotalMarketVolumeHistory = require('./commands/updateTotalMarketVolumeHistory')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWooTokenBurns = require('./commands/updateWooTokenBurns')
const updateWooDaoTreasury = require('./commands/updateWooDaoTreasury')
const updateWooFiEventsForLast = require('./commands/updateWooFiEventsForLast')

const getExchangeVolume = require('./queries/getExchangeVolume')
const getWooTokenBurns = require('./queries/getWooTokenBurns')
const getWooDaoTreasuryBalance = require('./queries/getWooDaoTreasuryBalance')
const getTotalMarketVolumeHistory = require('./queries/getTotalMarketVolumeHistory')

function start(socket){
  cron.schedule('* * * * *', async () => { // minute
    const tokenTickers = await updateTokenTickers({ tokens: TOKEN_IDS })
    await memoryCache.update({ tokenTickers })

    const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })

    await memoryCache.update({ wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { tokenTickers, wooSpotVolume, wooFuturesVolume })
  })

  cron.schedule('*/10 * * * *', async () => { // 10 minutes
    await updateTotalMarketVolumeHistory()
    const aggregateVolume = await getTotalMarketVolumeHistory()
    await memoryCache.update({ aggregateVolume })
    socket.emit('send', { aggregateVolume })
  })

  cron.schedule('0 * * * *', async () => { // hour
    await updateWooFiEventsForLast({ hours: 12, socket })
  })

  cron.schedule('0 0 * * *', async () => { // day
    await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
    await updateExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })
    const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })
    await memoryCache.update({ wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { wooSpotVolume, wooFuturesVolume })
  })
}

module.exports = { start }
