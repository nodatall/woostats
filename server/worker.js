const cron = require('./lib/cron')
const memoryCache = require('./lib/memoryCache')
const { TOKEN_IDS } = require('./lib/constants.js')

const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTopExchangeVolumeHistories = require('./commands/updateTopExchangeVolumeHistories')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')

const getExchangeVolumeHistory = require('./queries/getExchangeVolumeHistory')

async function start(socket){
  cron.schedule('* * * * *', async () => { // minute
    updateTopExchangeVolumeHistories({ memoryCache, socket})

    const tokenTickers = await updateTokenTickers({ tokens: TOKEN_IDS })
    await memoryCache.update({ tokenTickers })

    const wooSpotVolume = await getExchangeVolumeHistory({ exchangeId: 'wootrade' })
    const wooFuturesVolume = await getExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })

    await memoryCache.update({ wooSpotVolume, wooFuturesVolume })
    socket.emit('send', { tokenTickers, wooSpotVolume, wooFuturesVolume })
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
