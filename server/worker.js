const cron = require('./lib/cron')
const memoryCache = require('./lib/memoryCache')
const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTotalMarketVolumeHistory = require('./commands/updateTotalMarketVolumeHistory')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWooTokenBurns = require('./commands/updateWooTokenBurns')
const updateWooDaoTreasury = require('./commands/updateWooDaoTreasury')
const getExchangeVolume = require('./queries/getExchangeVolume')
const getWooTokenBurns = require('./queries/getWooTokenBurns')
const getWooDaoTreasuryBalance = require('./queries/getWooDaoTreasuryBalance')
const getTotalMarketVolumeHistory = require('./queries/getTotalMarketVolumeHistory')
const updateWooFiEventsForLast = require('./commands/updateWooFiEventsForLast')

const TOKENS = [
  'BTC', 'NEAR', 'AVAX', 'REF2', 'WOO', 'BNB', 'ETH',
]

function start(socket){
  cron.schedule('* * * * *', async () => { // minute
    const tokenTickers = await updateTokenTickers({ tokens: TOKENS })
    await memoryCache.update({ tokenTickers })

    await updateTotalMarketVolumeHistory()
    const aggregateVolume = await getTotalMarketVolumeHistory()
    const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })

    await memoryCache.update({ aggregateVolume, wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { tokenTickers, aggregateVolume, wooSpotVolume, wooFuturesVolume })
  })

  cron.schedule('*/5 * * * *', async () => { // 5 minutes
    await updateWooDaoTreasury()
    const wooDaoTreasuryBalance = await getWooDaoTreasuryBalance()
    await memoryCache.update({ wooDaoTreasuryBalance })
    socket.emit('send', { wooDaoTreasuryBalance })
  })

  cron.schedule('0 * * * *', async () => { // hour
    await updateWooTokenBurns()
    await updateWooFiEventsForLast({ hours: 12, socket })
    const wooTokenBurns = await getWooTokenBurns()
    await memoryCache.update({ wooTokenBurns })
    socket.emit('send', { wooTokenBurns })
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
