const cron = require('./lib/cron')
const memoryCache = require('./lib/memoryCache')
const { TOKEN_IDS } = require('./lib/constants.js')

const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTopExchangeVolumeHistories = require('./commands/updateTopExchangeVolumeHistories')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWooTokenBurns = require('./commands/updateWooTokenBurns')
const updateWooDaoTreasury = require('./commands/updateWooDaoTreasury')
const updateWooFiEventsForLast = require('./commands/updateWooFiEventsForLast')

const getExchangeVolumeHistory = require('./queries/getExchangeVolumeHistory')
const getWooTokenBurns = require('./queries/getWooTokenBurns')
const getWooDaoTreasuryBalance = require('./queries/getWooDaoTreasuryBalance')
const getTotalMarketVolumeHistory = require('./queries/getTotalMarketVolumeHistory')

async function start(socket){
  cron.schedule('* * * * *', async () => { // minute
    const tokenTickers = await updateTokenTickers({ tokens: TOKEN_IDS })
    await memoryCache.update({ tokenTickers })

    const wooSpotVolume = await getExchangeVolumeHistory({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })

    await memoryCache.update({ wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { tokenTickers, wooSpotVolume, wooFuturesVolume })
  })

  cron.schedule('* * * * *', async () => { // minute
    await updateTopExchangeVolumeHistories({ memoryCache, socket})
  })

  cron.schedule('0 * * * *', async () => { // hour
    await updateWooFiEventsForLast({ hours: 12, socket })
  })

  cron.schedule('0 0 * * *', async () => { // day
    await updateExchangeVolumeHistory({ exchangeId: 'wootrade', forceUpdate: true })
    await updateExchangeVolumeHistory({ exchangeId: 'woo_network_futures', forceUpdate: true })
    const wooSpotVolume = await getExchangeVolumeHistory({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })
    await memoryCache.update({ wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { wooSpotVolume, wooFuturesVolume })
  })
}

module.exports = { start }
